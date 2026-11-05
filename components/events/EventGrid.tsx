import type { Event } from "@/types/event";
import { EventCard } from "./EventCard";

export function EventGrid({ events, featured = false }: { events: Event[]; featured?: boolean }) {
  return <div className={`event-grid ${featured ? "featured-grid" : ""}`}>{events.map((event) => <EventCard key={event.id} event={event} featured={featured} />)}</div>;
}
