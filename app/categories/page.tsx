import Link from "next/link";
import {
  BriefcaseBusiness,
  GraduationCap,
  Laptop,
  Music2,
  Palette,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { categories } from "@/data/events";

const categoryDetails: Record<string, { description: string; Icon: LucideIcon }> = {
  Technology: { description: "Conferences, hackathons, and ideas shaping what comes next.", Icon: Laptop },
  Music: { description: "Live music, concerts, and nights worth remembering.", Icon: Music2 },
  Sports: { description: "Campus tournaments, leagues, and friendly competition.", Icon: Trophy },
  Business: { description: "Meetups and conversations for curious builders.", Icon: BriefcaseBusiness },
  "Art & Design": { description: "Workshops and exhibitions made to spark creativity.", Icon: Palette },
  Education: { description: "Seminars and training to learn something new.", Icon: GraduationCap },
};

export default function CategoriesPage() {
  return (
    <main className="categories-page">
      <div className="shell">
        <header className="page-heading">
          <span className="kicker">Find your kind of thing</span>
          <h1>Browse categories</h1>
          <p>Explore campus events by the things you love.</p>
        </header>
        <div className="browse-categories-grid">
          {categories.map((category) => {
            const { description, Icon } = categoryDetails[category.name];
            return (
              <Link
                href={`/events?category=${encodeURIComponent(category.name)}`}
                className={`browse-category-card ${category.color}`}
                key={category.name}
              >
                <span className="browse-category-icon"><Icon size={25} strokeWidth={1.8} aria-hidden="true" /></span>
                <span className="browse-category-copy">
                  <strong>{category.name}</strong>
                  <span>{description}</span>
                </span>
                <span className="browse-category-arrow" aria-hidden="true">↗</span>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
