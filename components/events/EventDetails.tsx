"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, CalendarDays, Clock3, MapPin, Share2, Users } from "lucide-react";
import type { Event } from "@/types/event";
import { Button } from "@/components/ui/Button";
import { getEventStatus } from "@/lib/event-dates";
import { useCurrentDay } from "@/hooks/useCurrentDay";

export function EventDetails({ event }: { event: Event }) {
  const [shareStatus, setShareStatus] = useState("");
  const currentDay = useCurrentDay();
  const eventStatus = currentDay ? getEventStatus(event, new Date()) : "upcoming";
  const upcoming = eventStatus === "upcoming";

  async function shareEvent() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: event.title, text: event.description, url });
      else {
        await navigator.clipboard.writeText(url);
        setShareStatus("Event link copied.");
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setShareStatus("Sharing isn’t available in this browser.");
    }
  }

  const statusLabel = eventStatus === "upcoming" ? "Registration open" : eventStatus === "in-progress" ? "Event is underway" : eventStatus === "ended" ? "Event has ended" : "Schedule unavailable";
  const statusDescription = eventStatus === "upcoming" ? "Save your seat today" : eventStatus === "in-progress" ? "Registration is closed while this event is underway" : eventStatus === "ended" ? "This event has finished" : "Please check back for schedule details";
  return <main className="detail-page"><div className="shell detail-shell"><Link href="/events" className="back-link"><ArrowLeft size={16} /> Back to all events</Link><div className="detail-layout"><div className="detail-main"><div className="detail-image" style={{ backgroundImage: `url(${event.image})` }} role="img" aria-label={`${event.title} event`} /><div className="detail-content"><span className="kicker">About this event</span><h2>Make room for a great experience.</h2><p className="detail-description">{event.description}</p><div className="host-row"><div className="avatar">{event.host.split(" ").map((name) => name[0]).join("")}</div><div><span className="muted-label">Hosted by</span><strong>{event.host}</strong><span className="host-role">{event.hostRole}</span></div></div></div></div><aside className="detail-aside"><span className="detail-category">{event.category}</span><h1>{event.title}</h1><p className="detail-aside-intro">Join the campus community for an experience worth showing up for.</p><div className="detail-facts"><div className="aside-block"><span className="aside-icon"><CalendarDays size={19} /></span><div><strong>{event.date}</strong><span>{event.time}</span></div></div><div className="aside-block"><span className="aside-icon"><MapPin size={19} /></span><div><strong>{event.venue}</strong><span>{event.location}</span></div></div><div className="aside-block"><span className="aside-icon"><Users size={19} /></span><div><strong>{event.attendees} people going</strong><span>Join a great community</span></div></div><div className="aside-block"><span className="aside-icon"><Clock3 size={19} /></span><div><strong>{statusLabel}</strong><span>{statusDescription}</span></div></div></div><div className="detail-ticket-row"><span>Admission</span><strong>{event.price}</strong></div>{upcoming ? <Button href={`/registrations?event=${event.id}`} className="button-dark detail-reserve">Reserve your spot <span>↗</span></Button> : <p className="event-closed-note">Registration is closed for this event.</p>}<button type="button" className="button button-outline detail-share" onClick={shareEvent}><Share2 size={16} /> Share event</button>{shareStatus && <p className="share-status" role="status">{shareStatus}</p>}</aside></div></div></main>;
}
