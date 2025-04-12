import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

interface Tweet {
  id: string
  text: string
  username: string
  created_at: string
  sentiment: "positive" | "negative" | "neutral"
  sentiment_score: number
}

interface TweetListProps {
  tweets: Tweet[]
}

export default function TweetList({ tweets }: TweetListProps) {
  if (!tweets.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No tweets to display. Start tracking a topic to see tweets here.
      </div>
    )
  }

  return (
    <div className="space-y-4 mt-4">
      {tweets.map((tweet) => (
        <Card key={tweet.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="font-medium">@{tweet.username}</div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    tweet.sentiment === "positive"
                      ? "default"
                      : tweet.sentiment === "negative"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {tweet.sentiment} ({tweet.sentiment_score.toFixed(2)})
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(tweet.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
            <p className="text-sm">{tweet.text}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

