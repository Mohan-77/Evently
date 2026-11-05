"use client";

import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, CalendarDays, ChevronDown, Clock3, GraduationCap, Laptop, MapPin, Music2, Palette, Search, Trophy, Users } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { events } from "@/data/events";
import { EventGrid } from "@/components/events/EventGrid";
import { getEventSchedule, getUpcomingEvents } from "@/lib/event-dates";
import { useCurrentDay } from "@/hooks/useCurrentDay";

const dashboardCategories = [
  { name: "Technology", icon: Laptop, detail: "Conferences, Hackathons", className: "category-tech" },
  { name: "Music", icon: Music2, detail: "Concerts, Festivals", className: "category-music" },
  { name: "Sports", icon: Trophy, detail: "Tournaments, Leagues", className: "category-sports" },
  { name: "Business", icon: BriefcaseBusiness, detail: "Meetups, Networking", className: "category-business" },
  { name: "Art & Design", icon: Palette, detail: "Workshops, Exhibitions", className: "category-art" },
  { name: "Education", icon: GraduationCap, detail: "Seminars, Training", className: "category-education" },
];
const campusOptions = [...new Set(events.map((event) => event.location))].sort();

type CountdownUnit = { label: string; value: string };
type CountdownState = { status: "loading" | "countdown" | "active" | "empty"; units: CountdownUnit[] };

function getCountdownState(now: Date, eventData = events): CountdownState {
  const scheduled = eventData
    .map((event) => ({ event, schedule: getEventSchedule(event, now) }))
    .filter((item): item is { event: (typeof events)[number]; schedule: NonNullable<ReturnType<typeof getEventSchedule>> } => item.schedule !== null)
    .sort((first, second) => first.schedule.startsAt.getTime() - second.schedule.startsAt.getTime());

  const active = scheduled.find((item) => item.schedule.startsAt <= now && item.schedule.endsAt > now);
  if (active) return { status: "active", units: [] };

  const next = scheduled.find((item) => item.schedule.startsAt > now);
  if (next) {
    const secondsLeft = Math.max(0, Math.floor((next.schedule.startsAt.getTime() - now.getTime()) / 1000));
    const days = Math.floor(secondsLeft / 86_400);
    const hours = Math.floor((secondsLeft % 86_400) / 3_600);
    const minutes = Math.floor((secondsLeft % 3_600) / 60);
    const seconds = secondsLeft % 60;
    return { status: "countdown", units: [
      { label: "Days", value: String(days).padStart(2, "0") },
      { label: "Hours", value: String(hours).padStart(2, "0") },
      { label: "Minutes", value: String(minutes).padStart(2, "0") },
      { label: "Seconds", value: String(seconds).padStart(2, "0") },
    ] };
  }

  return { status: "empty", units: [] };
}

