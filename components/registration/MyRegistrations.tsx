"use client";

import Link from "next/link";
import { CalendarDays, Clock3, MapPin, TicketX } from "lucide-react";
import { useState } from "react";
import { useRegistrations } from "@/hooks/useRegistrations";

export function MyRegistrations() {
  const { registrations, isLoaded, storageError, cancelRegistration } = useRegistrations();
  const [actionMessage, setActionMessage] = useState("");

  if (!isLoaded) return <section className="my-registrations-state" role="status">Loading your saved registrations…</section>;

  return (
    <section className="my-registrations">
      <header className="my-registrations-heading">
        <span className="kicker">Your Evently account</span>
        <h1>My registrations</h1>
        <p>Keep track of the events you&apos;re planning to attend.</p>
      </header>

      {storageError && <p className="registration-storage-error" role="alert">{storageError}</p>}
      {actionMessage && <p className="registration-action-message" role="status">{actionMessage}</p>}

      {registrations.length === 0 ? (
        <div className="my-registrations-empty">
          <span className="empty-ticket-icon"><TicketX size={24} /></span>
          <h2>No registrations yet</h2>
          <p>When you reserve a spot, the event will appear here.</p>
          <Link href="/events" className="button button-dark">Explore events</Link>
        </div>
      ) : (
        <div className="my-registrations-list">
          {registrations.map((registration) => (
            <article className="my-registration-card" key={registration.id}>
              <div className="my-registration-image" style={{ backgroundImage: `url(${registration.eventImage})` }} role="img" aria-label={`${registration.eventTitle} event`} />
              <div className="my-registration-info">
                <span className="event-pill">{registration.eventCategory}</span>
                <h2>{registration.eventTitle}</h2>
                <p><CalendarDays size={15} /> {registration.eventDate}</p>
                <p><Clock3 size={15} /> {registration.eventTime}</p>
                <p><MapPin size={15} /> {registration.eventVenue} · {registration.eventLocation}</p>
                <div className="my-registration-person">
                  <span>Registered for {registration.participantName}</span>
                  <small>{registration.email} · {registration.phone}</small>
                </div>
              </div>
              <div className="my-registration-actions">
                <span className="registration-saved-date">Saved {new Date(registration.registeredAt).toLocaleDateString()}</span>
                <button type="button" className="cancel-registration-button" onClick={() => {
                  if (cancelRegistration(registration.id)) setActionMessage(`Your registration for ${registration.eventTitle} was cancelled.`);
                }}>Cancel registration</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
