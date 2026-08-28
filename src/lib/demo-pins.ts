import type { PinWithAuthor } from "@/types/database";

/**
 * Placeholder feed data used until the Supabase seed runs (Phase 7).
 * Aspect ratios are deliberately mixed so the masonry layout is exercised.
 */

const AUTHORS = [
  { id: "d1", username: "mayaocean", full_name: "Maya Okonkwo", avatar_url: null },
  { id: "d2", username: "studio.rin", full_name: "Rin Takahashi", avatar_url: null },
  { id: "d3", username: "arlo.builds", full_name: "Arlo Bennett", avatar_url: null },
  { id: "d4", username: "verdeleaf", full_name: "Sofia Vergara-Lim", avatar_url: null },
  { id: "d5", username: "northbound", full_name: "Kai Andersen", avatar_url: null },
];

const TITLES = [
  "Slow morning kitchen, warm oak and linen",
  "Brutalist stair detail, Lisbon",
  "Terracotta and sage colour study",
  "Reading nook under the eaves",
  "Wild meadow planting scheme",
  "Handbuilt ceramic mug set",
  "Coastal cabin, cedar cladding",
  "Risograph poster experiments",
  "Autumn layering, muted palette",
  "Studio corner with north light",
  "Weeknight pasta, blistered tomato",
  "Desert road at golden hour",
  "Minimal desk setup, walnut",
  "Botanical pressing frames",
  "Concrete and glass courtyard",
  "Linen bedding in soft ochre",
  "Hand-lettered signage study",
  "Foraged table centrepiece",
];

/** Tall 2:3, square, and wide 3:2 — the three ratios that stress masonry. */
const RATIOS: [number, number][] = [
  [800, 1200],
  [800, 800],
  [1200, 800],
  [800, 1000],
  [900, 1350],
  [1000, 750],
];

export const DEMO_PINS: PinWithAuthor[] = Array.from({ length: 60 }, (_, i) => {
  const [width, height] = RATIOS[i % RATIOS.length];
  const author = AUTHORS[i % AUTHORS.length];
  const seed = `pinly-${i}`;

  return {
    id: `demo-${i}`,
    user_id: author.id,
    board_id: null,
    title: TITLES[i % TITLES.length],
    description: null,
    link: null,
    image_path: `demo/${seed}`,
    image_url: `https://picsum.photos/seed/${seed}/${width}/${height}`,
    width,
    height,
    // Fixed epoch so server and client render identical markup.
    created_at: new Date(1735689600000 - i * 3_600_000).toISOString(),
    author,
  };
});