function CountdownTimer() {
  const [countdown, setCountdown] = useState<CountdownState>({ status: "loading", units: [] });

  useEffect(() => {
    const updateCountdown = () => setCountdown(getCountdownState(new Date()));
    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="countdown-content" aria-live={countdown.status === "countdown" ? "off" : "polite"}>
      <div className="countdown-heading"><Clock3 size={16} strokeWidth={1.8} aria-hidden="true" /><span>NEXT EVENT STARTS IN</span></div>
      {countdown.status === "countdown" ? (
        <>
          <div className="countdown-unit-grid" aria-label="Time until the next event">
            {countdown.units.map((unit) => <span className="countdown-unit" key={unit.label}><strong>{unit.value}</strong><small>{unit.label}</small></span>)}
          </div>
          <p className="countdown-support">Your next campus experience is getting closer.</p>
        </>
      ) : (
        <p className="countdown-status">{countdown.status === "active" ? "Happening now" : countdown.status === "empty" ? "No upcoming events" : "Loading countdown…"}</p>
      )}
    </div>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [campus, setCampus] = useState("All");
  const [dateRange, setDateRange] = useState("any");
  const [eventView, setEventView] = useState<"all" | "upcoming" | "popular" | "free">("upcoming");
  const currentDay = useCurrentDay();
  const visibleEvents = useMemo(
    () => {
      const referenceDate = currentDay ? new Date() : null;
      const sourceEvents = eventView === "all" || query.trim() ? events : referenceDate ? getUpcomingEvents(events, referenceDate) : [];
      const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
      let filtered = sourceEvents.filter((event) => {
        const schedule = referenceDate ? getEventSchedule(event, referenceDate) : null;
        const dateMatches = !referenceDate || dateRange === "any" || (schedule !== null && (
          dateRange === "month"
            ? schedule.startsAt.getMonth() === referenceDate.getMonth() && schedule.startsAt.getFullYear() === referenceDate.getFullYear()
            : schedule.startsAt >= referenceDate && schedule.startsAt <= new Date(referenceDate.getTime() + 30 * 24 * 60 * 60 * 1000)
        ));
        return (category === "All" || event.category === category) &&
          (campus === "All" || event.location === campus) &&
          dateMatches &&
          terms.every((term) => `${event.title} ${event.description} ${event.category} ${event.location} ${event.venue} ${event.host}`.toLowerCase().includes(term));
      });
      if (eventView === "free") filtered = filtered.filter((event) => event.price.toLowerCase() === "free");
      if (eventView === "popular") filtered = [...filtered].sort((first, second) => second.attendees - first.attendees);
      return filtered;
    },
    [campus, category, currentDay, dateRange, eventView, query],
  );

  function submitSearch(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setEventView("all");
    document.getElementById("home-event-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="dashboard-page">
      <section className="dashboard-hero">
        <div className="dashboard-hero-image" />
        <div className="dashboard-hero-glow" />
        <div className="shell dashboard-hero-content">
          <div className="hero-badge">✣ &nbsp; Campus &amp; Community Events</div>
          <h1>Discover, Book, and<br /><span>Manage Events</span><br />All in One Place.</h1>
          <p>Explore upcoming events, register instantly, and<br />never miss an experience that matters to you.</p>
          <div className="dashboard-actions"><Link href="/events" className="neon-button">Explore Events <ArrowRight size={17} /></Link><span className="outline-button unavailable-action" aria-disabled="true" title="Event creation is not available in this demonstration">Event creation unavailable</span></div>
          <div className="dashboard-stats"><span><CalendarDays /> <b>120+</b> Events</span><span><Users /> <b>10K+</b> Participants</span><span><MapPin /> <b>5+</b> Campuses</span></div>
        </div>
        <div className="next-event-card"><CountdownTimer /></div>
        <div className="registered-card"><div className="avatar-stack"><span>SK</span><span>MA</span><span>JD</span></div><b>+2.5K</b><small>Already Registered</small></div>
      </section>

      <section className="shell dashboard-content">
        <form className="dashboard-search" onSubmit={submitSearch}>
          <label className="dashboard-query"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search events (e.g. tech, music, sports...)" /></label>
          <label className="dashboard-search-filter"><MapPin size={16} /><select aria-label="Filter by campus" value={campus} onChange={(event) => setCampus(event.target.value)}><option value="All">All Campuses</option>{campusOptions.map((location) => <option key={location} value={location}>{location}</option>)}</select><ChevronDown size={14} /></label>
          <label className="dashboard-search-filter"><CalendarDays size={16} /><select aria-label="Filter by date" value={dateRange} onChange={(event) => setDateRange(event.target.value)}><option value="any">Any Date</option><option value="month">This Month</option><option value="30days">Next 30 Days</option></select><ChevronDown size={14} /></label>
          <button type="submit" className="search-submit">Search</button>
        </form>

        <div className="dashboard-section-head"><h2>Browse by Category</h2><Link href="/categories">View All Categories <ArrowRight size={14} /></Link></div>
        <div className="dashboard-category-grid">{dashboardCategories.map((item) => { const Icon = item.icon; return <button key={item.name} type="button" aria-pressed={category === item.name} className={`dashboard-category ${item.className} ${category === item.name ? "is-selected" : ""}`} onClick={() => { setCategory(category === item.name ? "All" : item.name); setEventView("upcoming"); }}><Icon aria-hidden="true" /><b>{item.name}</b><small>{item.detail}</small></button>; })}</div>

        <div className="dashboard-section-head featured-head" id="home-event-results"><h2>Featured Events</h2><div className="event-tabs" role="group" aria-label="Filter events"><button type="button" className={eventView === "all" ? "active" : ""} aria-pressed={eventView === "all"} onClick={() => setEventView("all")}>All Events</button><button type="button" className={eventView === "upcoming" ? "active" : ""} aria-pressed={eventView === "upcoming"} onClick={() => setEventView("upcoming")}>Upcoming</button><button type="button" className={eventView === "popular" ? "active" : ""} aria-pressed={eventView === "popular"} onClick={() => setEventView("popular")}>Popular</button><button type="button" className={eventView === "free" ? "active" : ""} aria-pressed={eventView === "free"} onClick={() => setEventView("free")}>Free</button></div><Link href="/events">View All Events <ArrowRight size={14} /></Link></div>
        <p className="dashboard-event-count" aria-live="polite">{visibleEvents.length} {visibleEvents.length === 1 ? "event" : "events"} found</p>
        {!currentDay ? <div className="dashboard-empty-state" role="status"><p>Loading upcoming events…</p></div> : visibleEvents.length ? <EventGrid events={visibleEvents} featured /> : <div className="dashboard-empty-state"><h3>No events found</h3><p>Try another search or category.</p><button type="button" className="event-empty-reset" onClick={() => { setQuery(""); setCategory("All"); setCampus("All"); setDateRange("any"); setEventView("all"); }}>Clear filters</button></div>}
      </section>
    </main>
  );
}
