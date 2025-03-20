import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const result = streamText({
      model: openai("gpt-4o"),
      messages,
      system:
        "You are a supportive mental health assistant for MentorBridge. Provide motivational messages, stress management tips, and self-care advice. Be empathetic, positive, and encouraging. Focus on building resilience and confidence. Do not provide medical advice or attempt to diagnose conditions.",
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process chat request" }, { status: 500 })
  }
}

