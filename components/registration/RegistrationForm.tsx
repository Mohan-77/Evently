"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { events } from "@/data/events";
import { getUpcomingEvents } from "@/lib/event-dates";
import { Button } from "@/components/ui/Button";
import { useRegistrations } from "@/hooks/useRegistrations";
import { useCurrentDay } from "@/hooks/useCurrentDay";
import type { EventRegistration } from "@/types/registration";
import { RegistrationSuccess } from "./RegistrationSuccess";

type FormField = "name" | "email" | "phone" | "event" | "updates";
type FieldErrors = Partial<Record<FormField, string>>;

export function RegistrationForm({ eventId }: { eventId?: string }) {
  const [selection, setSelection] = useState<{ eventId: string | undefined; value: string } | null>(null);
  const selectedEventId = selection && selection.eventId === eventId ? selection.value : eventId ?? "";
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submissionError, setSubmissionError] = useState("");
  const [submittedRegistration, setSubmittedRegistration] = useState<EventRegistration | null>(null);
  const { addRegistration, isLoaded, storageError } = useRegistrations();
  const currentDay = useCurrentDay();
  const availableEvents = currentDay ? getUpcomingEvents(events, new Date()) : [];
  const event = availableEvents.find((item) => item.id === selectedEventId);

  function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setSubmissionError("");
    const data = new FormData(formEvent.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const phoneDigits = phone.replace(/\D/g, "");
    const errors: FieldErrors = {};

    if (name.length < 2 || name.length > 80) errors.name = "Enter a name between 2 and 80 characters.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";
    if (!/^\+?[\d\s().-]+$/.test(phone) || phoneDigits.length < 10 || phoneDigits.length > 15) {
      errors.phone = "Enter a valid phone number with 10 to 15 digits.";
    }
    if (!event) errors.event = "Choose an upcoming event.";
    if (data.get("updates") !== "on") errors.updates = "Please agree to receive essential registration updates.";

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    if (!event) return;

    const registration: EventRegistration = {
      id: crypto.randomUUID(),
      registeredAt: new Date().toISOString(),
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.time,
      eventVenue: event.venue,
      eventLocation: event.location,
      eventImage: event.image,
      eventCategory: event.category,
      participantName: name,
      email,
      phone,
      message,
    };

    if (!isLoaded) {
      setSubmissionError("Registration options are still loading. Please try again.");
      return;
    }
    const saveResult = addRegistration(registration);
    if (!saveResult.ok) {
      setSubmissionError(saveResult.error || storageError || "Your registration could not be saved. Please try again.");
      return;
    }

    setSubmittedRegistration(registration);
  }

  if (submittedRegistration) return <RegistrationSuccess event={event} participantName={submittedRegistration.participantName} />;

  return (
    <div className="registration-layout">
      <div className="registration-intro">
        <Image src="/images/neon-nights.png" alt="Concert audience at a live university event" fill sizes="(max-width: 800px) 100vw, 40vw" className="registration-intro-image" />
        <div className="registration-intro-content">
          <span className="kicker">Your next good thing</span>
          <h1>Save your seat.</h1>
          <p>Tell us a little about yourself and we&apos;ll save your spot. No spam, ever — just the details you need for a lovely time.</p>
          <div className="perks"><span><Check size={16} /> Free to join</span><span><Check size={16} /> Instant confirmation</span></div>
        </div>
      </div>

      <form className="registration-form" onSubmit={handleSubmit} noValidate>
        <h2>{event ? event.title : "Choose an event"}</h2>
        <p className="form-event-meta">{event ? `${event.date} · ${event.location}` : "Select an upcoming event and enter your details to reserve a spot."}</p>

        <label htmlFor="registration-event">Event
          <select id="registration-event" name="event" required value={selectedEventId} onChange={(changeEvent) => { setSelection({ eventId, value: changeEvent.target.value }); setFieldErrors((current) => ({ ...current, event: undefined })); }} aria-invalid={Boolean(fieldErrors.event)} aria-describedby={fieldErrors.event ? "registration-event-error" : undefined}>
            <option value="">Choose an upcoming event</option>
            {availableEvents.map((availableEvent) => <option key={availableEvent.id} value={availableEvent.id}>{availableEvent.title} · {availableEvent.date}</option>)}
          </select>
          {fieldErrors.event && <span className="form-field-error" id="registration-event-error">{fieldErrors.event}</span>}
        </label>

        <label htmlFor="registration-name">Full name
          <input id="registration-name" name="name" required autoComplete="name" placeholder="Your name" aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? "registration-name-error" : undefined} />
          {fieldErrors.name && <span className="form-field-error" id="registration-name-error">{fieldErrors.name}</span>}
        </label>

        <label htmlFor="registration-email">Email address
          <input id="registration-email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? "registration-email-error" : undefined} />
          {fieldErrors.email && <span className="form-field-error" id="registration-email-error">{fieldErrors.email}</span>}
        </label>

        <label htmlFor="registration-phone">Phone number
          <input id="registration-phone" name="phone" type="tel" required autoComplete="tel" inputMode="tel" placeholder="+91 98765 43210" aria-invalid={Boolean(fieldErrors.phone)} aria-describedby={fieldErrors.phone ? "registration-phone-error" : undefined} />
          {fieldErrors.phone && <span className="form-field-error" id="registration-phone-error">{fieldErrors.phone}</span>}
        </label>

        <label htmlFor="registration-message">Anything we should know? <span className="optional">Optional</span>
          <textarea id="registration-message" name="message" rows={3} placeholder="Accessibility needs, dietary preferences..." />
        </label>

        <label className="checkbox" htmlFor="registration-updates">
          <input id="registration-updates" name="updates" type="checkbox" required aria-invalid={Boolean(fieldErrors.updates)} aria-describedby={fieldErrors.updates ? "registration-updates-error" : undefined} />
          <span>I agree to receive event updates from Evently.</span>
        </label>
        {fieldErrors.updates && <p className="form-field-error" id="registration-updates-error">{fieldErrors.updates}</p>}
        {(submissionError || storageError) && <p className="form-submission-error" role="alert">{submissionError || storageError}</p>}
        <Button className="button-dark" type="submit" disabled={!isLoaded || !currentDay}>
          Complete registration <ArrowRight size={16} />
        </Button>
        {(!isLoaded || !currentDay) && <p className="form-loading" role="status">Loading registration options…</p>}
        <p className="registration-manage-link"><Link href="/registrations?view=mine">View your registrations</Link></p>
      </form>
    </div>
  );
}
