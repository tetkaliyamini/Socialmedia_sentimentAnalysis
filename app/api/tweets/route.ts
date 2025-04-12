import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

// Helper function to properly serialize MongoDB documents
function serializeMongoDB(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj
  }

  // Handle BigInt objects from MongoDB
  if (typeof obj === "object" && obj !== null && "low" in obj && "high" in obj) {
    return String(obj.low)
  }

  // Handle Date objects
  if (obj instanceof Date) {
    return obj.toISOString()
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => serializeMongoDB(item))
  }

  // Handle objects
  if (typeof obj === "object") {
    const result: any = {}
    for (const key in obj) {
      result[key] = serializeMongoDB(obj[key])
    }
    return result
  }

  return obj
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const term = searchParams.get("term")

  if (!term) {
    return NextResponse.json({ error: "Search term is required" }, { status: 400 })
  }

  try {
    // Fetch tweets from MongoDB
    const client = await clientPromise
    const db = client.db("twitter_sentiment")

    const tweetsFromDb = await db
      .collection("tweets")
      .find({
        $or: [
          { text: { $regex: term, $options: "i" } },
          { is_mock: true }, // Include mock data
        ],
      })
      .sort({ created_at: -1 })
      .limit(50)
      .toArray()

    // Properly serialize the MongoDB documents
    const tweets = serializeMongoDB(tweetsFromDb)

    // Add a flag to indicate if we're using mock data
    const usingMockData = tweets.some((tweet: any) => tweet.is_mock === true)

    return NextResponse.json({
      tweets,
      usingMockData,
    })
  } catch (error) {
    console.error("Error fetching tweets:", error)
    return NextResponse.json({ error: "Failed to fetch tweets" }, { status: 500 })
  }
}
