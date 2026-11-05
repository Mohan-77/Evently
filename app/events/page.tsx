import { Suspense } from "react";
import { EventsListing } from "@/components/events/EventsListing";

export default function EventsPage() {
  return <Suspense fallback={<main className="events-page"><div className="shell"><div className="events-loading-state" role="status">Loading events…</div></div></main>}><EventsListing /></Suspense>;
}
