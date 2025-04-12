import { MongoClient, ServerApiVersion } from "mongodb"

// Fallback URI if environment variable is not found
const fallbackUri = "mongodb+srv://tetakaliyamini:2FFjTW7DCXfjgTEW@cluster0.a0dx6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0" // Replace with your actual URI

// Use environment variable or fallback
const uri = process.env.MONGODB_URI || fallbackUri

console.log("MongoDB URI being used:", uri.replace(/mongodb\+srv:\/\/([^:]+):[^@]+@/, "mongodb+srv://****:****@"))

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise

