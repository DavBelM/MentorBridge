import { NextRequest } from 'next/server';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { Configuration, OpenAIApi } from 'openai-edge';

// Create an OpenAI API client
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export const runtime = 'edge';

export default async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // Add system message for mental health assistant context
    const fullMessages = [
      {
        role: "system",
        content: "You are a supportive mental health assistant for MentorBridge, a mentorship platform. Provide compassionate guidance on stress management, work-life balance, motivation, and general mental wellness. You are not a replacement for professional therapy, but you can offer evidence-based techniques and supportive advice. If users ask about severe mental health issues like suicide or self-harm, encourage them to seek professional help and provide crisis resources."
      },
      ...messages
    ];

    // Ask OpenAI for a streaming completion
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      stream: true,
      messages: fullMessages,
      max_tokens: 500,
    });

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response);

    // Respond with the stream
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process chat request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}