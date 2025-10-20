import { TweetComposer } from "@/components/tweet-composer"

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-balance">おれったー</h1>
          <p className="text-muted-foreground text-pretty">タイムラインは甘え。</p>
        </div>
        <TweetComposer />
      </div>
    </main>
  )
}
