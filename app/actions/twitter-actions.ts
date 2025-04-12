"use server"

import clientPromise from "@/lib/mongodb"

// Default API keys (these should be replaced with actual keys)
const DEFAULT_TWITTER_BEARER_TOKEN = "YOUR_BEARER_TOKEN"
const DEFAULT_TWITTER_API_KEY = "YOUR_API_KEY"
const DEFAULT_TWITTER_API_SECRET = "YOUR_API_SECRET"

// Track if a stream is currently active
let isStreamActive = false
let currentSearchTerm = ""

export async function startStream(searchTerm: string) {
  // Stop any existing stream
  if (isStreamActive) {
    await stopStream()
  }

  // Set up new stream
  currentSearchTerm = searchTerm
  isStreamActive = true

  try {
    // Store stream configuration in MongoDB
    const client = await clientPromise
    const db = client.db("twitter_sentiment")

    await db.collection("stream_config").updateOne(
      { id: 1 },
      {
        $set: {
          search_term: searchTerm,
          is_active: true,
          started_at: new Date(),
        },
      },
      { upsert: true },
    )

    return { success: true }
  } catch (error) {
    console.error("Error starting stream:", error)
    throw new Error("Failed to start stream")
  }
}

export async function stopStream() {
  isStreamActive = false
  currentSearchTerm = ""

  try {
    // Update stream configuration in MongoDB
    const client = await clientPromise
    const db = client.db("twitter_sentiment")

    await db.collection("stream_config").updateOne(
      { id: 1 },
      {
        $set: {
          is_active: false,
          stopped_at: new Date(),
        },
      },
      { upsert: true },
    )

    return { success: true }
  } catch (error) {
    console.error("Error stopping stream:", error)
    throw new Error("Failed to stop stream")
  }
}

export async function getStreamStatus() {
  try {
    // Get stream status from MongoDB
    const client = await clientPromise
    const db = client.db("twitter_sentiment")

    const config = await db.collection("stream_config").findOne({ id: 1 })

    return {
      isActive: config?.is_active || false,
      searchTerm: config?.search_term || "",
    }
  } catch (error) {
    console.error("Error getting stream status:", error)
    return {
      isActive: isStreamActive,
      searchTerm: currentSearchTerm,
    }
  }
}

