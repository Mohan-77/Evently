export type UserProfile = {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
};

export const PROFILE_STORAGE_KEY = "evently-profile";
export const emptyUserProfile: UserProfile = { name: "", email: "", phone: "" };

export function isUserProfile(value: unknown): value is UserProfile {
  if (typeof value !== "object" || value === null) return false;
  const profile = value as Partial<UserProfile>;
  return typeof profile.name === "string" && typeof profile.email === "string" && typeof profile.phone === "string" &&
    (profile.avatar === undefined || typeof profile.avatar === "string");
}

export function isSafeProfileAvatar(value: unknown): value is string {
  return typeof value === "string" && value.length <= 900_000 &&
    /^data:image\/(?:webp|jpeg|png);base64,[A-Za-z0-9+/]+={0,2}$/.test(value);
}
