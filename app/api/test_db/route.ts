import { NextResponse } from "next/server"
import { MongoClient } from "mongodb"

export async function GET() {
  try {
    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI as string)
    await client.connect()

    // Test the connection
    const dbList = await client.db().admin().listDatabases()

    // Close the connection
    await client.close()

    // Return success response
    return NextResponse.json({
      status: "success",
      message: "MongoDB connection successful",
      databases: dbList.databases.map((db) => db.name),
    })
  } catch (error) {
    console.error("MongoDB connection error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to connect to MongoDB",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
