"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { ArrowRight, CalendarDays, Menu, Search, UserRound, X } from "lucide-react";
import { Suspense } from "react";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { emptyUserProfile, isSafeProfileAvatar, isUserProfile, PROFILE_STORAGE_KEY, type UserProfile } from "@/types/profile";

function MyRegistrationsLink({ pathname, onNavigate }: { pathname: string; onNavigate: () => void }) {
  const searchParams = useSearchParams();
  const active = pathname.startsWith("/registrations") && searchParams.get("view") === "mine";
  return <Link href="/registrations?view=mine" aria-current={active ? "page" : undefined} className={active ? "is-active" : ""} onClick={onNavigate}>My Registrations</Link>;
}

function ProfileAvatar({ src }: { src?: string }) {
  return (
    <span className="nav-profile-mark" aria-hidden="true">
      <UserRound size={17} />
      {src && <Image src={src} alt="" width={32} height={32} unoptimized className="nav-profile-avatar" onError={(event) => { event.currentTarget.style.display = "none"; }} />}
    </span>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [profile] = useLocalStorage<UserProfile>(PROFILE_STORAGE_KEY, emptyUserProfile, isUserProfile);
  const profileAvatar = isSafeProfileAvatar(profile.avatar) ? profile.avatar : undefined;

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <header className="site-header">
      <div className="shell nav-inner">
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark"><CalendarDays size={18} strokeWidth={2.5} /></span>
          evently
        </Link>
        <nav id="mobile-site-nav" aria-label="Main navigation" className={`main-nav ${open ? "is-open" : ""}`}>
          <Link href="/" aria-current={pathname === "/" ? "page" : undefined} className={pathname === "/" ? "is-active" : ""} onClick={() => setOpen(false)}>Home</Link>
          <Link href="/events" aria-current={pathname.startsWith("/events") ? "page" : undefined} className={pathname.startsWith("/events") ? "is-active" : ""} onClick={() => setOpen(false)}>Events</Link>
          <Link href="/categories" aria-current={pathname === "/categories" ? "page" : undefined} className={pathname === "/categories" ? "is-active" : ""} onClick={() => setOpen(false)}>Categories</Link>
          <Link href="/profile" aria-current={pathname === "/profile" ? "page" : undefined} className={`profile-nav-link mobile-profile-link ${pathname === "/profile" ? "is-active" : ""}`} onClick={() => setOpen(false)}><ProfileAvatar src={profileAvatar} /><span>Profile</span></Link>
          <Suspense fallback={<Link href="/registrations?view=mine" onClick={() => setOpen(false)}>My Registrations</Link>}><MyRegistrationsLink pathname={pathname} onNavigate={() => setOpen(false)} /></Suspense>
          <Link href="/about" aria-current={pathname === "/about" ? "page" : undefined} className={pathname === "/about" ? "is-active" : ""} onClick={() => setOpen(false)}>About</Link>
          <Link href="/registrations" className="mobile-start" onClick={() => setOpen(false)}>Get Started <ArrowRight size={16} /></Link>
        </nav>
        <div className="nav-actions">
          <ThemeToggle />
          <Link href="/events" className="icon-button" aria-label="Search events"><Search size={19} /></Link>
          <Link href="/profile" aria-label="Profile" title="Profile" aria-current={pathname === "/profile" ? "page" : undefined} className={`profile-nav-action ${pathname === "/profile" ? "is-active" : ""}`} onClick={() => setOpen(false)}><ProfileAvatar src={profileAvatar} /></Link>
          <Link href="/registrations" className="button button-dark nav-cta" onClick={() => setOpen(false)}>Get Started <ArrowRight size={15} /></Link>
          <button type="button" className={`menu-toggle ${open ? "is-open" : ""}`} onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-site-nav">
            <Menu className="menu-toggle-menu-icon" size={22} aria-hidden="true" />
            <X className="menu-toggle-close-icon" size={22} aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
