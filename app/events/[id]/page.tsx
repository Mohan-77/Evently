import { notFound } from "next/navigation";
import { EventDetails } from "@/components/events/EventDetails";
import { getEvent } from "@/data/events";
import { events } from "@/data/events";

export function generateStaticParams() {
  return events.map((event) => ({ id: event.id }));
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = getEvent(id);
  if (!event) notFound();
  return <EventDetails event={event} />;
}
