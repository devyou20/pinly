"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import {
  Bell,
  ChevronDown,
  LogOut,
  MessageCircle,
  Search,
  Settings,
  User,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Avatar } from "@/components/ui/Avatar";
import { IconButton, buttonClasses } from "@/components/ui/Button";
import {
  Dropdown,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownLink,
} from "@/components/ui/Dropdown";
import { SearchBar } from "./SearchBar";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/database";

export interface TopNavProps {
  /** null when signed out. */
  profile: Pick<Profile, "id" | "username" | "full_name" | "avatar_url"> | null;
  onSignOut?: () => void;
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "hidden h-12 shrink-0 items-center rounded-pill px-4 text-base font-semibold",
        "transition-colors duration-200 md:inline-flex",
        active
          ? "bg-ink text-bg"
          : "text-ink hover:bg-secondary",
      )}
    >
      {children}
    </Link>
  );
}

export function TopNav({ profile, onSignOut }: TopNavProps) {
  return (
    <header className="sticky top-0 z-50 h-20 w-full bg-bg">
      <nav
        aria-label="Main"
        className="mx-auto flex h-20 w-full items-center gap-2 px-2 sm:px-4"
      >
        <Logo />

        <NavLink href="/">Home</NavLink>
        <NavLink href="/create">Create</NavLink>

        {/* Below sm there is no room for logo + field + two auth pills, so the
            field collapses to an icon that opens the dedicated search page. */}
        <Link
          href="/search"
          aria-label="Search"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-ink transition-colors duration-200 hover:bg-secondary sm:hidden"
        >
          <Search className="size-6" />
        </Link>

        <div className="hidden min-w-0 flex-1 sm:flex">
          <Suspense fallback={<div className="h-12 w-full rounded-pill bg-field" />}>
            <SearchBar className="mx-2" />
          </Suspense>
        </div>

        <span className="flex-1 sm:hidden" aria-hidden="true" />

        {profile ? (
          <div className="flex shrink-0 items-center gap-1">
            <IconButton
              label="Notifications"
              variant="ghost"
              className="hidden text-ink-muted hover:text-ink sm:inline-flex"
            >
              <Bell className="size-6" />
            </IconButton>

            <IconButton
              label="Messages"
              variant="ghost"
              className="hidden text-ink-muted hover:text-ink sm:inline-flex"
            >
              <MessageCircle className="size-6" />
            </IconButton>

            <Dropdown
              label="Account menu"
              trigger={(triggerProps) => (
                <button
                  type="button"
                  {...triggerProps}
                  aria-label="Account menu"
                  className="flex items-center gap-0.5 rounded-full p-1 transition-colors duration-200 hover:bg-secondary"
                >
                  <Avatar
                    src={profile.avatar_url}
                    name={profile.full_name}
                    username={profile.username}
                    size="sm"
                  />
                  <ChevronDown className="size-4 text-ink-muted" aria-hidden="true" />
                </button>
              )}
            >
              {(close) => (
                <>
                  <DropdownLabel>Currently in</DropdownLabel>

                  <Link
                    href={`/${profile.username}`}
                    onClick={close}
                    role="menuitem"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-secondary"
                  >
                    <Avatar
                      src={profile.avatar_url}
                      name={profile.full_name}
                      username={profile.username}
                      size="md"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-ink">
                        {profile.full_name || profile.username}
                      </span>
                      <span className="block truncate text-xs text-ink-muted">
                        @{profile.username}
                      </span>
                    </span>
                  </Link>

                  <DropdownDivider />

                  <DropdownLink href={`/${profile.username}`} onClick={close}>
                    <User className="size-4" aria-hidden="true" />
                    Profile
                  </DropdownLink>

                  <DropdownLink href="/settings" onClick={close}>
                    <Settings className="size-4" aria-hidden="true" />
                    Settings
                  </DropdownLink>

                  <DropdownDivider />

                  <DropdownItem
                    destructive
                    onClick={() => {
                      close();
                      onSignOut?.();
                    }}
                  >
                    <LogOut className="size-4" aria-hidden="true" />
                    Log out
                  </DropdownItem>
                </>
              )}
            </Dropdown>
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/login"
              className={buttonClasses({
                variant: "primary",
                className: "px-3 text-sm sm:px-4 sm:text-[15px]",
              })}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className={buttonClasses({
                variant: "secondary",
                className: "px-3 text-sm sm:px-4 sm:text-[15px]",
              })}
            >
              Sign up
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
