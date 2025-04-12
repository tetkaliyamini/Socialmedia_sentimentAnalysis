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

interface TopHashtagsProps {
  tweets: Tweet[]
}

export default function TopHashtags({ tweets }: TopHashtagsProps) {
  const [hashtags, setHashtags] = useState<{ tag: string; count: number }[]>([])

  useEffect(() => {
    if (!tweets.length) return

    // Extract hashtags from tweets
    const allHashtags: string[] = []

    tweets.forEach((tweet) => {
      const matches = tweet.text.match(/#[\w]+/g)
      if (matches) {
        allHashtags.push(...matches)
      }
    })

    // Count hashtag frequency
    const hashtagCount: Record<string, number> = {}
    allHashtags.forEach((tag) => {
      hashtagCount[tag.toLowerCase()] = (hashtagCount[tag.toLowerCase()] || 0) + 1
    })

    // Convert to array and sort by count
    const sortedHashtags = Object.entries(hashtagCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Take top 10 hashtags

    setHashtags(sortedHashtags)
  }, [tweets])

  if (!hashtags.length) {
    return <div className="text-center py-8 text-muted-foreground">No hashtags found in tracked tweets</div>
  }

  return (
    <div className="space-y-2">
      {hashtags.map(({ tag, count }) => (
        <div key={tag} className="flex justify-between items-center">
          <Badge variant="outline">{tag}</Badge>
          <span className="text-sm text-muted-foreground">{count}</span>
        </div>
      ))}
    </div>
  )
}

