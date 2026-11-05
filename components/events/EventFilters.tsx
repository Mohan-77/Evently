"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { categories } from "@/data/events";

type Props = { query: string; setQuery: (value: string) => void; category: string; setCategory: (value: string) => void };
export function EventFilters({ query, setQuery, category, setCategory }: Props) {
  return <div className="filters"><label className="search-field"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search events, places, or people" /></label><div className="filter-select"><SlidersHorizontal size={17} /><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="All">All categories</option>{categories.map((item) => <option key={item.name}>{item.name}</option>)}</select></div></div>;
}
