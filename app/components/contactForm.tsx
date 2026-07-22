"use client";

import React, { useState } from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { Mail, MapPin, Send, CheckCircle2 } from "lucide-react";
// Import the secure server action
import { sendContactEmail } from "@/app/actions/sendEmail"; 

export default function ContactForm() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(false);
    setErrorMessage(null);
    setIsSubmitting(true);

    // Call the server action directly
    const result = await sendContactEmail(formState);

    setIsSubmitting(false);
    if (result.success) {
      setIsSuccess(true);
      setFormState({ name: "", email: "", company: "", message: "" });
      setTimeout(() => setIsSuccess(false), 4000);
    } else {
      setErrorMessage(result.error || "API hit limit 😭 Please try tomorrow");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <LazyMotion features={domAnimation}>
      <div id="section5" className="w-full max-w-5xl mx-auto px-4 py-16 dark:bg-zinc-950 rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 items-start">
          
          {/* Left Column: Direct Info */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
                Let's Connect
              </h2>
              <p className="mt-3 text-zinc-400 max-w-sm">
                Have an idea, an open role, or just want to chat? Drop me a message and I'll get back to you within 24 hours.
              </p>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4 text-zinc-400 group">
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg group-hover:border-zinc-700 transition-colors">
                  <Mail className="h-5 w-5 text-zinc-300" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Email Me</p>
                  {/* Keep the link generic/obfuscated if you want total privacy, or leave standard public pointers */}
                  <span className="text-zinc-400 text-sm italic">Hidden for privacy — Use form!</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-zinc-400 group">
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg group-hover:border-zinc-700 transition-colors">
                  <svg className="h-5 w-5 text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">LinkedIn</p>
                  <a 
                    href="https://linkedin.com/in/caleb-liu0/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-zinc-200 hover:text-white transition-colors text-sm"
                  >
                    linkedin.com/in/caleb-liu0/
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 text-zinc-400 group">
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg group-hover:border-zinc-700 transition-colors">
                  <MapPin className="h-5 w-5 text-zinc-300" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Location</p>
                  <p className="text-zinc-200 text-sm">Albany, NY</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="md:col-span-3 bg-zinc-900/40 border border-zinc-800/80 p-6 sm:p-8 rounded-xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Name Input */}
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formState.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all text-sm"
                  />
                </div>

                {/* Company Input */}
                <div className="space-y-1.5">
                  <label htmlFor="company" className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Company <span className="text-zinc-600 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formState.company}
                    onChange={handleChange}
                    placeholder="Acme Corp"
                    className="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formState.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all text-sm"
                />
              </div>

              {/* Message Input */}
              <div className="space-y-1.5">
                <label htmlFor="message" className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Your Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  value={formState.message}
                  onChange={handleChange}
                  placeholder="Share details about the position, project, or your timeline..."
                  className="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all text-sm resize-none"
                />
              </div>

              {/* Error feedback if dispatch fails */}
              {errorMessage && (
                <p className="text-sm text-red-400 bg-red-950/30 border border-red-900/50 p-3 rounded-lg">
                  {errorMessage}
                </p>
              )}

              {/* Submit Button */}
              <m.button
                type="submit"
                disabled={isSubmitting || isSuccess}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-lg text-sm font-medium tracking-wide transition-all duration-200 will-change-transform ${
                  isSuccess
                    ? "bg-emerald-600 text-white cursor-default"
                    : "bg-zinc-100 text-zinc-950 hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-500"
                }`}
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 border-2 border-zinc-500 border-t-zinc-950 rounded-full animate-spin" />
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Message Sent Successfully!
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Send Message
                  </>
                )}
              </m.button>
            </form>
          </div>

        </div>
      </div>
    </LazyMotion>
  );
}