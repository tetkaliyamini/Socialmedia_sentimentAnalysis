"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, Loader2 } from "lucide-react"
import SearchForm from "@/components/search-form"
import TweetList from "@/components/tweet-list"
import SentimentChart from "@/components/sentiment-chart"
import WordCloud from "@/components/word-cloud"
import TopHashtags from "@/components/top-hashtags"
import { useToast } from "@/hooks/use-toast"
import { startStream, stopStream } from "@/app/actions/twitter-actions"
import { motion } from "framer-motion"

export default function Dashboard() {
  const [isStreaming, setIsStreaming] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [tweets, setTweets] = useState([])
  const [usingMockData, setUsingMockData] = useState(false)
  const [sentimentData, setSentimentData] = useState({
    positive: 0,
    negative: 0,
    neutral: 0,
  })
  const { toast } = useToast()

  // Poll for new tweets when streaming is active
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isStreaming) {
      const fetchTweets = async () => {
        try {
          const response = await fetch(`/api/tweets?term=${encodeURIComponent(searchTerm)}`)
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          const data = await response.json()

          if (data.tweets && Array.isArray(data.tweets)) {
            setTweets(data.tweets)
            setUsingMockData(data.usingMockData || false)

            // Update sentiment counts
            const counts = data.tweets.reduce(
              (acc: any, tweet: any) => {
                const sentiment = tweet.sentiment || "neutral"
                acc[sentiment] += 1
                return acc
              },
              { positive: 0, negative: 0, neutral: 0 },
            )

            setSentimentData(counts)
          }
        } catch (error) {
          console.error("Error fetching tweets:", error)
        }
      }

      // Fetch immediately on start
      fetchTweets()

      // Then set up interval
      interval = setInterval(fetchTweets, 5000) // Poll every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isStreaming, searchTerm])

  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      toast({
        title: "Error",
        description: "Please enter a search term",
        variant: "destructive",
      })
      return
    }

    setSearchTerm(term)
    setIsLoading(true)

    try {
      if (!isStreaming) {
        await startStream(term)
        setIsStreaming(true)
        toast({
          title: "Stream started",
          description: `Now tracking tweets about "${term}"`,
        })
      } else {
        await stopStream()
        await startStream(term)
        toast({
          title: "Search updated",
          description: `Now tracking tweets about "${term}"`,
        })
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Failed to start tweet stream",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStopStream = async () => {
    setIsLoading(true)
    try {
      await stopStream()
      setIsStreaming(false)
      toast({
        title: "Stream stopped",
        description: "Tweet tracking has been stopped",
      })
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Failed to stop tweet stream",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Twitter Sentiment Analysis
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <SearchForm
          onSearch={handleSearch}
          isStreaming={isStreaming}
          onStopStream={handleStopStream}
          isLoading={isLoading}
        />
      </motion.div>

      {usingMockData && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <InfoIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertTitle className="text-yellow-800 dark:text-yellow-300">Using Mock Data</AlertTitle>
            <AlertDescription className="text-yellow-700 dark:text-yellow-400">
              Twitter API rate limits have been reached. Displaying generated mock data instead of real tweets.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {isStreaming && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle>Sentiment Overview</CardTitle>
                <CardDescription>Distribution of sentiment in tracked tweets</CardDescription>
              </CardHeader>
              <CardContent>
                <SentimentChart data={sentimentData} />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle>Word Cloud</CardTitle>
                <CardDescription>Common words in tracked tweets</CardDescription>
              </CardHeader>
              <CardContent>
                <WordCloud tweets={tweets} />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle>Top Hashtags</CardTitle>
                <CardDescription>Most used hashtags in tracked tweets</CardDescription>
              </CardHeader>
              <CardContent>
                <TopHashtags tweets={tweets} />
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Tweets</TabsTrigger>
            <TabsTrigger value="positive">Positive</TabsTrigger>
            <TabsTrigger value="neutral">Neutral</TabsTrigger>
            <TabsTrigger value="negative">Negative</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <TweetList tweets={tweets} />
          </TabsContent>
          <TabsContent value="positive">
            <TweetList tweets={tweets.filter((t) => t?.sentiment === "positive")} />
          </TabsContent>
          <TabsContent value="neutral">
            <TweetList tweets={tweets.filter((t) => t?.sentiment === "neutral")} />
          </TabsContent>
          <TabsContent value="negative">
            <TweetList tweets={tweets.filter((t) => t?.sentiment === "negative")} />
          </TabsContent>
        </Tabs>
      </motion.div>

      {isLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl flex items-center space-x-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-lg font-medium">Processing...</p>
          </div>
        </div>
      )}
    </div>
  )
}
