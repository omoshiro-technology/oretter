import { type NextRequest, NextResponse } from "next/server"
import { TwitterApi } from "twitter-api-v2"

// Twitter API v2を使用した投稿処理
export async function POST(request: NextRequest) {
  try {
    const { text, files, replyText } = await request.json()

    const apiKey = process.env.TWITTER_API_KEY
    const apiSecret = process.env.TWITTER_API_SECRET
    const accessToken = process.env.TWITTER_ACCESS_TOKEN
    const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET

    if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
      return NextResponse.json({ error: "Twitter API credentials are not configured" }, { status: 500 })
    }

    const client = new TwitterApi({
      appKey: apiKey,
      appSecret: apiSecret,
      accessToken: accessToken,
      accessSecret: accessTokenSecret,
    })

    // メディアのアップロード（ファイルがある場合）
    const mediaIds: string[] = []

    if (files && files.length > 0) {
      for (const file of files) {
        try {
          // Base64データからBufferに変換
          const base64Data = file.data.split(",")[1]
          const buffer = Buffer.from(base64Data, "base64")

          // メディアをアップロード
          const mediaId = await client.v1.uploadMedia(buffer, { mimeType: file.type })
          mediaIds.push(mediaId)
        } catch (error) {
          console.error("[v0] Error uploading media:", error)
        }
      }
    }

    // ツイートの投稿
    const tweetPayload: any = {
      text: text || "",
    }

    if (mediaIds.length > 0) {
      tweetPayload.media = { media_ids: mediaIds }
    }

    const tweet = await client.v2.tweet(tweetPayload)
    const tweetId = tweet.data.id

    if (replyText) {
      try {
        await client.v2.tweet({
          text: replyText,
          reply: {
            in_reply_to_tweet_id: tweetId,
          },
        })
      } catch (error) {
        console.error("[v0] Failed to post reply, but main tweet was successful:", error)
      }
    }

    return NextResponse.json({
      success: true,
      tweetId,
      message: "Tweet and reply posted successfully",
    })
  } catch (error) {
    console.error("[v0] Error posting tweet:", error)
    return NextResponse.json(
      {
        error: "Failed to post tweet",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
