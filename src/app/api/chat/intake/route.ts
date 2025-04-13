import { Message as AIMessage } from "ai";
import { legalIntake } from "@/mastra";

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
      return Response.json({ error: "No user message found" }, { status: 400 });
    }

    // Create a function to handle stream response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Process the message
          const response = await legalIntake.agent.generate(
            messages.map((m) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            }))
          );

          // Send the full response in chunks
          const encoder = new TextEncoder();
          controller.enqueue(encoder.encode(response.text));
          controller.close();
        } catch (error) {
          console.error("Error generating response:", error);
          controller.error(error);
        }
      },
    });

    // Return the stream response
    return new Response(stream);
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
