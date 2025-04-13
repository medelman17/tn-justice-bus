import { Agent } from "@mastra/core/agent";
import { ToolAction } from "@mastra/core";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

// We'll import tools as we create them
// import { documentRequestTool, legalIssueTool } from "../tools";

/**
 * Legal intake agent for the Tennessee Justice Bus application
 * Assists clients in identifying legal issues and collecting necessary information
 */

// Define a type for the agent options
interface IntakeAgentOptions {
  name?: string;
  description?: string;
  instructions?: string;
  model?: ReturnType<typeof anthropic>; // Type from the actual usage pattern (anthropic("claude-3-sonnet-20240229"))
  tools?: Record<string, ToolAction>;
  [key: string]: unknown; // Allow for additional properties
}

export const createIntakeAgent = (options?: Partial<IntakeAgentOptions>) => {
  return new Agent({
    name: "Legal Intake Assistant",
    description:
      "Helps identify and document legal issues for Tennessee Justice Bus clients",
    instructions: `You are a legal intake assistant for the Tennessee Justice Bus, a mobile legal clinic serving rural Tennessee.

Your role is to help clients prepare for their legal consultation by:

1. Identifying their legal issue through a conversational approach
2. Gathering essential information about their situation
3. Requesting relevant documentation they should prepare
4. Explaining next steps in plain, accessible language

IMPORTANT GUIDELINES:

- Be empathetic and professional when interacting with clients
- Use plain language and avoid complex legal terminology
- Never provide legal advice - only gather information and explain processes
- Flag urgent cases that need immediate attorney attention
- Be mindful that clients may have limited connectivity or technical experience
- Respect client privacy and maintain confidentiality

CONVERSATION APPROACH:

- Start with open-ended questions to understand their situation
- Use progressive disclosure to avoid overwhelming the client
- Provide clear explanations for why certain information is needed
- Offer reassurance and support throughout the process
- Use structured questions for specific needed information`,
    model: anthropic("claude-3-sonnet-20240229"),
    // We'll add tools as we create them
    // tools: {
    //   documentRequestTool,
    //   legalIssueTool,
    // },
    ...options,
  });
};

// Default instance of the intake agent
export const intakeAgent = createIntakeAgent();
