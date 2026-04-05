import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Invalid payload." }, { status: 400 });
  }

  const name = typeof (body as { name?: unknown }).name === "string" ? (body as { name: string }).name.trim() : "";
  const emailRaw =
    typeof (body as { email?: unknown }).email === "string" ? (body as { email: string }).email.trim() : "";
  const email = emailRaw.toLowerCase();

  if (name.length < 1 || name.length > 200) {
    return NextResponse.json({ ok: false, error: "Please enter a valid name." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email) || email.length > 320) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
  }

  const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

  if (!scriptUrl) {
    if (process.env.NODE_ENV === "development") {
      console.info("[waitlist]", { name, email, source: "BEAM" });
      return NextResponse.json({ ok: true, dev: true });
    }
    return NextResponse.json(
      { ok: false, error: "Waitlist is not configured yet. Try again later." },
      { status: 503 },
    );
  }

  try {
    const res = await fetch(scriptUrl, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        source: "BEAM",
        submittedAt: new Date().toISOString(),
      }),
    });

    const text = await res.text();
    let parsed: { ok?: boolean; error?: string; code?: string } = {};
    try {
      parsed = JSON.parse(text) as typeof parsed;
    } catch {
      if (!res.ok) {
        return NextResponse.json({ ok: false, error: "Could not save your signup. Try again." }, { status: 502 });
      }
    }

    if (parsed.ok === false) {
      const duplicate = parsed.code === "duplicate_email";
      return NextResponse.json(
        { ok: false, error: parsed.error ?? "Could not save your signup. Try again." },
        { status: duplicate ? 409 : 502 },
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: parsed.error ?? "Could not save your signup. Try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not reach waitlist service. Try again." }, { status: 502 });
  }
}
