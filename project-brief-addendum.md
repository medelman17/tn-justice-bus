# Project Brief Addendum: Mastra Integration

## Overview

Following additional technical research, this addendum proposes integrating Mastra - an open-source TypeScript AI agent framework - into the Tennessee Justice Bus Pre-Visit Client Screening Application. This addendum should be considered alongside the original project brief, enhancing rather than replacing the core technical approach.

## Mastra Framework

Mastra is a TypeScript-native AI agent framework developed by the team behind Gatsby (the React web framework). It builds on top of the Vercel AI SDK while providing additional agent-specific capabilities that align perfectly with our project requirements:

- **Built-in Agent Memory**: Persistent memory capabilities for maintaining context throughout user interactions
- **Graph-based Workflow Engine**: Structured conversation flows with branching, chaining and state persistence
- **Human-in-the-loop Support**: Ability to pause execution and involve Justice Bus attorneys when needed
- **Retrieval-Augmented Generation**: Built-in document processing for knowledge integration
- **Integrated Observability**: Tracing and evaluation tools to monitor agent performance

## Technical Integration

### Architecture Updates

The updated architecture will incorporate Mastra's agent framework while maintaining the core Next.js and Vercel foundations:

```
┌─────────────────────────────────────────────────┐
│            Client (Next.js Application)          │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│                 Vercel Edge Network              │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│              Mastra Agent Framework              │
└─────────────┬──────────────────┬────────────────┘
              │                  │
              ▼                  ▼
┌──────────────────────┐   ┌─────────────────────┐
│  Anthropic Claude    │   │  Workflow Engine    │
│   (via Vercel AI)    │   │                     │
└──────────────────────┘   └─────────────────────┘
              │                  │
              ▼                  ▼
┌──────────────────────┐   ┌─────────────────────┐
│  Knowledge Base      │   │  Persistent Agent   │
│  (Vector Database)   │   │     Memory          │
└──────────────────────┘   └─────────────────────┘
```

### Key Implementation Components

1. **Intake Agent**
   - Designed using Mastra's agent APIs
   - Configured with Claude 3.7 Sonnet as the underlying LLM
   - Persistent memory for maintaining context during disconnections
   - Tool integration for document requirement identification

2. **Intake Workflow**
   - Graph-based workflow design with explicit branching conditions
   - Step-by-step progression through the intake process
   - Support for pausing and resuming based on connectivity
   - Integration points for human review of complex cases

3. **Tennessee Legal Knowledge Base**
   - RAG implementation using Mastra's document processing capabilities
   - Integration of legal aid guidelines, document requirements, and case referral criteria
   - Semantic search for matching issues to appropriate legal resources

4. **Human-in-the-Loop Integration**
   - Workflow suspension points for attorney review
   - Notification system for Justice Bus staff
   - Interface for attorneys to provide guidance within the flow

## Development Approach

### Implementation Phases

The implementation phases remain similar to the original plan, with Mastra-specific adjustments:

1. **Foundation (Weeks 1-4)**
   - Initial project setup with Next.js and Mastra
   - `pnpm create mastra` to bootstrap the agent framework
   - Core database schema implementation
   - Authentication system integration

2. **Agent & Workflow Development (Weeks 5-8)**
   - Implementation of the intake agent using Mastra's agent APIs
   - Workflow definition for the intake process
   - Document management system implementation
   - Basic appointment scheduling integration

3. **Knowledge Integration & Testing (Weeks 9-12)**
   - Tennessee-specific knowledge base creation using Mastra's RAG capabilities
   - Integration with Justice Bus visit scheduling
   - Offline capabilities implementation
   - Initial user testing with rural community partners

4. **Optimization & Deployment (Weeks 13-16)**
   - Performance optimization for rural connectivity
   - Accessibility improvements
   - Comprehensive testing
   - Deployment to Vercel for production use

### Development Environment

The enhanced development environment will leverage Mastra's built-in tools:

- Local agent playground for testing and debugging conversations
- Tracing visualizations for workflow execution
- Built-in evaluation metrics for agent performance
- Integration with Vercel's deployment pipeline

## Technical Benefits

Integrating Mastra provides several key benefits for the Tennessee Justice Bus application:

1. **Streamlined Agent Development**
   - Purpose-built framework for agent interactions reduces development time
   - TypeScript typing improves code reliability and maintainability

2. **Enhanced Workflow Management**
   - Graph-based workflows provide better control over conversation flow
   - State persistence improves resilience in disconnected environments

3. **Improved Observability**
   - Built-in tracing helps identify issues in agent behavior
   - Evaluation capabilities ensure agent responses meet quality standards

4. **Better Knowledge Integration**
   - RAG capabilities simplify integration of Tennessee-specific legal information
   - Unified API for vector databases simplifies implementation

## Getting Started

To begin implementation with Mastra:

1. Install Mastra using Node.js (v20.0+):
   ```bash
   pnpm create mastra
   ```

2. Configure API keys for Anthropic Claude:
   ```
   ANTHROPIC_API_KEY=your_key_here
   ```

3. Initialize the development environment:
   ```bash
   mastra dev
   ```

## Conclusion

Integrating the Mastra framework enhances our original technical approach by providing purpose-built agent capabilities while maintaining compatibility with our Next.js and Vercel foundation. This approach combines the best of both worlds: Vercel's robust infrastructure and Mastra's agent-specific features. The result will be a more capable, resilient, and maintainable application that better serves the needs of rural Tennessee residents seeking legal assistance.
