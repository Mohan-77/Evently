"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState, useSyncExternalStore, type ChangeEvent, type FormEvent } from "react";
import { ArrowRight, CalendarDays, Check, Heart, ImagePlus, Mail, Pencil, Phone, Trash2, UserRound, X } from "lucide-react";
import { EventGrid } from "@/components/events/EventGrid";
import { useFavorites } from "@/hooks/useFavorites";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useRegistrations } from "@/hooks/useRegistrations";
import { getEvent } from "@/data/events";
import { getEventStatus } from "@/lib/event-dates";
import { emptyUserProfile, isSafeProfileAvatar, isUserProfile, PROFILE_STORAGE_KEY, type UserProfile } from "@/types/profile";
import type { Event } from "@/types/event";

type ProfileField = "name" | "email" | "phone";
type ProfileErrors = Partial<Record<ProfileField, string>>;

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_AVATAR_DATA_URL_LENGTH = 900_000;
const subscribeToMount = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "EV";
  return words.slice(0, 2).map((word) => word[0].toUpperCase()).join("");
}

function getEventList(items: { event: Event | undefined }[]) {
  return items.flatMap(({ event }) => event ? [event] : []);
}

async function compressProfileImage(file: File) {
  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width * bitmap.height > 40_000_000) throw new Error("This image has too many pixels to process safely.");
    let maxDimension = 512;
    while (maxDimension >= 256) {
      const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Your browser could not prepare this image.");
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL("image/webp", 0.82);
      if (imageData.length <= MAX_AVATAR_DATA_URL_LENGTH && isSafeProfileAvatar(imageData)) return imageData;
      maxDimension = Math.floor(maxDimension * 0.75);
    }
    throw new Error("This image could not be reduced enough to save. Try a smaller image.");
  } finally {
    bitmap.close();
  }
}

