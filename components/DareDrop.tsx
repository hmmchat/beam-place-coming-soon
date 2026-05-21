"use client";

import { useMemo, useState } from "react";

type Status = "idle" | "loading" | "done" | "error";

const MAX_DARES = 5;

export function DareDrop() {
  const [email, setEmail] = useState("");
  const [dares, setDares] = useState([""]);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const filledDares = useMemo(() => dares.map((dare) => dare.trim()).filter(Boolean), [dares]);

  function updateDare(index: number, value: string) {
    setDares((current) => current.map((dare, i) => (i === index ? value : dare)));
    if (status !== "loading") {
      setStatus("idle");
      setMessage("");
    }
  }

  function addDare() {
    if (dares.length >= MAX_DARES) return;
    setDares((current) => [...current, ""]);
    setStatus("idle");
    setMessage("");
  }

  function removeDare(index: number) {
    setDares((current) => {
      if (current.length === 1) return current;
      return current.filter((_, i) => i !== index);
    });
    setStatus("idle");
    setMessage("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (filledDares.length < 1) {
      setStatus("error");
      setMessage("Drop at least one dare into the signal.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/dares", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          dares: filledDares,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; dev?: boolean; count?: number };

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "The drop missed. Try again.");
        return;
      }

      setStatus("done");
      setMessage(data.dev ? "Dev preview only. Add GOOGLE_APPS_SCRIPT_URL to write to Sheets." : "Signal captured. Stay close.");
      setEmail("");
      setDares([""]);
    } catch {
      setStatus("error");
      setMessage("The signal broke for a second. Try again.");
    }
  }

  return (
    <section className="dare-drop relative mt-14 w-full max-w-xl" aria-labelledby="dare-drop-title">
      <div className="dare-orbit absolute inset-[-1px] rounded-[2rem]" aria-hidden />
      <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/[0.07] p-5 shadow-[0_0_70px_rgba(168,85,247,0.22)] backdrop-blur-xl md:p-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(244,114,182,0.24),transparent_32%),radial-gradient(circle_at_82%_20%,rgba(192,132,252,0.2),transparent_28%)]" />
        <div className="dare-scan pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />

        <div className="relative">
          <p className="mb-3 text-center text-[10px] font-medium uppercase tracking-[0.55em] text-fuchsia-100/60">
            unopened transmission
          </p>
          <h2 id="dare-drop-title" className="text-center text-3xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
            Send a dare into BEAM.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-center text-sm leading-6 text-white/58 md:text-base">
            Something in the app is listening. No rules. No explanation. Drop one dare or a stack of them, then stay tuned.
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <label className="block">
              <span className="sr-only">Email</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status !== "loading") {
                    setStatus("idle");
                    setMessage("");
                  }
                }}
                placeholder="your@email.com"
                className="w-full rounded-2xl border border-white/15 bg-black/25 px-4 py-3.5 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-fuchsia-300/70 focus:bg-black/35"
              />
            </label>

            <div className="space-y-3">
              {dares.map((dare, index) => (
                <label key={index} className="group/dare block">
                  <span className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.35em] text-white/40">
                    Dare {String(index + 1).padStart(2, "0")}
                    {dares.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeDare(index)}
                        className="rounded-full px-2 py-1 tracking-[0.22em] text-white/35 transition hover:bg-white/10 hover:text-white/80"
                      >
                        remove
                      </button>
                    ) : null}
                  </span>
                  <textarea
                    value={dare}
                    onChange={(e) => updateDare(index, e.target.value)}
                    rows={3}
                    maxLength={280}
                    placeholder="type the dare..."
                    className="min-h-24 w-full resize-none rounded-2xl border border-white/12 bg-[#09001f]/55 px-4 py-3 text-sm leading-6 text-white placeholder:text-white/28 outline-none transition focus:border-fuchsia-300/70 focus:bg-[#0d002c]/75 group-hover/dare:border-white/20"
                  />
                </label>
              ))}
            </div>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row">
              <button
                type="button"
                onClick={addDare}
                disabled={dares.length >= MAX_DARES || status === "loading"}
                className="rounded-full border border-white/15 px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/70 transition hover:border-white/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
              >
                Add another
              </button>
              <button
                type="submit"
                disabled={status === "loading"}
                className="btn-shimmer relative flex-1 overflow-hidden rounded-full bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.25em] text-[#180044] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  backgroundImage:
                    "linear-gradient(110deg, #ffffff 0%, #f5d0fe 38%, #ffffff 58%, #ffffff 100%)",
                }}
              >
                {status === "loading" ? "sending..." : "drop the dare"}
              </button>
            </div>

            {message ? (
              <p
                className={`text-center text-sm ${status === "error" ? "text-amber-300" : "text-emerald-200/90"}`}
                role="status"
              >
                {message}
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  );
}
