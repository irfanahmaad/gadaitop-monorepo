"use client";

import { useState, type FormEvent } from "react";
import { Send, Loader2 } from "lucide-react";

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
          <svg
            className="size-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h4 className="font-display text-lg font-bold text-dark">
          Pesan Terkirim!
        </h4>
        <p className="mt-2 text-sm text-dark-muted">
          Terima kasih, tim kami akan segera menghubungi Anda.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-6 cursor-pointer text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
        >
          Kirim pesan lagi
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="name"
          className="mb-1.5 block text-sm font-medium text-dark"
        >
          Nama Lengkap
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-dark-muted/50 focus:border-brand focus:ring-2 focus:ring-brand/20"
          placeholder="Masukkan nama lengkap"
        />
      </div>
      <div>
        <label
          htmlFor="phone"
          className="mb-1.5 block text-sm font-medium text-dark"
        >
          Nomor HP
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          required
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-dark-muted/50 focus:border-brand focus:ring-2 focus:ring-brand/20"
          placeholder="08xxxxxxxxxx"
        />
      </div>
      <div>
        <label
          htmlFor="subject"
          className="mb-1.5 block text-sm font-medium text-dark"
        >
          Subjek
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          required
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-dark-muted/50 focus:border-brand focus:ring-2 focus:ring-brand/20"
          placeholder="Subjek pesan"
        />
      </div>
      <div>
        <label
          htmlFor="message"
          className="mb-1.5 block text-sm font-medium text-dark"
        >
          Pesan
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-dark-muted/50 focus:border-brand focus:ring-2 focus:ring-brand/20"
          placeholder="Tulis pesan Anda..."
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-dark hover:shadow-lg hover:shadow-brand/25 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Mengirim...
          </>
        ) : (
          <>
            <Send className="size-4" />
            Kirim Pesan
          </>
        )}
      </button>
    </form>
  );
}
