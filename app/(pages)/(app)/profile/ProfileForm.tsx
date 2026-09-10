"use client";

import { useActionState } from "react";
import { updateProfile } from "./actions";

type Profile = {
  username: string;
  firstName: string;
  lastName: string;
};

export default function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction, isPending] = useActionState(updateProfile, null);

  return (
    <main className="profile-page">
      <section className="profile-panel">
        <h1>Your profile</h1>
        <p>Edit how you show up across your boards.</p>
        <form className="profile-form" action={formAction}>
          <label htmlFor="profile-first-name">First name</label>
          <input id="profile-first-name" name="firstName" defaultValue={profile.firstName} required />

          <label htmlFor="profile-last-name">Last name</label>
          <input id="profile-last-name" name="lastName" defaultValue={profile.lastName} required />

          <label htmlFor="profile-name">Username</label>
          <input id="profile-name" name="username" defaultValue={profile.username} required />

          {state?.error && <p className="profile-error">{state.error}</p>}

          <button className="profile-submit" type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save profile"}
          </button>
        </form>
      </section>
    </main>
  );
}
