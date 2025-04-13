import { Message as AIMessage } from "ai";
import { legalIntake } from "@/mastra";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    // Authentication check
    // const session = await auth();
    // if (!session || !session.user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // Parse request
    const { messages }: { messages: AIMessage[] } = await req.json();
    
    // Format messages for Mastra
    const formattedMessages = messages.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    }));

    // Create agent response
    const response = await legalIntake.agent.generate(formattedMessages);
    
    // Return response in the format expected by useChat
    return NextResponse.json({ 
      role: "assistant", 
      content: response.text 
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
} 