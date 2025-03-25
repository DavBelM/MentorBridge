import { NextRequest } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Edge runtime is compatible with Vercel
export const runtime = 'edge';

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { messages } = await req.json();
    
    // Initialize the Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    // Format messages for Gemini
    const systemPrompt = "You are a supportive mental health assistant for MentorBridge, a mentorship platform. Provide compassionate guidance on stress management, work-life balance, motivation, and general mental wellness. You are not a replacement for professional therapy, but you can offer evidence-based techniques and supportive advice. If users ask about severe mental health issues like suicide or self-harm, encourage them to seek professional help and provide crisis resources.";
    
    // Convert the message format to what Gemini expects
    const history = [];
    interface Message {
      role: string;
      content: string;
    }

    let userMessages: string[] = messages.filter((m: Message) => m.role === 'user').map((m: Message) => m.content);
    let assistantMessages: string[] = messages.filter((m: Message) => m.role === 'assistant').map((m: Message) => m.content);
    
    // Build the chat history
    for (let i = 0; i < Math.max(userMessages.length, assistantMessages.length); i++) {
      if (i < userMessages.length) {
        history.push({ role: "user", parts: [{ text: userMessages[i] }] });
      }
      if (i < assistantMessages.length) {
        history.push({ role: "model", parts: [{ text: assistantMessages[i] }] });
      }
    }
    
    // Start the chat and send the system prompt
    const chat = model.startChat({
      history: history,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
      },
    });
    
    // Get the last user message or use a default greeting
    const lastUserMessage = userMessages.length > 0 ? userMessages[userMessages.length - 1] : "Hello";
    
    // Generate the response with streaming
    const result = await chat.sendMessageStream(systemPrompt + "\n\n" + lastUserMessage);
    
    // Create a readable stream from the response
    const encoder = new TextEncoder();
    let fullResponse = ""; // Accumulate the full response

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Process the chunks
          for await (const chunk of result.stream) {
            const text = chunk.text();
            fullResponse += text; // Accumulate the text
            
            // Send the complete message so far
            const message = {
              id: "1", // Use a constant ID to update the same message
              role: "assistant",
              content: fullResponse, // Send the full accumulated text
            };
            
            // Format in the expected SSE format
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(message)}\n\n`));
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        } finally {
          controller.close();
        }
      }
    });

    // Return the stream in SSE format
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process chat request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}