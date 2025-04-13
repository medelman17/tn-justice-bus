# Knock Verification Workflow Guide

This document outlines the necessary steps to set up the verification code workflow in Knock, which is critical for both SMS and email verification during authentication.

## Current Implementation

The system currently uses a fallback mechanism in `src/lib/knock.ts` to handle missing workflow definitions. When the system tries to send a verification code but the `verification-code` workflow doesn't exist in Knock, it will:

1. Log the verification code and recipient information
2. Return a success response to prevent application errors
3. Allow the authentication flow to continue

While this fallback prevents application errors, **actual SMS and email messages are not being sent** until the proper workflow is created in Knock.

## Workflow Setup Instructions

### Option 1: Using the Knock Dashboard (Recommended)

1. Log in to the [Knock Dashboard](https://dashboard.knock.app/)
2. Navigate to Workflows → Create Workflow
3. Set the workflow key to `verification-code`
4. Add a workflow name (e.g., "Verification Code") and description
5. Create two channel steps:
   - SMS Channel:
     - Add a condition: `channel` is not equal to `email`
     - Template: `Your verification code is {{code}}. This code will expire in {{expiresInMinutes}} minutes.`
   - Email Channel:
     - Add a condition: `channel` is equal to `email`
     - Subject: `Your Verification Code`
     - Body: `Your Tennessee Justice Bus verification code is: {{code}}. This code will expire in {{expiresInMinutes}} minutes.`
6. Save and commit the workflow

### Option 2: Using the Knock API

Here's a sample curl command to create the workflow via API:

```bash
curl -X POST \
  https://api.knock.app/v1/workflows?environment=development \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer KNOCK_API_KEY' \
  -d '{
    "key": "verification-code",
    "name": "Verification Code",
    "summary": "Sends verification codes for authentication",
    "steps": [
      {
        "id": "sms-channel",
        "type": "channel",
        "config": {
          "channel": "sms",
          "template": "Your verification code is {{code}}. This code will expire in {{expiresInMinutes}} minutes."
        },
        "conditions": [
          {
            "variable": "channel",
            "operator": "not_equals",
            "value": "email"
          }
        ]
      },
      {
        "id": "email-channel",
        "type": "channel",
        "conditions": [
          {
            "variable": "channel",
            "operator": "equals",
            "value": "email"
          }
        ],
        "config": {
          "channel": "email",
          "template": {
            "subject": "Your Verification Code",
            "body": "Your Tennessee Justice Bus verification code is: {{code}}. This code will expire in {{expiresInMinutes}} minutes."
          }
        }
      }
    ]
  }'
```

Replace `KNOCK_API_KEY` with your actual Knock API key from `.env.local` (`KNOCK_API_KEY`).

### Option 3: Using the Knock CLI

If you prefer to use the Knock CLI:

1. Set up the workflow in a local directory:

```
knock-workflows/
└── verification-code/
    └── workflow.json
```

2. With `workflow.json` containing:

```json
{
  "key": "verification-code",
  "name": "Verification Code",
  "summary": "Sends verification codes for authentication",
  "steps": [
    {
      "id": "sms-channel",
      "type": "channel",
      "config": {
        "channel": "sms",
        "template": "Your verification code is {{code}}. This code will expire in {{expiresInMinutes}} minutes."
      },
      "conditions": [
        {
          "variable": "channel",
          "operator": "not_equals",
          "value": "email"
        }
      ]
    },
    {
      "id": "email-channel",
      "type": "channel",
      "conditions": [
        {
          "variable": "channel",
          "operator": "equals",
          "value": "email"
        }
      ],
      "config": {
        "channel": "email",
        "template": {
          "subject": "Your Verification Code",
          "body": "Your Tennessee Justice Bus verification code is: {{code}}. This code will expire in {{expiresInMinutes}} minutes."
        }
      }
    }
  ]
}
```

3. Push the workflow to Knock:

```bash
npx knock workflow push --service-token SERVICE_TOKEN knock-workflows/verification-code
```

Replace `SERVICE_TOKEN` with your Knock service token from `.env.local` or the Knock dashboard.

## Workflow Data Format

When triggering the verification code workflow, the application passes the following data:

```typescript
{
  recipients: [{ id: "user-id-or-email", email: "user@example.com" }],
  data: {
    code: "123456",           // The verification code (required)
    expiresInMinutes: 10,     // Expiration time in minutes (default: 10)
    channel: "email" | "sms"  // Delivery channel (defaults to "sms")
  }
}
```

## Testing the Workflow

After setting up the workflow, you can test it using the authentication flow:

1. Visit the sign-in page and use the phone or email authentication option
2. Enter your phone number or email address and request a verification code
3. Check your phone or email for the verification code
4. The code should be delivered via the selected channel

## Troubleshooting

If verification codes still aren't being delivered:

1. Check the server logs for any error messages
2. Verify the workflow exists in Knock with the exact key `verification-code`
3. Ensure your Knock API key has proper permissions
4. Check that the SMS and email channels are properly configured in Knock
5. Verify that the recipient has a valid phone number or email address

## Removing the Fallback Mechanism

Once the workflow is properly set up and tested, the fallback mechanism in `src/lib/knock.ts` can be safely removed if desired. Look for the `handleVerificationFallback` function and the associated try/catch block in `triggerWorkflowWithOfflineSupport`.