export function ProfilePage() {
  const [savedProfile, setSavedProfile] = useLocalStorage<UserProfile>(PROFILE_STORAGE_KEY, emptyUserProfile, isUserProfile);
  const { registrations, isLoaded, storageError } = useRegistrations();
  const { favorites } = useFavorites();
  const mounted = useSyncExternalStore(subscribeToMount, getClientSnapshot, getServerSnapshot);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarRequestId = useRef(0);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<UserProfile>(emptyUserProfile);
  const [pendingAvatar, setPendingAvatar] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [imageError, setImageError] = useState("");
  const [imageProcessing, setImageProcessing] = useState(false);
  const [storageSaveError, setStorageSaveError] = useState("");
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [notice, setNotice] = useState("");

  const profile = useMemo(() => {
    const latestRegistration = [...registrations].sort((a, b) => Date.parse(a.registeredAt) - Date.parse(b.registeredAt)).at(-1);
    return {
      name: savedProfile.name || latestRegistration?.participantName || "",
      email: savedProfile.email || latestRegistration?.email || "",
      phone: savedProfile.phone || latestRegistration?.phone || "",
      avatar: isSafeProfileAvatar(savedProfile.avatar) ? savedProfile.avatar : undefined,
    };
  }, [registrations, savedProfile]);

  const profileEmail = profile.email.trim().toLowerCase();
  const userRegistrations = profileEmail
    ? registrations.filter((registration) => registration.email.trim().toLowerCase() === profileEmail)
    : [];
  const registrationItems = userRegistrations.map((registration) => ({ registration, event: getEvent(registration.eventId) }));
  const upcomingItems = registrationItems.filter(({ event }) => event && ["upcoming", "in-progress"].includes(getEventStatus(event, new Date())));
  const pastItems = registrationItems.filter(({ event }) => event && getEventStatus(event, new Date()) === "ended");
  const registeredEventCards = getEventList(upcomingItems);
  const favoriteEvents = favorites.flatMap((id) => {
    const event = getEvent(id);
    return event ? [event] : [];
  });

  const hasProfile = Boolean(profile.name || profile.email || profile.phone);
  const emailIsReadOnly = Boolean(profile.email);
  const avatarPreview = removeAvatar ? undefined : pendingAvatar ?? profile.avatar;

  function beginEdit() {
    setDraft(profile);
    setPendingAvatar(null);
    setRemoveAvatar(false);
    setImageError("");
    setStorageSaveError("");
    setErrors({});
    setNotice("");
    setEditing(true);
  }

  function cancelEdit() {
    avatarRequestId.current += 1;
    setEditing(false);
    setPendingAvatar(null);
    setRemoveAvatar(false);
    setImageError("");
    setStorageSaveError("");
    setErrors({});
    setImageProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function selectProfileImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const requestId = ++avatarRequestId.current;
    setImageError("");
    setImageProcessing(false);
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    const supportedType = ALLOWED_IMAGE_TYPES.has(file.type) || (!file.type && ALLOWED_IMAGE_EXTENSIONS.has(extension));
    if (!supportedType) {
      setImageError("Choose a JPG, JPEG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("The image must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }
    if (file.size === 0) {
      setImageError("This file is empty. Choose a valid image.");
      event.target.value = "";
      return;
    }

    setImageProcessing(true);
    try {
      const imageData = await compressProfileImage(file);
      if (requestId !== avatarRequestId.current) return;
      setPendingAvatar(imageData);
      setRemoveAvatar(false);
      setImageError("");
    } catch (error) {
      if (requestId !== avatarRequestId.current) return;
      setImageError(error instanceof Error && error.message ? error.message : "This file is not a valid image. Choose a JPG, PNG, or WebP file.");
    } finally {
      if (requestId === avatarRequestId.current) setImageProcessing(false);
      event.target.value = "";
    }
  }

  function saveProfile(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const name = draft.name.trim();
    const email = draft.email.trim();
    const phone = draft.phone.trim();
    const digits = phone.replace(/\D/g, "");
    const nextErrors: ProfileErrors = {};
    if (name.length < 2 || name.length > 80) nextErrors.name = "Enter a name between 2 and 80 characters.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Enter a valid email address.";
    if (!/^\+?[\d\s().-]+$/.test(phone) || digits.length < 10 || digits.length > 15) nextErrors.phone = "Enter a valid phone number with 10 to 15 digits.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || imageProcessing) return;

    const nextProfile: UserProfile = { name, email, phone };
    const avatar = removeAvatar ? undefined : pendingAvatar ?? profile.avatar;
    if (avatar) nextProfile.avatar = avatar;
    try {
      // Write first so quota/security errors can be reported before the profile view changes.
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));
    } catch {
      setStorageSaveError("Your profile could not be saved in this browser. Remove other stored data or choose a smaller image and try again.");
      return;
    }

    setSavedProfile(nextProfile);
    setEditing(false);
    setPendingAvatar(null);
    setRemoveAvatar(false);
    setNotice("Your profile has been saved on this device.");
  }

  if (!mounted || !isLoaded) {
    return <div className="profile-loading" role="status">Loading your profile…</div>;
  }

  return (
    <div className="profile-content">
      <header className="profile-heading">
        <span className="kicker">Your Evently account</span>
        <h1>Your profile</h1>
        <p>Keep your details and campus plans together.</p>
      </header>

      {storageError && <p className="profile-alert" role="alert">{storageError}</p>}
      {notice && <p className="profile-notice" role="status"><Check size={16} />{notice}</p>}

      <section className="profile-overview" aria-label="Profile information">
        <div className="profile-identity">
          <div className="profile-avatar" role="img" aria-label={`${profile.name || "User"} profile picture`}>
            <span aria-hidden="true">{getInitials(profile.name)}</span>
            {profile.avatar && <Image src={profile.avatar} alt="" width={76} height={76} unoptimized className="profile-avatar-image" onError={(event) => { event.currentTarget.style.display = "none"; }} />}
          </div>
          <div className="profile-identity-copy">
            <span className="profile-eyebrow">EVENTLY MEMBER</span>
            <h2>{profile.name || "Complete your profile"}</h2>
            <p>{profile.email || "Add your contact information to get started."}</p>
          </div>
        </div>
        <button className="profile-edit-button" type="button" onClick={beginEdit}><Pencil size={15} /> {hasProfile ? "Edit profile" : "Create profile"}</button>

        <div className="profile-contact-grid">
          <div><UserRound size={16} /><span><small>Full name</small><strong>{profile.name || "Not added yet"}</strong></span></div>
          <div><Mail size={16} /><span><small>Email address</small><strong>{profile.email || "Not added yet"}</strong></span></div>
          <div><Phone size={16} /><span><small>Phone number</small><strong>{profile.phone || "Not added yet"}</strong></span></div>
        </div>
      </section>

      <section className="profile-stats" aria-label="Your Evently activity">
        <article className="profile-stat"><span className="profile-stat-icon"><CalendarDays size={18} /></span><div><strong>{userRegistrations.length}</strong><span>Registered events</span></div></article>
        <article className="profile-stat"><span className="profile-stat-icon"><CalendarDays size={18} /></span><div><strong>{upcomingItems.length}</strong><span>Upcoming events</span></div></article>
        <article className="profile-stat"><span className="profile-stat-icon"><Heart size={18} /></span><div><strong>{favoriteEvents.length}</strong><span>Favorite events</span></div></article>
      </section>

      <section className="profile-section">
        <div className="profile-section-heading"><div><span className="kicker">YOUR CALENDAR</span><h2>Upcoming registered events</h2></div><Link href="/events">Explore events <ArrowRight size={15} /></Link></div>
        {registeredEventCards.length ? <EventGrid events={registeredEventCards} /> : <div className="profile-empty"><CalendarDays size={21} /><h3>No upcoming registrations</h3><p>Events you reserve will appear here.</p><Link href="/events" className="profile-inline-link">Explore events <ArrowRight size={14} /></Link></div>}
      </section>

      {pastItems.length > 0 && (
        <section className="profile-section profile-history">
          <div className="profile-section-heading"><div><span className="kicker">PAST PLANS</span><h2>Previous registrations</h2></div></div>
          <ul>{pastItems.map(({ registration }) => <li key={registration.id}><span>{registration.eventTitle}</span><small>{registration.eventDate} · {registration.eventVenue}</small></li>)}</ul>
        </section>
      )}

      <section className="profile-section">
        <div className="profile-section-heading"><div><span className="kicker">SAVED FOR LATER</span><h2>Favorite events</h2></div><Link href="/events">Find more <ArrowRight size={15} /></Link></div>
        {favoriteEvents.length ? <EventGrid events={favoriteEvents} /> : <div className="profile-empty"><Heart size={21} /><h3>No favorite events yet</h3><p>Save an event with the heart button and it will show up here.</p><Link href="/events" className="profile-inline-link">Discover events <ArrowRight size={14} /></Link></div>}
      </section>

      {editing && (
        <div className="profile-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) cancelEdit(); }}>
          <section className="profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-modal-title">
            <div className="profile-modal-heading"><div><span className="kicker">YOUR ACCOUNT</span><h2 id="profile-modal-title">Edit profile</h2><p>Update your details and profile photo.</p></div><button type="button" className="profile-modal-close" aria-label="Close profile editor" onClick={cancelEdit}><X size={19} /></button></div>
            <form className="profile-form" onSubmit={saveProfile} noValidate>
              <div className="profile-photo-editor">
                <div className="profile-avatar profile-avatar-editor" role="img" aria-label="Profile picture preview">
                  <span aria-hidden="true">{getInitials(draft.name)}</span>
                  {avatarPreview && <Image src={avatarPreview} alt="" width={88} height={88} unoptimized className="profile-avatar-image" onError={(event) => { event.currentTarget.style.display = "none"; }} />}
                </div>
                <div className="profile-photo-actions">
                  <strong>Profile photo</strong>
                  <span>JPG, PNG, or WebP · up to 5 MB</span>
                  <div>
                    <button type="button" className="profile-photo-button" onClick={() => fileInputRef.current?.click()} disabled={imageProcessing}><ImagePlus size={15} />{avatarPreview ? "Change photo" : "Upload photo"}</button>
                    {avatarPreview && <button type="button" className="profile-photo-remove" onClick={() => { avatarRequestId.current += 1; setPendingAvatar(null); setRemoveAvatar(true); setImageProcessing(false); setImageError(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}><Trash2 size={14} /> Remove</button>}
                  </div>
                  <input id="profile-picture-upload" ref={fileInputRef} className="profile-file-input" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onChange={selectProfileImage} aria-label="Upload a profile picture" />
                  {imageProcessing && <small className="profile-field-hint" role="status">Preparing image…</small>}
                  {imageError && <small className="profile-field-error" role="alert">{imageError}</small>}
                </div>
              </div>
              <label htmlFor="profile-name"><span><UserRound size={14} /> Full name</span>
                <input id="profile-name" name="name" autoComplete="name" value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "profile-name-error" : undefined} />
                {errors.name && <small className="profile-field-error" id="profile-name-error">{errors.name}</small>}
              </label>
              <label htmlFor="profile-email"><span><Mail size={14} /> Email address</span>
                <input id="profile-email" name="email" type="email" autoComplete="email" value={draft.email} readOnly={emailIsReadOnly} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "profile-email-error" : emailIsReadOnly ? "profile-email-help" : undefined} />
                {emailIsReadOnly && <small className="profile-field-hint" id="profile-email-help">Email is read-only because Evently has no account sign-in yet.</small>}
                {errors.email && <small className="profile-field-error" id="profile-email-error">{errors.email}</small>}
              </label>
              <label htmlFor="profile-phone"><span><Phone size={14} /> Phone number</span>
                <input id="profile-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" value={draft.phone} onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "profile-phone-error" : undefined} />
                {errors.phone && <small className="profile-field-error" id="profile-phone-error">{errors.phone}</small>}
              </label>
              {storageSaveError && <p className="profile-form-error" role="alert">{storageSaveError}</p>}
              <div className="profile-form-actions">
                <button className="profile-save-button" type="submit" disabled={imageProcessing}>Save changes <Check size={16} /></button>
                <button className="profile-cancel-button" type="button" onClick={cancelEdit}>Cancel</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
