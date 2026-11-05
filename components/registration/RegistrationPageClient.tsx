"use client";

import { useSearchParams } from "next/navigation";
import { RegistrationForm } from "./RegistrationForm";
import { MyRegistrations } from "./MyRegistrations";

export function RegistrationPageClient() {
  const searchParams = useSearchParams();
  if (searchParams.get("view") === "mine") return <MyRegistrations />;
  return <RegistrationForm eventId={searchParams.get("event") ?? undefined} />;
}
