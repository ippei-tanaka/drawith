"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInWithEmail } from "./actions";

export default function SignInPage() {
  const [state, formAction, isPending] = useActionState(signInWithEmail, null);

  return (
    <main className="form-page form-page-centered">
      <section className="panel">
        <Link className="panel-brand" href="/" aria-label="Drawith home">Drawith</Link>
        <h1>Sign in</h1>
        <p className="panel-description">Welcome back. Pick up where you left off.</p>
        <form className="form" action={formAction}>
          <label htmlFor="sign-in-email">Email address</label>
          <input id="sign-in-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
          <label htmlFor="sign-in-password">Password</label>
          <input id="sign-in-password" name="password" type="password" autoComplete="current-password" placeholder="Enter your password" required />
          {state?.error && <p className="form-error" role="alert">{state.error}</p>}
          <button className="button" type="submit" disabled={isPending}>{isPending ? "Signing in..." : "Sign in"}</button>
        </form>
        <p className="panel-footer">New to Drawith? <Link href="/sign-up">Create an account</Link></p>
      </section>
    </main>
  );
}