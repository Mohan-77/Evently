import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type { Event } from "@/types/event";

export function RegistrationSuccess({ event, participantName }: { event?: Event; participantName: string }) {
  return <div className="success-card"><span className="success-icon"><CheckCircle2 size={30} /></span><span className="kicker">Registration saved</span><h1>You&apos;re on the list, {participantName.split(" ")[0]}.</h1><p>{event ? `Your spot for ${event.title} is confirmed and saved on this device.` : "Your registration is confirmed and saved on this device."}</p><div className="success-actions"><Link href="/registrations?view=mine" className="button button-dark">My registrations</Link><Link href="/events" className="text-link">Explore more events ↗</Link></div></div>;
}
