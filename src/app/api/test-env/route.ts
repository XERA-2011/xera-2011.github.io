import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasAuthSecret: !!process.env.AUTH_SECRET,
    authUrl: process.env.AUTH_URL,
    nextauthUrl: process.env.NEXTAUTH_URL,
  })
}
