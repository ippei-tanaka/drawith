"use client";

import { useActionState } from "react";
import { updateProfile } from "@/actions/actions";

type Profile = {
  username: string;
  first_name: string;
  last_name: string;
};

export default function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction, isPending] = useActionState(updateProfile, null);

  return (
    <main className="form-page">
      <section className="panel">
        <h1>Your profile</h1>
        <p className="panel-description">Edit how you show up across your boards.</p>
        <form className="form" action={formAction}>
          <label htmlFor="profile-first-name">First name</label>
          <input id="profile-first-name" name="firstName" defaultValue={profile.first_name} required />

          <label htmlFor="profile-last-name">Last name</label>
          <input id="profile-last-name" name="lastName" defaultValue={profile.last_name} required />

          <label htmlFor="profile-name">Username</label>
          <input id="profile-name" name="username" defaultValue={profile.username} required />

          {state?.error && <p className="form-error">{state.error}</p>}

          <button className="button" type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save profile"}
          </button>
        </form>
      </section>
    </main>
  );
}
