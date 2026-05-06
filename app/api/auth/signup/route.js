// app/api/auth/signup/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
  const body = await req.json();
  const { email, password, name, Sofinummer, telephone, adresse, kvknr, Iban } = body;
  const normalizedEmail = String(email || "").trim().toLowerCase();

  // ── Validate all required fields (matches schema: all non-optional) ──
  const missing = [];
  if (!normalizedEmail) missing.push("email");
  if (!password)   missing.push("mot de passe");
  if (!name)       missing.push("nom");
  if (!Sofinummer) missing.push("Sofinummer");
  if (!telephone)  missing.push("téléphone");
  if (!adresse)    missing.push("adresse");
  if (!kvknr)      missing.push("KVK-nummer");
  if (!Iban)       missing.push("IBAN");

  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Champs requis manquants : ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  // ── Hash password + create user (single DB roundtrip) ─────────────
  // 10 rounds keeps strong hashing while reducing serverless latency.
  const rounds = Number(process.env.BCRYPT_ROUNDS || 10);
  const hashed = await bcrypt.hash(password, rounds);

  try {
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashed,
        name,
        Sofinummer,
        telephone,
        adresse,
        kvknr,
        Iban,
      },
    });

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
  } catch (error) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Email déjà utilisé" }, { status: 409 });
    }
    throw error;
  }
}
