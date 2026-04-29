// app/api/auth/signup/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
  const body = await req.json();
  const { email, password, name, Sofinummer, telephone, adresse, kvknr } = body;

  // ── Validate required fields ────────────────────────────────────
  const missing = [];
  if (!email)      missing.push("email");
  if (!password)   missing.push("mot de passe");
  if (!name)       missing.push("nom");
  if (!Sofinummer) missing.push("Sofinummer");
  if (!telephone)  missing.push("téléphone");
  if (!adresse)    missing.push("adresse");

  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Champs requis manquants : ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  // ── Check for duplicate email ────────────────────────────────────
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email déjà utilisé" }, { status: 409 });
  }

  // ── Hash password + create user ──────────────────────────────────
  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      name,
      Sofinummer,
      telephone,
      adresse,
      kvknr: kvknr || null,   // optional field
    },
  });

  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
}