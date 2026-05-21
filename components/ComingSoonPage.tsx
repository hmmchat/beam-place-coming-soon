"use client";

import { useState } from "react";
import { RegisterModal } from "./RegisterModal";
import { StarryField } from "./StarryField";
import { LogoWithShine } from "./LogoWithShine";
import { DareDrop } from "./DareDrop";

export function ComingSoonPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden text-white">
        <div className="starry-sky absolute inset-0" />
        <StarryField />
        <div className="noise absolute inset-0 z-[1]" />

        {/* Soft vignette */}
        <div
          className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_90%_70%_at_50%_45%,transparent_30%,rgba(13,0,72,0.55)_100%)]"
          aria-hidden
        />

        <div className="relative z-10 flex w-full max-w-2xl flex-col items-center px-6 pb-12 pt-12 md:px-8">
          {/* Orbiting accent — pure shape, no copy */}
          <div className="relative mb-10 flex h-[min(52vw,220px)] w-[min(52vw,220px)] items-center justify-center">
            <div className="cta-ring absolute inset-0 rounded-full border border-white/15" />
            <div className="cta-spin absolute inset-[-10px] rounded-full border border-dashed border-purple-300/25" />
            <div className="cta-ring absolute inset-[-22px] rounded-full border border-white/10 opacity-50" />
            <div className="relative flex items-center justify-center">
              <LogoWithShine priority />
            </div>
          </div>

          <p className="text-center text-[11px] font-light uppercase tracking-[0.42em] text-white/55 md:text-xs">
            the new generation social
          </p>

          <div className="mt-14 flex flex-col items-center gap-5">
            <p className="font-medium tracking-[0.28em] text-white/85 md:text-lg">COMING SOON</p>

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="cta-glow group relative overflow-hidden rounded-full border border-white/25 bg-white/10 px-14 py-4 text-sm font-semibold tracking-[0.2em] text-white backdrop-blur-md transition hover:bg-white/15"
            >
              <span
                className="btn-shimmer pointer-events-none absolute inset-0 opacity-40 transition group-hover:opacity-70"
                style={{
                  background:
                    "linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
                }}
              />
              <span className="relative">JOIN THE WAITLIST</span>
            </button>
          </div>

          <DareDrop />
        </div>
      </div>

      <RegisterModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
