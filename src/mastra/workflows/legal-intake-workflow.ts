/**
 * NOTE: This is a simplified version of the legal intake workflow.
 * The complete implementation with proper Mastra typing will be added
 * once we have the appropriate type definitions and better understanding
 * of the Mastra framework API.
 */
import { z } from "zod";
import { intakeAgent } from "../agents/intake-agent";

// ISSUE CATEGORIES
export const LEGAL_ISSUE_TYPES = [
  "housing",
  "family",
  "consumer",
  "benefits",
  "employment",
  "other",
] as const;

// Required documents by issue type
export const REQUIRED_DOCUMENTS: Record<string, string[]> = {
  housing: [
    "Valid ID",
    "Contact information",
    "Lease agreement",
    "Any notices from landlord",
    "Rent receipts or payment records",
    "Photos of housing conditions (if relevant)",
  ],
  family: [
    "Valid ID",
    "Contact information",
    "Marriage certificate (if applicable)",
    "Birth certificates of children (if applicable)",
    "Existing court orders",
    "Income information",
  ],
  consumer: [
    "Valid ID",
    "Contact information",
    "Contracts or agreements",
    "Bills or invoices",
    "Collection notices",
    "Credit reports",
  ],
  benefits: [
    "Valid ID",
    "Contact information",
    "Benefit award/denial letters",
    "Income documentation",
    "Medical records (if applicable)",
    "Application materials",
  ],
  employment: [
    "Valid ID",
    "Contact information",
    "Employment contract",
    "Pay stubs",
    "Correspondence with employer",
    "Performance reviews or disciplinary notices",
  ],
  other: ["Valid ID", "Contact information"],
};

/**
 * Determine the type of legal issue from conversation text
 */
export function determineIssueType(
  text: string
): (typeof LEGAL_ISSUE_TYPES)[number] {
  const textLower = text.toLowerCase();

  if (
    textLower.includes("eviction") ||
    textLower.includes("landlord") ||
    textLower.includes("tenant")
  ) {
    return "housing";
  } else if (
    textLower.includes("divorce") ||
    textLower.includes("custody") ||
    textLower.includes("child support")
  ) {
    return "family";
  } else if (
    textLower.includes("debt") ||
    textLower.includes("credit") ||
    textLower.includes("loan")
  ) {
    return "consumer";
  } else if (
    textLower.includes("unemployment") ||
    textLower.includes("disability") ||
    textLower.includes("medicaid")
  ) {
    return "benefits";
  } else if (
    textLower.includes("job") ||
    textLower.includes("workplace") ||
    textLower.includes("employer")
  ) {
    return "employment";
  }

  return "other";
}

/**
 * Determine the urgency level of a legal issue
 * @returns A number from 1-5, with 5 being the most urgent
 */
export function determineUrgency(text: string): number {
  const textLower = text.toLowerCase();

  if (
    textLower.includes("immediate") ||
    textLower.includes("emergency") ||
    textLower.includes("tomorrow")
  ) {
    return 5; // Highest urgency
  } else if (textLower.includes("soon") || textLower.includes("next week")) {
    return 4;
  } else if (textLower.includes("month") || textLower.includes("concerned")) {
    return 3;
  }

  return 2; // Default moderate urgency
}

/**
 * This function will run a full legal intake conversation with the client
 * It manages the entire flow in a simplified way compared to the full workflow implementation
 */
export async function runLegalIntakeConversation(initialMessage: string) {
  // Initial greeting and question
  const response = await intakeAgent.generate([
    { role: "user", content: initialMessage },
  ]);

  // For now, we'll return the response
  // In the actual implementation, this would manage a multi-turn conversation
  return response.text;
}

// Temporary export for testing
export const legalIntakeWorkflow = {
  runConversation: runLegalIntakeConversation,
  determineIssueType,
  determineUrgency,
  getRequiredDocuments: (issueType: string) =>
    REQUIRED_DOCUMENTS[issueType] || REQUIRED_DOCUMENTS.other,
};

export default legalIntakeWorkflow;
