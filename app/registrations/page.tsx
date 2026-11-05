import { Suspense } from "react";
import { RegistrationPageClient } from "@/components/registration/RegistrationPageClient";

export default function RegistrationsPage() {
  return <main className="registration-page"><div className="shell"><Suspense fallback={<div className="registration-page-loading" role="status">Loading registration details…</div>}><RegistrationPageClient /></Suspense></div></main>;
}
