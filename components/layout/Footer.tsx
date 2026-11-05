import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-top">
        <div className="footer-brand-block">
          <Link href="/" className="brand"><span className="brand-mark"><span>✦</span></span> evently</Link>
          <p className="footer-tagline">Thoughtful campus events, made easy to find. Make space for what matters.</p>
        </div>
        <div className="footer-links">
          <div><p className="eyebrow">Explore</p><Link href="/events">All events</Link><Link href="/categories">Browse categories</Link><Link href="/about">About Evently</Link></div>
          <div><p className="eyebrow">Connect</p><a href="mailto:hello@evently.space">Contact us <ArrowUpRight size={14} /></a><a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram <span>↗</span></a><a href="https://twitter.com" target="_blank" rel="noreferrer">Twitter <span>↗</span></a></div>
        </div>
      </div>
      <div className="shell footer-bottom"><span>© 2026 Evently</span><span>Made for curious people, everywhere.</span></div>
    </footer>
  );
}
