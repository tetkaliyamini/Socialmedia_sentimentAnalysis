"use client"

import type React from "react"

import { useState } from "react"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

interface SearchFormProps {
  onSearch: (term: string) => void
  isStreaming: boolean
  onStopStream: () => void
}

export default function SearchForm({ onSearch, isStreaming, onStopStream }: SearchFormProps) {
  const [term, setTerm] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(term)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Enter topic, hashtag, or keyword..."
              className="pl-8"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              disabled={isStreaming}
            />
          </div>
          {isStreaming ? (
            <Button variant="destructive" type="button" onClick={onStopStream}>
              <X className="mr-2 h-4 w-4" />
              Stop Tracking
            </Button>
          ) : (
            <Button type="submit">
              <Search className="mr-2 h-4 w-4" />
              Start Tracking
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

