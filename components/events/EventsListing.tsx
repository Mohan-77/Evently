"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { EventFilters } from "@/components/events/EventFilters";
import { EventGrid } from "@/components/events/EventGrid";
import { categories, events } from "@/data/events";
import { getUpcomingEvents } from "@/lib/event-dates";
import { useCurrentDay } from "@/hooks/useCurrentDay";

export function EventsListing() {
  const searchParams = useSearchParams();
  const requestedCategory = searchParams.get("category");
  const initialCategory = categories.some((item) => item.name === requestedCategory) ? requestedCategory! : "All";
  const [query, setQuery] = useState("");
  const [categorySelection, setCategorySelection] = useState<{ routeCategory: string | null; value: string } | null>(null);
  const category = categorySelection?.routeCategory === requestedCategory ? categorySelection.value : initialCategory;
  const setCategory = (value: string) => setCategorySelection({ routeCategory: requestedCategory, value });
  const currentDay = useCurrentDay();
  const filtered = useMemo(() => {
    const queryTerms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const upcomingEvents = currentDay ? getUpcomingEvents(events, new Date()) : [];
    return upcomingEvents.filter((event) =>
      (category === "All" || event.category === category) &&
      queryTerms.every((term) => `${event.title} ${event.description} ${event.location} ${event.venue} ${event.category} ${event.host}`.toLowerCase().includes(term)),
    );
  }, [query, category, currentDay]);

  return (
    <main className="events-page">
      <div className="shell">
        <div className="page-heading">
          <span className="kicker">Make plans</span>
          <h1>Upcoming events</h1>
          <p>Small moments, big ideas, and the people you&apos;ll be glad you met.</p>
          <p className="sample-events-note">Sample campus event listings for demonstration; details are illustrative, not official KIIT announcements.</p>
        </div>
        <EventFilters query={query} setQuery={setQuery} category={category} setCategory={setCategory} />
        <div className="results-row">
          <span>{currentDay ? `${filtered.length} upcoming ${filtered.length === 1 ? "event" : "events"} found` : "Loading upcoming events…"}</span>
          <span className="sort-label">Soonest first</span>
        </div>
        {!currentDay ? <div className="events-loading-state" role="status">Loading events…</div> : filtered.length ? <EventGrid events={filtered} /> : <div className="empty-state"><span aria-hidden="true">⌕</span><h2>No upcoming events found</h2><p>Try another search or category.</p><button type="button" className="event-empty-reset" onClick={() => { setQuery(""); setCategory("All"); }}>Clear filters</button></div>}
      </div>
    </main>
  );
}
