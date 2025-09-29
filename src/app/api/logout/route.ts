// src/app/api/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ message: "Logout realizado" });
  res.cookies.set("token", "", { path: "/", maxAge: 0 });
  return res;
}
