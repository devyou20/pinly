/**
 * Verifies Row Level Security by direct API call, per the acceptance criteria —
 * proving the policies hold at the database, not merely that the UI hides things.
 *
 * Creates two throwaway users, exercises cross-user access, and deletes them
 * again in a finally block. Requires SUPABASE_SERVICE_ROLE_KEY in .env.local.
 *
 *   npm run verify:rls
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SVC = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const admin = createClient(URL, SVC, { auth: { persistSession: false } });

const results: { name: string; pass: boolean; detail: string }[] = [];
function check(name: string, pass: boolean, detail: string) {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}\n      ${detail}`);
}

const stamp = Date.now();
const users: string[] = [];

async function makeUser(tag: string) {
  const email = `rlstest_${tag}_${stamp}@example.com`;
  const password = "TestPassword123!";
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username: `rlstest_${tag}_${stamp}` },
  });
  if (error) throw new Error(`createUser ${tag}: ${error.message}`);
  users.push(data.user.id);

  const client = createClient(URL, ANON, { auth: { persistSession: false } });
  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  if (signInError) throw new Error(`signIn ${tag}: ${signInError.message}`);
  return { id: data.user.id, client };
}

async function main() {
  const A = await makeUser("a");
  const B = await makeUser("b");

  // --- criterion: signup creates a profiles row automatically -------------
  const { data: profA } = await admin.from("profiles").select("*").eq("id", A.id).maybeSingle();
  check(
    "signup auto-creates profiles row",
    !!profA,
    profA ? `profiles row exists, username=${profA.username}` : "no profiles row found",
  );

  // --- setup: A owns a private board, a public board, and a pin ----------
  const { data: priv, error: privErr } = await A.client
    .from("boards")
    .insert({ user_id: A.id, name: "A private", is_private: true })
    .select()
    .single();
  if (privErr) throw new Error(`private board insert: ${privErr.message}`);

  const { data: pub } = await A.client
    .from("boards")
    .insert({ user_id: A.id, name: "A public", is_private: false })
    .select()
    .single();

  const { data: pin, error: pinErr } = await A.client
    .from("pins")
    .insert({
      user_id: A.id,
      title: "A's pin",
      image_path: `${A.id}/test.jpg`,
      image_url: "https://example.com/test.jpg",
      width: 800,
      height: 1200,
    })
    .select()
    .single();
  if (pinErr) throw new Error(`pin insert: ${pinErr.message}`);

  // --- 1. B cannot read A's PRIVATE board --------------------------------
  const { data: bSeesPriv } = await B.client.from("boards").select("*").eq("id", priv.id);
  check(
    "B cannot read A's private board",
    (bSeesPriv?.length ?? 0) === 0,
    `returned ${bSeesPriv?.length ?? 0} rows (expected 0)`,
  );

  // --- 2. sanity: B CAN read A's public board (proves test is meaningful) -
  const { data: bSeesPub } = await B.client.from("boards").select("*").eq("id", pub!.id);
  check(
    "B can read A's public board (control)",
    (bSeesPub?.length ?? 0) === 1,
    `returned ${bSeesPub?.length ?? 0} rows (expected 1)`,
  );

  // --- 3. B cannot DELETE A's pin ----------------------------------------
  await B.client.from("pins").delete().eq("id", pin.id);
  const { data: stillThere } = await admin.from("pins").select("id").eq("id", pin.id);
  check(
    "B cannot delete A's pin",
    (stillThere?.length ?? 0) === 1,
    `pin still present after B's delete: ${(stillThere?.length ?? 0) === 1}`,
  );

  // --- 4. B cannot UPDATE A's pin ----------------------------------------
  await B.client.from("pins").update({ title: "hijacked" }).eq("id", pin.id);
  const { data: after } = await admin.from("pins").select("title").eq("id", pin.id).single();
  check(
    "B cannot update A's pin",
    after?.title === "A's pin",
    `title is "${after?.title}" (expected "A's pin")`,
  );

  // --- 5. B cannot forge a pin owned by A --------------------------------
  const { error: forgeErr } = await B.client.from("pins").insert({
    user_id: A.id,
    title: "forged",
    image_path: `${A.id}/forged.jpg`,
    image_url: "https://example.com/forged.jpg",
    width: 10,
    height: 10,
  });
  check(
    "B cannot insert a pin owned by A",
    !!forgeErr,
    forgeErr ? `rejected: ${forgeErr.code} ${forgeErr.message.slice(0, 60)}` : "INSERT SUCCEEDED",
  );

  // --- 6. anonymous cannot write ----------------------------------------
  const anon = createClient(URL, ANON, { auth: { persistSession: false } });
  const { error: anonErr } = await anon
    .from("pins")
    .insert({
      user_id: A.id,
      title: "anon",
      image_path: "x/y.jpg",
      image_url: "https://example.com/y.jpg",
      width: 1,
      height: 1,
    });
  check(
    "anonymous cannot insert a pin",
    !!anonErr,
    anonErr ? `rejected: ${anonErr.code}` : "INSERT SUCCEEDED",
  );

  // --- 7. B cannot update A's profile ------------------------------------
  await B.client.from("profiles").update({ bio: "hijacked" }).eq("id", A.id);
  const { data: profAfter } = await admin.from("profiles").select("bio").eq("id", A.id).single();
  check(
    "B cannot update A's profile",
    profAfter?.bio !== "hijacked",
    `bio is ${JSON.stringify(profAfter?.bio)} (expected null)`,
  );
}

main()
  .catch((e) => {
    console.error("\nERROR:", e.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    for (const id of users) await admin.auth.admin.deleteUser(id);
    console.log(`\ncleaned up ${users.length} test users`);
    const failed = results.filter((r) => !r.pass);
    console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
    if (failed.length) process.exitCode = 1;
  });
