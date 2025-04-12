import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    mongodbUri: process.env.MONGODB_URI ? "Set (not showing for security)" : "Not set",
    twitterBearerToken: process.env.TWITTER_BEARER_TOKEN ? "Set (not showing for security)" : "Not set",
    twitterApiKey: process.env.TWITTER_API_KEY ? "Set (not showing for security)" : "Not set",
    twitterApiSecret: process.env.TWITTER_API_SECRET ? "Set (not showing for security)" : "Not set",
  })
}

