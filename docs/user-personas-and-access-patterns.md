# User Personas and Access Patterns: Tennessee Justice Bus Application

This document outlines the key user personas who will interact with the Tennessee Justice Bus Pre-Visit Client Screening Application and their primary access patterns. Understanding these personas and patterns is essential for ensuring the application meets the needs of all stakeholders while fulfilling its mission of enhancing access to justice in rural Tennessee.

**Date:** April 13, 2025

## Table of Contents

1. [User Personas](#user-personas)
   - [Rural Tennessee Resident](#rural-tennessee-resident-primary-end-user)
   - [Volunteer Attorney](#volunteer-attorney)
   - [Justice Bus Coordinator](#justice-bus-coordinator)
   - [Community Partner](#community-partner)
2. [Access Patterns](#access-patterns)
   - [Pre-Visit Client Preparation](#1-pre-visit-client-preparation)
   - [Appointment Management](#2-appointment-management)
   - [Legal Issue Assessment](#3-legal-issue-assessment)
   - [Post-Visit Follow-up](#4-post-visit-follow-up)
   - [Program Management and Reporting](#5-program-management-and-reporting)
3. [Implementation Considerations](#implementation-considerations)
4. [Priority Matrix](#priority-matrix)

## User Personas

### Rural Tennessee Resident (Primary End User)

**Profile: Maria Johnson**

- 45-year-old single mother of two from Clay County
- Works multiple part-time jobs, limited financial resources
- High school education, basic smartphone literacy
- Unstable internet connection at home (relies on mobile data)
- Facing potential eviction and needs legal assistance
- Limited transportation options (30+ miles to nearest legal aid office)

**Characteristics:**

- Limited time due to work and family responsibilities
- May have negative past experiences with legal system
- Values clear, straightforward communication
- May be accessing application on older mobile device
- Often in "legal crisis mode" when seeking help
- Limited ability to travel for in-person consultations
- May have data limitations on mobile plan

**Needs:**

- Find when Justice Bus will be in her area
- Understand what documentation to gather before the visit
- Complete intake forms with minimal technical frustration
- Receive clear guidance about her legal issue
- Get notifications via SMS (preferred communication channel)
- Access and complete forms even with spotty connectivity
- Simple language explanations of legal concepts

**Key Metrics:**

- Time to complete intake process
- Percentage of intake completed before Justice Bus visit
- Number of additional clients served per visit
- Client satisfaction with preparation process
- Number of no-shows due to preparation challenges

### Volunteer Attorney

**Profile: James Wilson**

- 38-year-old attorney from Nashville with 10 years of experience
- Specializes in family law and housing issues
- Volunteers with Justice Bus once per month
- Has a busy private practice schedule
- Technically proficient but values efficiency

**Characteristics:**

- Limited volunteer time available
- Strong desire to maximize impact during Justice Bus visits
- Needs to quickly understand client situations
- May be reviewing cases while traveling to Justice Bus locations
- Expects organized, relevant information
- Values preparation to maximize limited consultation time
- Concerned about conflicts of interest and ethical boundaries

**Needs:**

- Preview pre-screened client information before visits
- See organized client documentation
- Understand the specific legal issues before consultations
- Track follow-up actions for clients
- Access relevant Tennessee legal resources quickly
- Coordinate with legal aid organizations on complex cases
- Maintain professional standards while using mobile technology

**Key Metrics:**

- Number of clients served per Justice Bus visit
- Average consultation time per client
- Attorney satisfaction with client preparation
- Percentage of cases resolved during initial consultation
- Number of follow-up actions completed

### Justice Bus Coordinator

**Profile: Sophia Martinez**

- 32-year-old program coordinator for the Tennessee Supreme Court Access to Justice Commission
- Manages Justice Bus scheduling and logistics
- Coordinates volunteer attorneys and community partners
- Responsible for program metrics and reporting
- Champions for rural justice access

**Characteristics:**

- Manages multiple relationships (attorneys, community organizations, courts)
- Needs to maximize Justice Bus impact in each community
- Works both in the office and remotely during Justice Bus trips
- Relies on data to make program improvements
- Advocates for underserved communities
- Balances multiple priorities and stakeholders

**Needs:**

- Schedule and manage Justice Bus events across the state
- Track client metrics (issues addressed, outcomes, follow-ups)
- Coordinate volunteer attorney availability
- Communicate with community partners
- Generate reports on program impact
- Monitor appointment schedules during visits
- Ensure smooth operations during Justice Bus visits

**Key Metrics:**

- Number of Justice Bus visits scheduled per month
- Client attendance rate per visit
- Geographic distribution of services
- Number of volunteer attorneys engaged
- Program impact metrics for reporting to stakeholders

### Community Partner

**Profile: Robert Taylor**

- 56-year-old director of a rural community center in Fentress County
- Helps organize local Justice Bus visits
- Connects community members with the Justice Bus program
- Trusted figure in the local community
- Limited technical expertise but eager to help

**Characteristics:**

- Deep knowledge of local community needs
- May have limited technical resources
- Acts as a bridge between legal services and community members
- Helps with local logistics and venue arrangements
- May assist clients with technology access

**Needs:**

- View upcoming Justice Bus schedules for their location
- Help community members register for appointments
- Share information about required documentation
- Provide feedback on community needs
- Access outreach materials to promote visits
- Monitor appointment availability for urgent cases

**Key Metrics:**

- Number of community members assisted with registration
- Percentage of appointment slots filled
- Community partner satisfaction with coordination process
- Number of new clients reached through community partnerships

## Access Patterns

### 1. Pre-Visit Client Preparation

**Description:** The primary pattern for rural residents who need to prepare for a Justice Bus consultation.

**Flow:**

1. Discover Justice Bus service through community outreach or online
2. Check upcoming Justice Bus visit schedule in their area
3. Register for an appointment (providing basic contact information)
4. Complete preliminary intake forms (identifying legal issue areas)
5. Receive a guided interview specific to their legal issue
6. Upload or prepare required documentation
7. Receive SMS confirmation and reminders
8. Access information offline between initial registration and appointment

**Technical Considerations:**

- Must work with intermittent connectivity
- Needs to persist form data locally when offline
- Should support background synchronization when connectivity returns
- Must maintain authentication state during connectivity drops
- Requires clear progress indicators and save points
- Needs to function on older mobile devices
- Must limit data usage for users with restricted data plans

**Implementation Status:**

- Basic authentication system implemented ✓
- Offline support for form data implemented ✓
- SMS notifications implemented via Knock ✓
- Next.js 15 Route Groups implemented for improved navigation ✓
- Client intake system implemented with Mastra framework ✓
- Appointment scheduling functionality partially implemented

**Next Steps:**

- Enhance offline synchronization for form submissions
- Improve progress indication during intake process
- Optimize for low-bandwidth environments
- Implement document preparation checklists based on legal issue type

### 2. Appointment Management

**Description:** How clients, attorneys, and coordinators interact around Justice Bus appointments.

**Flow:**

1. Client selects available time slot during nearest Justice Bus visit
2. System checks for conflicts and confirms appointment
3. Client receives SMS confirmation with details
4. Volunteer attorney receives notification of new appointment
5. Attorney reviews client information and legal issue
6. Both parties receive reminders as appointment approaches
7. Coordinator monitors schedule and makes adjustments if needed
8. Post-appointment follow-up actions are tracked

**Technical Considerations:**

- Needs real-time synchronization when online
- Must handle offline appointment requests with queue system
- Requires conflict resolution for appointments made offline
- Needs to manage cancellations and rescheduling
- Should support calendar integration for attorneys
- Must send timely SMS notifications regardless of app access
- Needs to handle time zone differences across Tennessee

**Implementation Status:**

- Basic appointment data structure implemented ✓
- SMS notification system implemented via Knock ✓
- Justice Bus events system implemented with JSONB storage ✓
- Offline capabilities implemented with service workers ✓

**Next Steps:**

- Implement calendar selection interface
- Create attorney view for upcoming appointments
- Develop appointment management tools for coordinators
- Build conflict resolution system for offline bookings

### 3. Legal Issue Assessment

**Description:** How the AI-powered intake system helps identify and prepare for specific legal issues.

**Flow:**

1. Client indicates general area of legal concern
2. System conducts conversational interview using Claude AI
3. Based on responses, system identifies specific legal issues
4. System provides customized document checklist based on issue type
5. Client uploads or indicates documents they have available
6. System provides basic legal information (not advice)
7. System prepares summary for attorney review
8. Client can revisit and update information before appointment

**Technical Considerations:**

- Must function with reduced AI capabilities when offline
- Needs to store interview progress for resumption
- Should handle document uploads when connectivity returns
- Must clearly distinguish information from legal advice
- Needs to maintain context across multiple sessions
- Should support multiple language options (English/Spanish)
- Must handle sensitive information securely

**Implementation Status:**

- Claude AI integration implemented through Mastra framework ✓
- Legal intake workflow implemented ✓
- Client intake component created with responsive chat interface ✓
- API endpoint for AI integration implemented ✓

**Next Steps:**

- Enhance offline AI capabilities with local models
- Implement document checklist generation based on legal issue
- Add multi-language support
- Develop attorney summary view

### 4. Post-Visit Follow-up

**Description:** How ongoing support and case tracking works after Justice Bus consultations.

**Flow:**

1. Attorney records consultation summary and next steps
2. Client receives follow-up instructions via SMS and in-app
3. System tracks deadlines for document submissions or court dates
4. Client can submit additional information as requested
5. Attorney can review case updates remotely
6. Coordinator can monitor overall case progression
7. Community partners can assist with follow-up support
8. System captures outcome data for program evaluation

**Technical Considerations:**

- Needs secure messaging capabilities
- Must support document exchange post-consultation
- Should integrate with calendar for deadline tracking
- Needs offline access to follow-up instructions
- Must maintain client-attorney relationship boundaries
- Should support referrals to other services when appropriate
- Needs to capture outcome metrics while maintaining privacy

**Implementation Status:**

- SMS notification system implemented via Knock ✓
- Basic offline capabilities implemented ✓
- Authentication system implemented ✓

**Next Steps:**

- Develop consultation summary interface
- Implement deadline tracking system
- Create secure messaging capabilities
- Build referral management system

### 5. Program Management and Reporting

**Description:** How coordinators and stakeholders monitor and improve the Justice Bus program.

**Flow:**

1. Coordinators schedule and publish upcoming Justice Bus visits
2. System tracks registration and appointment metrics
3. Attorneys indicate availability for specific visits
4. System generates anonymized impact reports
5. Coordinators analyze service gaps and community needs
6. System helps optimize routing and resource allocation
7. Stakeholders review program effectiveness
8. Community partners provide feedback on local impact

**Technical Considerations:**

- Needs powerful admin interface for program management
- Must support complex scheduling across multiple locations
- Should generate visualizations of program metrics
- Needs role-based access controls for different stakeholders
- Must maintain strict data privacy while enabling analytics
- Should support notification workflows for multiple user types
- Needs export capabilities for reporting to funding entities

**Implementation Status:**

- Justice Bus events system implemented with JSONB storage ✓
- Basic user roles implemented in authentication system ✓

**Next Steps:**

- Develop comprehensive admin interface
- Implement analytics dashboard
- Create reporting tools with data export capabilities
- Build attorney availability management system

## Implementation Considerations

For all user personas and access patterns, the application must maintain these core principles:

### Offline-First Implementation

- **Service Worker Strategy**: Utilize Serwist for comprehensive offline capabilities
- **Data Synchronization**: Implement IndexedDB for local storage with background sync
- **Conflict Resolution**: Develop clear strategy for handling conflicting offline changes
- **Progressive Enhancement**: Design features to work with basic functionality offline, enhanced when online
- **Bandwidth Awareness**: Optimize asset loading and API calls for limited data plans

### Accessibility Implementation

- **WCAG 2.1 AA Compliance**: Ensure all interfaces meet accessibility standards
- **Screen Reader Compatibility**: Test with screen readers for proper navigation
- **Keyboard Navigation**: Support complete keyboard control of all interfaces
- **Color Contrast**: Ensure sufficient contrast for all text and interface elements
- **Text Scaling**: Support text resizing without loss of functionality
- **Simple Language**: Use 6th-grade reading level for all user-facing text
- **Error Recovery**: Clear error messages with recovery paths

### Security Implementation

- **Authentication**: JWT-based authentication with secure offline token storage
- **Authorization**: Role-based access control for different user types
- **Data Protection**: Encryption for sensitive client information
- **Ethical Boundaries**: Clear system design to prevent unauthorized practice of law
- **Audit Trails**: Logging of critical actions with privacy considerations
- **Secure Communications**: Encrypted messaging for client-attorney interactions
- **Data Minimization**: Collect only necessary information to accomplish tasks

### Rural-Specific Considerations

- **Low Bandwidth Optimization**: Minimize payload sizes and implement progressive loading
- **Device Compatibility**: Support older devices and browsers common in rural areas
- **Location Awareness**: Account for inaccurate GPS in remote areas when relevant
- **Cultural Sensitivity**: Design with awareness of rural Tennessee cultural contexts
- **Plain Language**: Avoid legal jargon and complex technical terms
- **Print Capability**: Support printing of forms and instructions for users without continuous access
- **Clear Navigation**: Simplified interfaces with obvious paths through complex processes

## Priority Matrix

This matrix helps prioritize development based on impact and alignment with project goals:

| Feature                    | Impact | Complexity | Rural Relevance | Priority |
| -------------------------- | ------ | ---------- | --------------- | -------- |
| Offline Intake Forms       | High   | Medium     | Critical        | P0       |
| SMS Notifications          | High   | Medium     | Critical        | P0       |
| Document Checklists        | High   | Low        | High            | P1       |
| Appointment Scheduling     | High   | High       | High            | P1       |
| Legal Issue Identification | High   | Medium     | High            | P1       |
| Attorney Dashboard         | Medium | High       | Medium          | P2       |
| Follow-up Tracking         | Medium | Medium     | High            | P2       |
| Program Analytics          | Medium | High       | Low             | P3       |
| Community Partner Portal   | Medium | Medium     | High            | P3       |

**Priority Definitions:**

- **P0**: Critical for MVP launch, blockers for other functionality
- **P1**: Essential features needed for effective operation
- **P2**: Important features that significantly enhance value
- **P3**: Valuable features that can be implemented in later phases
