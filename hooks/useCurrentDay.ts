"use client";

import { useSyncExternalStore } from "react";

const serverDay = "";
let currentDay = "";
let interval: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();

function readLocalDay() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function refreshDay() {
  const nextDay = readLocalDay();
  if (nextDay === currentDay) return;
  currentDay = nextDay;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  refreshDay();
  interval ??= setInterval(refreshDay, 60_000);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && interval) {
      clearInterval(interval);
      interval = undefined;
    }
  };
}

function getSnapshot() {
  return currentDay;
}

function getServerSnapshot() {
  return serverDay;
}

export function useCurrentDay() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
