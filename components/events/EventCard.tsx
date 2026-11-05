"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Heart, MapPin, Users } from "lucide-react";
import type { Event } from "@/types/event";
import { useFavorites } from "@/hooks/useFavorites";

export function EventCard({ event, featured = false }: { event: Event; featured?: boolean }) {
  const { favorites, toggleFavorite } = useFavorites();
  const saved = favorites.includes(event.id);
  return (
    <article className={`event-card ${featured ? "event-card-featured" : ""}`}>
      <div className="event-card-media">
        <Link href={`/events/${event.id}`} className="event-image" style={{ backgroundImage: `url(${event.image})` }} aria-label={`View ${event.title}`}>
          <span className="image-wash" />
          {featured && <span className="featured-label">Featured</span>}
        </Link>
        <button className={`heart-button ${saved ? "saved" : ""}`} onClick={() => toggleFavorite(event.id)} aria-label={saved ? "Remove saved event" : "Save event"} aria-pressed={saved}><Heart size={18} fill={saved ? "currentColor" : "none"} /></button>
      </div>
      <div className="event-card-body">
        <Link href={`/events/${event.id}`} className="event-card-title"><h3>{event.title}</h3></Link>
        <span className="event-pill">{event.category}</span>
        <p className="event-card-description">{event.description}</p>
        <p className="event-meta"><CalendarDays size={14} /> {event.date} <span aria-hidden="true">·</span> {event.time}</p>
        <p className="event-location"><MapPin size={14} /> {event.venue}{event.location !== event.venue ? ` · ${event.location}` : ""}</p>
        <p className="event-attendees"><Users size={14} /> {event.attendees} attending</p>
        <div className="event-card-bottom"><span className="price">{event.price}</span><Link href={`/events/${event.id}`} className="event-details-link">View Details <ArrowRight size={14} /></Link></div>
      </div>
    </article>
  );
}
