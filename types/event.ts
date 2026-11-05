export type EventCategory =
  | "Technology"
  | "Music"
  | "Sports"
  | "Business"
  | "Art & Design"
  | "Education";

export type Event = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  venue: string;
  category: EventCategory;
  price: string;
  image: string;
  accent: string;
  attendees: number;
  host: string;
  hostRole: string;
  featured?: boolean;
};
