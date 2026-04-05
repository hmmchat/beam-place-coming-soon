"use client";

import Image from "next/image";

type Props = {
  className?: string;
  priority?: boolean;
};

/**
 * Same wordmark as the main frontend (`hmm../public/LOGO.png` → `/LOGO.png`),
 * e.g. `MeetSomeoneDynamic.jsx`: <img src="/LOGO.png" className="md:w-64 mx-auto w-44" />
 * Shine: masked `::after` in `globals.css` (must use the same asset as the image).
 */
export function LogoWithShine({ className = "", priority }: Props) {
  return (
    <div className={`logo-animated ${className}`}>
      <Image
        src="/LOGO.png"
        alt="beam"
        width={271}
        height={110}
        priority={priority}
        unoptimized
        className="logo-img mx-auto h-auto w-44 md:w-64"
      />
    </div>
  );
}
