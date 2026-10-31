"use client";

import { useState } from "react";
// Same server action the old ContactForm used (Resend). Nothing about the API changed.
import { sendContactEmail } from "@/app/actions/sendEmail";

interface Props {
  name: string;
  blurb: string;
  links: { label: string; url: string }[];
}

const EMPTY = { name: "", email: "", company: "", message: "" };

export default function ContactCard({ name, blurb, links }: Props) {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus("sending");

    try {
      const result = await sendContactEmail(form);
      if (result.success) {
        setStatus("sent");
        setForm(EMPTY);
        setTimeout(() => setStatus("idle"), 4000);
      } else {
        setStatus("idle");
        setError(result.error || "API hit limit 😭 Please try tomorrow");
      }
    } catch {
      setStatus("idle");
      setError("Something went wrong. Please try again.");
    }
  };

  const label =
    status === "sending" ? (
      <>
        <i className="spin" aria-hidden="true" /> Sending
      </>
    ) : status === "sent" ? (
      "Message sent"
    ) : (
      "Send message"
    );

  return (
    <div className="card">
      <h3>{name}</h3>
      <p>{blurb}</p>
      <p className="card-note">I keep my email private. This form goes straight to my inbox.</p>

      <form onSubmit={onSubmit} className="cf">
        <div className="cf-pair">
          <div className="cf-row">
            <label htmlFor="cf-name">Name</label>
            <input id="cf-name" name="name" type="text" required value={form.name} onChange={onChange} autoComplete="name" />
          </div>
          <div className="cf-row">
            <label htmlFor="cf-company">Company (optional)</label>
            <input id="cf-company" name="company" type="text" value={form.company} onChange={onChange} autoComplete="organization" />
          </div>
        </div>

        <div className="cf-row">
          <label htmlFor="cf-email">Email</label>
          <input id="cf-email" name="email" type="email" required value={form.email} onChange={onChange} autoComplete="email" />
        </div>

        <div className="cf-row">
          <label htmlFor="cf-message">Message</label>
          <textarea id="cf-message" name="message" rows={4} required value={form.message} onChange={onChange} />
        </div>

        <div className="collapse" data-open={!!error} aria-live="polite">
          <div>
            <p className="cf-error">{error}</p>
          </div>
        </div>

        <button type="submit" className="send" data-state={status} disabled={status !== "idle"}>
          <span key={status}>{label}</span>
        </button>
      </form>

      <dl className="card-rows">
        {links.map((l) => (
          <div key={l.url}>
            <dt>{l.label}</dt>
            <dd>
              <a href={l.url} target="_blank" rel="noopener noreferrer" className="ulink">
                {l.url.replace(/^https?:\/\//, "")}
              </a>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}