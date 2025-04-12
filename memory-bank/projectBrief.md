# Tennessee Justice Bus Pre-Visit Client Screening Application

## Project Overview

This project aims to develop a web-based application that enhances the Tennessee Justice Bus initiative by providing pre-visit client screening and preparation. The Tennessee Justice Bus brings free legal services to rural "legal deserts" across the state, where access to attorneys is severely limited. This application will help maximize the impact of Justice Bus visits by improving client preparation and streamlining the intake process.

## Problem Statement

Rural Tennessee communities face significant barriers to legal representation:

- Only about 2% of attorneys practice in rural areas despite 14% of Americans living in rural communities
- 40% of US counties have fewer than 1 lawyer per 1,000 residents
- Many rural residents must travel hours to access basic legal services
- The Tennessee Justice Bus program, while valuable, has limited time in each community
- Unprepared clients require significant time for initial intake and issue identification
- Rural connectivity challenges complicate digital solutions

## Project Goals

1. Increase the number of clients successfully served during Justice Bus visits by 30%
2. Reduce time spent on initial intake and documentation gathering by 50%
3. Ensure clients arrive at Justice Bus consultations with organized documentation
4. Improve matching of client legal needs with appropriate volunteer attorneys
5. Create a scalable solution that functions effectively in rural areas with connectivity challenges
6. Gather data on rural legal needs to better inform future Justice Bus routing and resource allocation

## Target Users

- Rural Tennessee residents seeking legal assistance through the Justice Bus program
- Adults across age groups with varying levels of digital literacy
- Individuals with civil legal needs such as housing, family law, benefits, and consumer issues
- Tennessee Justice Bus volunteer attorneys and legal aid organization staff

## Technical Requirements

- Next.js 14+ application hosted on Vercel
- Progressive Web App (PWA) capabilities for offline functionality
- Mobile-first, responsive design with WCAG 2.1 AA accessibility compliance
- Claude AI integration for guided intake assistance
- Integration with Vercel Postgres, KV, and Blob Storage
- Secure document upload and management capabilities
- Appointment scheduling for Justice Bus visits
- Multi-language support with focus on English and Spanish

## Key Features

1. **Virtual Intake Assistant**

   - Conversational interface using Claude AI
   - Progressive disclosure to minimize overwhelm
   - Plain language explanations of legal terminology
   - Multi-language support

2. **Legal Issue Identifier**

   - Guided interview to identify specific legal issues
   - Classification of issues into appropriate categories
   - Prioritization of time-sensitive matters
   - Identification of potential conflicts

3. **Document Preparation Guide**

   - Customized checklists based on issue type
   - Explanation of why each document is important
   - Secure document upload capability
   - Document organization instructions

4. **Appointment Scheduler**

   - Integration with Justice Bus visit calendar
   - Matching client availability with scheduled visits
   - Estimated consultation duration
   - Confirmation and reminder system

5. **Offline Capabilities**
   - Service worker for offline functionality
   - Background sync for form submissions
   - Local storage for works-in-progress
   - Minimal bandwidth requirements

## Technical Architecture

- **Frontend**: Next.js 14+ with App Router, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Next.js API Routes, Vercel Serverless Functions
- **Database**: Vercel Postgres for structured data
- **Storage**: Vercel Blob Storage for document files
- **Caching**: Vercel KV (Redis) for session management and caching
- **AI**: Anthropic's Claude API for conversational assistance
- **Authentication**: NextAuth.js
- **Hosting/Infrastructure**: Vercel Platform

## Project Timeline

### Phase 1: Foundation (Weeks 1-4)

- Project setup with Next.js on Vercel
- Core database schema implementation
- Authentication system implementation
- Basic user management
- Project infrastructure and CI/CD setup

### Phase 2: Core Features (Weeks 5-8)

- Intake flow implementation
- Document management system
- Claude AI integration for basic assistance
- PWA configuration
- Basic appointment scheduling

### Phase 3: Enhanced Features (Weeks 9-12)

- Offline mode implementation
- Advanced AI assistance features
- Justice Bus visit integration
- Notification system
- Administrator interface

### Phase 4: Optimization & Testing (Weeks 13-16)

- Performance optimization
- Accessibility improvements
- Comprehensive testing
- Documentation
- Security audit

## Success Metrics

- Number of clients pre-screened through the system
- Reduction in intake time during Justice Bus visits
- Percentage of clients arriving with complete documentation
- Attorney feedback on client preparation quality
- Client satisfaction with the pre-screening process
- Number of additional clients served per Justice Bus visit
- System usage statistics in target rural communities

## Ethical & Legal Considerations

- Clear disclaimers that the system does not provide legal advice
- Attorney review of all legal information provided through the system
- Avoidance of unauthorized practice of law concerns
- Mechanisms to identify and escalate emergency legal situations
- Protection of client confidentiality and privilege concerns
- Inclusive design for users with limited digital literacy or internet access

## Key Stakeholders

- Tennessee Supreme Court Access to Justice Commission
- Tennessee Alliance for Legal Services
- Legal Aid of East Tennessee, Legal Aid of Middle Tennessee and the Cumberlands, West Tennessee Legal Services, and Memphis Area Legal Services
- Tennessee Bar Association
- Rural county court clerks and administrators
- Volunteer Justice Bus attorneys
- Rural community partners (libraries, community centers, etc.)

## Resources & References

- [Tennessee Justice Bus Initiative](https://justiceforalltn.org/)
- [Tennessee Access to Justice Commission](https://www.tncourts.gov/programs/access-justice)
- [Legal Aid of East Tennessee](https://www.laet.org/)
- [Rural Justice Collaborative](https://www.ruraljusticecollaborative.org/)
- [Legal Services Corporation Justice Gap Report](https://justicegap.lsc.gov/)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Claude API Documentation](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)

## Contact Information

**Project Owner**: Tennessee Access to Justice Commission  
**Technical Lead**: [Name and contact information]  
**Legal Subject Matter Expert**: [Name and contact information]  
**Stakeholder Representative**: [Name and contact information]
