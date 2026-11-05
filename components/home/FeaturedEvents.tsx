import Link from "next/link";
import { events } from "@/data/events";
import { EventGrid } from "@/components/events/EventGrid";
export function FeaturedEvents() { return <section className="section featured-section"><div className="shell"><div className="section-heading"><div><span className="kicker">Handpicked for you</span><h2>Worth showing up for</h2></div><Link href="/events" className="text-link">See all events <span>↗</span></Link></div><EventGrid events={events.filter((event) => event.featured)} featured /></div></section>; }
