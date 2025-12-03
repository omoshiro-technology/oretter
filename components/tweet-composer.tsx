"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ImageIcon, VideoIcon, X, Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

const MAX_TWEET_LENGTH = 280
const MAX_FILES = 4
const DEFAULT_REPLY_TEXT = "このツイートはおれったーから投稿されています。"
const REPLY_TEXT_STORAGE_KEY = "oretter_reply_text"
const AUTO_REPLY_ENABLED_KEY = "oretter_auto_reply_enabled"

export function TweetComposer() {
  const [text, setText] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [isPosting, setIsPosting] = useState(false)
  const [replyText, setReplyText] = useState(DEFAULT_REPLY_TEXT)
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(true)
  const [showFlush, setShowFlush] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const savedReplyText = localStorage.getItem(REPLY_TEXT_STORAGE_KEY)
    if (savedReplyText) {
      setReplyText(savedReplyText)
    }
    const savedAutoReplyEnabled = localStorage.getItem(AUTO_REPLY_ENABLED_KEY)
    if (savedAutoReplyEnabled !== null) {
      setAutoReplyEnabled(savedAutoReplyEnabled === "true")
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(REPLY_TEXT_STORAGE_KEY, replyText)
  }, [replyText])

  useEffect(() => {
    localStorage.setItem(AUTO_REPLY_ENABLED_KEY, String(autoReplyEnabled))
  }, [autoReplyEnabled])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const selectedFiles = Array.from(e.target.files || [])

    if (files.length + selectedFiles.length > MAX_FILES) {
      toast({
        title: "ファイル数の上限",
        description: `最大${MAX_FILES}個までのファイルをアップロードできます`,
        variant: "destructive",
      })
      return
    }

    const validFiles = selectedFiles.filter((file) => {
      if (type === "image") {
        return file.type.startsWith("image/")
      } else {
        return file.type.startsWith("video/")
      }
    })

    setFiles((prev) => [...prev, ...validFiles])
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handlePost = async () => {
    if (!text.trim() && files.length === 0) {
      toast({
        title: "エラー",
        description: "テキストまたはメディアを追加してください",
        variant: "destructive",
      })
      return
    }

    setIsPosting(true)

    try {
      const response = await fetch("/api/tweet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          files: files.map((f) => f.name),
          replyText: autoReplyEnabled ? replyText : null,
        }),
      })

      if (!response.ok) {
        throw new Error("投稿に失敗しました")
      }

      const data = await response.json()

      setShowFlush(true)
      setTimeout(() => setShowFlush(false), 2000)

      setText("")
      setFiles([])
    } catch (error) {
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "投稿に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsPosting(false)
    }
  }

  const remainingChars = MAX_TWEET_LENGTH - text.length
  const isOverLimit = remainingChars < 0

  return (
    <>
      {showFlush && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="text-center animate-in zoom-in duration-300">
            <div className="text-8xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Flush!💩
            </div>
          </div>
        </div>
      )}

      <Card className="shadow-lg">
        <CardContent className="pt-6 space-y">
          <Textarea
            placeholder="いまどうしてる？"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-32 resize-none text-lg border-0 focus-visible:ring-0 px-4 py-3"
            disabled={isPosting}
          />

          {files.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {files.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    {file.type.startsWith("image/") ? (
                      <img
                        src={URL.createObjectURL(file) || "/placeholder.svg"}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFile(index)}
                    disabled={isPosting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 border-t space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-reply-toggle" className="text-sm text-muted-foreground">
                自動リプライ
              </Label>
              <Switch
                id="auto-reply-toggle"
                checked={autoReplyEnabled}
                onCheckedChange={setAutoReplyEnabled}
                disabled={isPosting}
              />
            </div>
            <Textarea
              id="reply-text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="リプライのテキストを入力"
              disabled={isPosting || !autoReplyEnabled}
              className="min-h-40 md:min-h-54 resize-none text-sm border-0 focus-visible:ring-0 px-4 py-3"
            />
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-2">
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e, "image")}
              disabled={isPosting || files.length >= MAX_FILES}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => document.getElementById("image-upload")?.click()}
              disabled={isPosting || files.length >= MAX_FILES}
            >
              <ImageIcon className="h-5 w-5" />
            </Button>

            <input
              type="file"
              id="video-upload"
              accept="video/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e, "video")}
              disabled={isPosting || files.length >= MAX_FILES}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => document.getElementById("video-upload")?.click()}
              disabled={isPosting || files.length >= MAX_FILES}
            >
              <VideoIcon className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <span className={`text-sm font-medium ${isOverLimit ? "text-destructive" : "text-muted-foreground"}`}>
              {remainingChars}
            </span>
            <Button
              onClick={handlePost}
              disabled={isPosting || isOverLimit || (!text.trim() && files.length === 0)}
              className="min-w-24"
            >
              {isPosting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  投稿中...
                </>
              ) : (
                "ツイート"
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </>
  )
}
