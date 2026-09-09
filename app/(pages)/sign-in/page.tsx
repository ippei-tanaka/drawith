"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInWithEmail } from "./actions";

export default function SignInPage() {
  const [state, formAction, isPending] = useActionState(signInWithEmail, null);

  return (
    <main className="auth-page">
      <section className="auth-intro" aria-label="Drawith introduction">
        <Link className="auth-brand" href="/" aria-label="Drawith home">
          <span className="auth-brand-mark">D</span>
          <span>drawith</span>
        </Link>
        <div className="auth-artwork" aria-hidden="true">
          <p className="artwork-kicker">A shared space for</p>
          <p className="artwork-title">ideas in motion.</p>
          <div className="sketch sketch-sun"><i /><i /><i /><i /><i /><i /><i /><i /></div>
          <div className="sketch sketch-line" />
          <div className="sketch sketch-note">What if?</div>
          <div className="sketch sketch-star">*</div>
          <div className="sketch sketch-dots"><i /><i /><i /></div>
        </div>
        <p className="auth-intro-footer">Draw, think, and make things happen together.</p>
      </section>

      <section className="auth-panel">
        <div className="auth-form-wrap">
          <Link className="back-link" href="/">&larr; Back to board</Link>
          <div className="auth-heading">
            <p className="eyebrow">Welcome back</p>
            <h1>Sign in to continue creating.</h1>
            <p>Pick up where your ideas left off.</p>
          </div>
          <form className="auth-form" action={formAction}>
            <label htmlFor="sign-in-email">Email address</label>
            <input id="sign-in-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
            <div className="field-label-row">
              <label htmlFor="sign-in-password">Password</label>
              <a href="#forgot-password">Forgot password?</a>
            </div>
            <input id="sign-in-password" name="password" type="password" autoComplete="current-password" placeholder="Enter your password" required />
            {state?.error && <p className="auth-error" role="alert">{state.error}</p>}
            <button className="auth-submit" type="submit" disabled={isPending}>{isPending ? "Signing in..." : "Sign in"}</button>
          </form>
          <p className="auth-switch">New to Drawith? <Link href="/sign-up">Create an account</Link></p>
        </div>
      </section>
    </main>
  );
}