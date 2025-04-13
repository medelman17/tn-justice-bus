import { Message as AIMessage } from "ai";
import { legalIntake } from "@/mastra";
import { createId } from "@paralleldrive/cuid2";

// Note: Temporarily simplified to avoid auth checks during development
// import { auth } from "@/auth";
import { NextRequest } from "next/server";

// Using Node.js runtime instead of edge runtime due to compatibility issues with Mastra dependencies

export async function POST(req: NextRequest) {
  try {
    // Authentication check is temporarily disabled for development
    // const session = await auth();
    // if (!session || !session.user) {
    //   return Response.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // Parse request body
    const { messages }: { messages: AIMessage[] } = await req.json();

    // Get the latest user message
    const lastUserMessage = messages.filter((m) => m.role === "user").pop();
    if (!lastUserMessage) {
      return new Response(
        JSON.stringify({ error: "No user message found" }), 
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    try {
      // Process the message
      const response = await legalIntake.agent.generate(
        messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }))
      );

      // Log the response for debugging
      console.log("Mastra generated response:", response);
      
      // Create a text encoder
      const encoder = new TextEncoder();
      
      // Create a stream to send the response in the format AI SDK expects
      const stream = new ReadableStream({
        async start(controller) {
          // Create a response message object
          const aiMessage = JSON.stringify({ 
            id: createId(),
            role: "assistant", 
            content: response.text 
          });
          
          // Format in the expected Server-Sent Events format
          controller.enqueue(encoder.encode(`data: ${aiMessage}\n\n`));
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        }
      });
      
      // Return the stream with proper SSE headers
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    } catch (error) {
      console.error("Error generating response:", error);
      return new Response(
        JSON.stringify({ error: "Failed to generate response" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process request" }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
}
