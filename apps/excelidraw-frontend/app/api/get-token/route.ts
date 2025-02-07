import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export function GET() {
  const token = cookies().get("token")?.value || null;
  return NextResponse.json({ token });
}
