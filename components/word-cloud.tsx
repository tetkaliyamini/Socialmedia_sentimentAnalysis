"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"

interface Tweet {
  id: string
  text: string
  username: string
  created_at: string
  sentiment: string
}

interface WordCloudProps {
  tweets: Tweet[]
}

export default function WordCloud({ tweets }: WordCloudProps) {
  const [words, setWords] = useState<{ text: string; count: number }[]>([])

  useEffect(() => {
    if (!tweets.length) return

    // Extract words from tweets
    const allWords = tweets
      .map((tweet) => tweet.text.toLowerCase())
      .join(" ")
      .replace(/https?:\/\/\S+/g, "") // Remove URLs
      .replace(/[^\w\s]/g, "") // Remove punctuation
      .split(/\s+/) // Split by whitespace
      .filter(
        (word) =>
          word.length > 3 &&
          !["this", "that", "with", "from", "have", "they", "will", "what", "when", "where", "which"].includes(word),
      )

    // Count word frequency
    const wordCount: Record<string, number> = {}
    allWords.forEach((word) => {
      wordCount[word] = (wordCount[word] || 0) + 1
    })

    // Convert to array and sort by count
    const sortedWords = Object.entries(wordCount)
      .map(([text, count]) => ({ text, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20) // Take top 20 words

    setWords(sortedWords)
  }, [tweets])

  if (!words.length) {
    return <div className="text-center py-8 text-muted-foreground">Not enough data to generate word cloud</div>
  }

  // Calculate font sizes based on frequency
  const maxCount = Math.max(...words.map((w) => w.count))
  const minCount = Math.min(...words.map((w) => w.count))
  const fontSizeScale = (count: number) => {
    // Scale from 0.8rem to 1.5rem
    const normalized = (count - minCount) / (maxCount - minCount || 1)
    return 0.8 + normalized * 0.7
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {words.map(({ text, count }) => (
        <Badge
          key={text}
          variant="outline"
          style={{
            fontSize: `${fontSizeScale(count)}rem`,
            opacity: 0.5 + (count / maxCount) * 0.5,
          }}
        >
          {text}
        </Badge>
      ))}
    </div>
  )
}

