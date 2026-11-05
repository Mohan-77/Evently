"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { EventRegistration } from "@/types/registration";

const STORAGE_KEY = "evently-registrations";
const serverSnapshot = { registrations: [] as EventRegistration[], isLoaded: false, storageError: "" };
let clientSnapshot = serverSnapshot;
const listeners = new Set<() => void>();

export type AddRegistrationResult = { ok: true } | { ok: false; error: string };

function emitChange() {
  listeners.forEach((listener) => listener());
}

function isRegistration(value: unknown): value is EventRegistration {
  if (typeof value !== "object" || value === null) return false;
  const registration = value as Partial<EventRegistration>;
  return [
    registration.id,
    registration.registeredAt,
    registration.eventId,
    registration.eventTitle,
    registration.eventDate,
    registration.eventTime,
    registration.eventVenue,
    registration.eventLocation,
    registration.eventImage,
    registration.eventCategory,
    registration.participantName,
    registration.email,
    registration.phone,
  ].every((field) => typeof field === "string") && Number.isFinite(Date.parse(registration.registeredAt!));
}

function loadFromStorage() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    const registrations = Array.isArray(parsed) ? parsed.filter(isRegistration) : [];
    clientSnapshot = { registrations, isLoaded: true, storageError: "" };
  } catch {
    clientSnapshot = {
      registrations: clientSnapshot.registrations,
      isLoaded: true,
      storageError: "Saved registrations could not be loaded from this browser.",
    };
  }
  emitChange();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (typeof window !== "undefined" && !clientSnapshot.isLoaded) queueMicrotask(loadFromStorage);
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) loadFromStorage();
  };
  window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

function getSnapshot() {
  return clientSnapshot;
}

function getServerSnapshot() {
  return serverSnapshot;
}

export function useRegistrations() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const persist = useCallback((registrations: EventRegistration[]) => {
    if (typeof window === "undefined" || !clientSnapshot.isLoaded) return false;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
      clientSnapshot = { registrations, isLoaded: true, storageError: "" };
      emitChange();
      return true;
    } catch {
      clientSnapshot = {
        ...clientSnapshot,
        storageError: "Your browser could not save this registration. Check your storage settings and try again.",
      };
      emitChange();
      return false;
    }
  }, []);

  const addRegistration = useCallback((registration: EventRegistration) => {
    if (!clientSnapshot.isLoaded) return { ok: false, error: "Registration options are still loading. Please try again." } satisfies AddRegistrationResult;
    const normalizedEmail = registration.email.trim().toLowerCase();
    const duplicate = clientSnapshot.registrations.some((saved) =>
      saved.eventId === registration.eventId && saved.email.trim().toLowerCase() === normalizedEmail,
    );
    if (duplicate) return { ok: false, error: "You are already registered for this event with this email address." } satisfies AddRegistrationResult;
    if (!persist([...clientSnapshot.registrations, registration])) {
      return { ok: false, error: clientSnapshot.storageError || "Your registration could not be saved. Please try again." } satisfies AddRegistrationResult;
    }
    return { ok: true } satisfies AddRegistrationResult;
  }, [persist]);

  const cancelRegistration = useCallback((registrationId: string) => {
    return persist(clientSnapshot.registrations.filter((registration) => registration.id !== registrationId));
  }, [persist]);

  return { ...snapshot, addRegistration, cancelRegistration };
}
