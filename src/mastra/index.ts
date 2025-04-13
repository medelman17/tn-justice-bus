import { Mastra } from "@mastra/core";
import { intakeAgent } from "./agents/intake-agent";
import legalIntakeWorkflow from "./workflows/legal-intake-workflow";

// Initialize Mastra with our agents
// For now, we're not registering workflows with Mastra due to typing issues
export const mastra = new Mastra({
  agents: {
    intakeAgent,
  },
});

// Export components for direct use
export { intakeAgent, legalIntakeWorkflow };

// Export a simplified API for the intake system
export const legalIntake = {
  agent: intakeAgent,
  runConversation: legalIntakeWorkflow.runConversation,
  determineIssueType: legalIntakeWorkflow.determineIssueType,
  determineUrgency: legalIntakeWorkflow.determineUrgency,
  getRequiredDocuments: legalIntakeWorkflow.getRequiredDocuments,
};
