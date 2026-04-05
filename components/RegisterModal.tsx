"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function RegisterModal({ open, onClose }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onKey]);

  useEffect(() => {
    if (!open) {
      setStatus("idle");
      setMessage("");
    }
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; dev?: boolean };
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Try again.");
        return;
      }
      setStatus("done");
      setMessage(data.dev ? "Saved (dev)." : "Done.");
      setName("");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Network error.");
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reg-title"
    >
      <button type="button" className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative z-[101] w-full max-w-sm rounded-2xl border border-white/20 bg-[#1a0050]/95 p-6 shadow-[0_0_60px_rgba(124,58,237,0.35)] backdrop-blur-xl">
        <div className="mb-5 flex items-start justify-between gap-3">
          <Image
            src="/LOGO.png"
            alt="beam"
            width={271}
            height={110}
            unoptimized
            className="h-auto w-32 shrink-0 bg-transparent opacity-95 md:w-40"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-lg leading-none text-white/50 hover:text-white"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <h2 id="reg-title" className="sr-only">
          Join the waitlist
        </h2>

        <form onSubmit={submit} className="space-y-4">
          <input
            name="name"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="w-full rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-white placeholder:text-white/35 outline-none focus:border-purple-400/60"
          />
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-white placeholder:text-white/35 outline-none focus:border-purple-400/60"
          />
          {message ? (
            <p className={`text-sm ${status === "error" ? "text-amber-300" : "text-emerald-300/90"}`} role="status">
              {message}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={status === "loading" || status === "done"}
            className="w-full rounded-xl bg-white py-3.5 text-sm font-semibold tracking-wider text-[#0d0048] transition hover:bg-white/90 disabled:opacity-50"
          >
            {status === "loading"
              ? "…"
              : status === "done"
                ? "YOU'RE IN"
                : "JOIN THE WAITLIST"}
          </button>
        </form>
      </div>
    </div>
  );
}
