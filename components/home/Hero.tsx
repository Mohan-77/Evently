import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";

export function Hero() {
  return <section className="hero"><div className="shell hero-grid"><div className="hero-copy"><span className="kicker">A place for your next chapter</span><h1>Find your <em>people.</em><br />Make it <em>matter.</em></h1><p>Evently brings together thoughtful events and the people who make them worth showing up for.</p><div className="hero-actions"><Link href="/events" className="button button-dark">Explore events <ArrowRight size={16} /></Link><Link href="/about" className="text-link">How it works <ArrowDown size={15} /></Link></div></div><div className="hero-art"><div className="hero-photo" /><div className="hero-note note-one">Good things<br /><strong>happen here.</strong></div><div className="hero-note note-two">✦ 12k+ curious people</div><div className="hero-scribble">✦</div></div></div></section>;
}
