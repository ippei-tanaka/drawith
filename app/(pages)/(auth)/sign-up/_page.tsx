"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signUpWithEmail } from "./actions";

const randomFirstNames = ["Alex", "Jordan", "Taylor", "Riley", "Casey", "Morgan"];
const randomLastNames = ["Morgan", "Parker", "Reed", "Hayes", "Brooks", "Quinn"];

export default function SignUpPage() {
  const [state, formAction, isPending] = useActionState(signUpWithEmail, null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const fillWithRandomValues = () => {
    const firstName = randomFirstNames[Math.floor(Math.random() * randomFirstNames.length)];
    const lastName = randomLastNames[Math.floor(Math.random() * randomLastNames.length)];
    const uniqueId = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
    setFirstName(firstName);
    setLastName(lastName);
    setEmail(`${firstName.toLowerCase()}.${lastName.toLowerCase()}.${uniqueId}@example.com`);
    setPassword(`Drawith!${uniqueId}`);
    setTermsAccepted(true);
  };

  return (
    <main className="form-page form-page-centered">
      <section className="panel">
        <Link className="panel-brand" href="/" aria-label="Drawith home">Drawith</Link>
        <h1>Create account</h1>
        <p className="panel-description">Start your collaborative canvas in a few seconds.</p>
        <form className="form" action={formAction}>
          <label htmlFor="sign-up-first-name">First name</label>
          <input id="sign-up-first-name" name="firstName" type="text" autoComplete="given-name" placeholder="First name" value={firstName} onChange={(event) => setFirstName(event.target.value)} required />
          <label htmlFor="sign-up-last-name">Last name</label>
          <input id="sign-up-last-name" name="lastName" type="text" autoComplete="family-name" placeholder="Last name" value={lastName} onChange={(event) => setLastName(event.target.value)} required />
          <label htmlFor="sign-up-email">Email address</label>
          <input id="sign-up-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <label htmlFor="sign-up-password">Create a password</label>
          <input id="sign-up-password" name="password" type="password" autoComplete="new-password" placeholder="At least 8 characters" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required />
          <label className="consent-label" htmlFor="terms">
            <input id="terms" name="terms" type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} required />
            <span>I agree to the <a href="#terms">Terms of service</a> and <a href="#privacy">Privacy policy</a>.</span>
          </label>
            {state?.error && <p className="form-error" role="alert">{state.error}</p>}
          <button className="button" type="submit" disabled={isPending}>{isPending ? "Creating account..." : "Create account"}</button>
          {/* <button className="blue-blank-button" type="button" onClick={fillWithRandomValues}>Fill with random values</button> */}
        </form>
        <p className="panel-footer">Already have an account? <Link href="/sign-in">Sign in</Link></p>
      </section>
    </main>
  );
}