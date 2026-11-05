import type { Event } from "@/types/event";

const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

function getEventDateKey(event: Event, referenceDate: Date): number | null {
  const match = event.date.trim().match(/^(?:[A-Za-z]{3,9},?\s+)?([A-Za-z]{3,9})\s+(\d{1,2})(?:,?\s+(\d{4}))?$/);
  if (!match) return null;

  const month = monthNames.findIndex((name) => name === match[1].slice(0, 3).toLowerCase());
  const day = Number(match[2]);
  if (month < 0 || day < 1 || day > 31) return null;

  const explicitYear = match[3] ? Number(match[3]) : null;
  const currentYear = referenceDate.getFullYear();
  const todayKey = currentYear * 10_000 + (referenceDate.getMonth() + 1) * 100 + referenceDate.getDate();
  let year = explicitYear ?? currentYear;

  for (let attempts = 0; attempts < (explicitYear ? 1 : 8); attempts += 1) {
    const candidate = new Date(year, month, day, 12);
    if (candidate.getFullYear() !== year || candidate.getMonth() !== month || candidate.getDate() !== day) {
      if (explicitYear) return null;
      year += 1;
      continue;
    }

    const key = year * 10_000 + (month + 1) * 100 + day;
    if (explicitYear || key >= todayKey) return key;
    year += 1;
  }

  return null;
}

function parseClockTime(value: string) {
  const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  const [, hourText, minuteText, meridiem] = match;
  const hourValue = Number(hourText);
  const minute = Number(minuteText);
  if (hourValue < 1 || hourValue > 12 || minute > 59) return null;
  const hour = (hourValue % 12) + (meridiem.toUpperCase() === "PM" ? 12 : 0);
  return { hour, minute };
}

export function getEventSchedule(event: Event, referenceDate = new Date()) {
  const dateKey = getEventDateKey(event, referenceDate);
  if (dateKey === null) return null;
  const times = event.time.match(/\d{1,2}:\d{2}\s*(?:AM|PM)/gi) ?? [];
  if (times.length < 2) return null;
  const start = times[0] ? parseClockTime(times[0]) : null;
  const end = times[1] ? parseClockTime(times[1]) : null;
  if (!start || !end) return null;

  const year = Math.floor(dateKey / 10_000);
  const month = Math.floor((dateKey % 10_000) / 100) - 1;
  const day = dateKey % 100;
  // Event times are campus-local KIIT times (IST, UTC+05:30), regardless of browser timezone.
  const campusOffset = 330 * 60_000;
  const startsAt = new Date(Date.UTC(year, month, day, start.hour, start.minute) - campusOffset);
  const endsAt = new Date(Date.UTC(year, month, day, end.hour, end.minute) - campusOffset);
  if (endsAt <= startsAt) endsAt.setDate(endsAt.getDate() + 1);
  return { startsAt, endsAt };
}

export function getEventStatus(event: Event, referenceDate = new Date()) {
  const schedule = getEventSchedule(event, referenceDate);
  if (!schedule) return "unknown" as const;
  if (referenceDate < schedule.startsAt) return "upcoming" as const;
  if (referenceDate < schedule.endsAt) return "in-progress" as const;
  return "ended" as const;
}

export function isUpcomingEvent(event: Event, referenceDate = new Date()) {
  return getEventStatus(event, referenceDate) === "upcoming";
}

export function getUpcomingEvents(events: Event[], referenceDate = new Date()) {
  return events
    .map((event) => ({ event, schedule: getEventSchedule(event, referenceDate) }))
    .filter((item): item is { event: Event; schedule: NonNullable<ReturnType<typeof getEventSchedule>> } => item.schedule !== null && item.schedule.startsAt > referenceDate)
    .sort((first, second) => first.schedule.startsAt.getTime() - second.schedule.startsAt.getTime())
    .map(({ event }) => event);
}
