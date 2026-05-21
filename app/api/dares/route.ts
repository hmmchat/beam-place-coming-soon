import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_DARES = 5;
const MAX_DARE_LENGTH = 280;

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

  const emailRaw =
    typeof (body as { email?: unknown }).email === "string" ? (body as { email: string }).email.trim() : "";
  const email = emailRaw.toLowerCase();
  const submittedDares = Array.isArray((body as { dares?: unknown }).dares) ? (body as { dares: unknown[] }).dares : [];
  const dares = submittedDares
    .filter((dare): dare is string => typeof dare === "string")
    .map((dare) => dare.trim())
    .filter(Boolean);

  if (!EMAIL_RE.test(email) || email.length > 320) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
  }
  if (dares.length < 1) {
    return NextResponse.json({ ok: false, error: "Drop at least one dare." }, { status: 400 });
  }
  if (dares.length > MAX_DARES) {
    return NextResponse.json({ ok: false, error: `Send up to ${MAX_DARES} dares at a time.` }, { status: 400 });
  }
  if (dares.some((dare) => dare.length > MAX_DARE_LENGTH)) {
    return NextResponse.json(
      { ok: false, error: `Keep each dare under ${MAX_DARE_LENGTH} characters.` },
      { status: 400 },
    );
  }

  const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  const submittedAt = new Date().toISOString();

  if (!scriptUrl) {
    if (process.env.NODE_ENV === "development") {
      console.info("[dares]", { email, dares, source: "BEAM_DARE", submittedAt });
      return NextResponse.json({ ok: true, dev: true, count: dares.length });
    }
    return NextResponse.json(
      { ok: false, error: "Dare drop is not configured yet. Try again later." },
      { status: 503 },
    );
  }

  try {
    const res = await fetch(scriptUrl, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "submit_dares",
        email,
        dares,
        source: "BEAM_DARE",
        submittedAt,
      }),
    });

    const text = await res.text();
    let parsed: { ok?: boolean; error?: string; count?: number } = {};
    try {
      parsed = JSON.parse(text) as typeof parsed;
    } catch {
      return NextResponse.json(
        { ok: false, error: "Dare drop service did not confirm the save. Check the Apps Script deployment." },
        { status: 502 },
      );
    }

    if (parsed.ok !== true || !res.ok) {
      return NextResponse.json(
        { ok: false, error: parsed.error ?? "Could not save the dare drop. Try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, count: parsed.count ?? dares.length });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not reach dare drop service. Try again." }, { status: 502 });
  }
}
