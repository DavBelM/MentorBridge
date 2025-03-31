import { GoogleGenerativeAI } from '@google/generative-ai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    // Get the session (skip auth check for testing)
    const session = await getServerSession(authOptions);
    
    // Parse request
    const { messages } = await req.json();

    // Debug log
    console.log("Processing chat request with messages:", 
      messages.map((m: any) => ({ role: m.role, content: m.content.substring(0, 50) + '...' }))
    );
    
    // Get the last user message
    const lastUserMessage = messages
      .filter((m: any) => m.role === 'user')
      .pop()?.content || "Hello";
    
    // Simple non-streaming implementation first to test
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      // Define interfaces for message structure
      interface ChatMessage {
        role: string;
        content: string;
      }

      // Define the prompt structure
      interface GeminiPrompt {
        text: string;
      }

      // Create the prompt text
      const promptText: string = `You are a supportive mental health assistant focused on helping students. Your primary approach is conversational and thoughtful.

        CONVERSATION STYLE:
        - Keep responses brief (under 150 words) and conversational
        - Ask clarifying questions to better understand the person's situation
        - Don't try to solve everything at once
        - Respond to emotional cues with empathy
        - Use a warm, supportive tone
        - When appropriate, gently ask follow-up questions to deepen the conversation
        
        IMPORTANT GUIDELINES:
        - You are having a conversation, not giving a lecture
        - Prioritize understanding over advice-giving
        - If someone seems to be in crisis, recommend professional help
        
        USER'S LATEST MESSAGE: "${lastUserMessage}"
        
        Previous conversation context for reference:
        ${(messages as ChatMessage[]).slice(-6).map((m: ChatMessage) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n')}
        
        Respond thoughtfully and conversationally while following the guidelines above.`;

      // Generate the content
      const result = await model.generateContent(promptText);
      
      const response = result.response.text();
      console.log("Generated response:", response.substring(0, 100) + '...');
      
      // Return as a simple JSON response for testing
      return Response.json({ 
        role: 'assistant',
        content: response 
      });
    } catch (aiError) {
      console.error("AI Generation Error:", aiError);
      return Response.json({ 
        role: 'assistant',
        content: "I'm sorry, I couldn't process your request. Please try again with a different question."
      }, { status: 500 });
    }
  } catch (error) {
    console.error("[MENTAL HEALTH API ERROR]", error);
    return Response.json({ 
      role: 'assistant',
      content: "Sorry, there was an error processing your request."
    }, { status: 500 });
  }
}