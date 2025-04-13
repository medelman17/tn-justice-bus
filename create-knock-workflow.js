// Script to create a Knock workflow using the API
const fs = require("fs");
const path = require("path");
const https = require("https");

// Load environment variables from .env.local
require("dotenv").config({ path: ".env.local" });

// Configuration
const KNOCK_API_KEY =
  process.env.KNOCK_API_KEY ||
  "sk_test_yejqLvdf64isvRP-p4m5cnU2Kfny8qPzYb4M_qQ2jo0";
const SERVICE_TOKEN =
  process.env.KNOCK_SERVICE_TOKEN ||
  "knock_st_EvYHFPaLGDvIkbsVkmGuP9u6awdLUW_t0faUhjloBpyxm6b3np5mjJ6GHXE1DUyM";
const ENVIRONMENT = "development";

// Display available tokens
console.log("Available authentication tokens:");
console.log(`API Key: ${KNOCK_API_KEY.substring(0, 10)}...`);
console.log(`Service Token: ${SERVICE_TOKEN.substring(0, 10)}...`);

// Workflow definition
const workflowDefinition = {
  key: "verification-code",
  name: "Verification Code",
  summary: "Sends verification codes for authentication",
  steps: [
    {
      id: "sms-channel",
      type: "channel",
      config: {
        channel: "sms",
        template:
          "Your verification code is {{code}}. This code will expire in {{expiresInMinutes}} minutes.",
      },
      conditions: [
        {
          variable: "channel",
          operator: "not_equals",
          value: "email",
        },
      ],
    },
    {
      id: "email-channel",
      type: "channel",
      conditions: [
        {
          variable: "channel",
          operator: "equals",
          value: "email",
        },
      ],
      config: {
        channel: "email",
        template: {
          subject: "Your Verification Code",
          body: "Your Tennessee Justice Bus verification code is: {{code}}. This code will expire in {{expiresInMinutes}} minutes.",
        },
      },
    },
  ],
};

// First check API status
function checkApiStatus() {
  console.log("Checking Knock API status...");

  const options = {
    hostname: "api.knock.app",
    path: "/v1/status",
    method: "GET",
    headers: {
      Authorization: `Bearer ${KNOCK_API_KEY}`,
    },
  };

  const req = https.request(options, (res) => {
    console.log(`Status endpoint response code: ${res.statusCode}`);

    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      try {
        const response = JSON.parse(data);
        console.log("API Status:", response);
        // If status check succeeds, proceed to workflow check
        checkWorkflowExists();
      } catch (error) {
        console.error("Error parsing status response:", error.message);
        console.log("Raw response:", data);
      }
    });
  });

  req.on("error", (error) => {
    console.error("Error checking API status:", error.message);
  });

  req.end();
}

// Create the workflow
function createWorkflow() {
  console.log(`Using API key: ${KNOCK_API_KEY.substring(0, 10)}...`);

  const options = {
    hostname: "api.knock.app",
    path: `/v1/workflows?environment=${ENVIRONMENT}`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${KNOCK_API_KEY}`,
    },
  };

  console.log(`API endpoint: https://${options.hostname}${options.path}`);
  console.log(
    "Workflow definition:",
    JSON.stringify(workflowDefinition, null, 2)
  );

  const req = https.request(options, (res) => {
    let data = "";

    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      try {
        const response = JSON.parse(data);
        console.log("Workflow created successfully:");
        console.log(JSON.stringify(response, null, 2));
      } catch (error) {
        console.error("Error parsing response:", error.message);
        console.log("Raw response:", data);
      }
    });
  });

  req.on("error", (error) => {
    console.error("Error creating workflow:", error.message);
  });

  req.write(JSON.stringify(workflowDefinition));
  req.end();

  console.log("Workflow creation request sent.");
}

// Check if the workflow exists before creating it
function checkWorkflowExists() {
  const options = {
    hostname: "api.knock.app",
    path: `/v1/workflows/verification-code?environment=${ENVIRONMENT}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${SERVICE_TOKEN}`,
    },
  };

  const req = https.request(options, (res) => {
    if (res.statusCode === 404) {
      console.log("Workflow does not exist. Creating it now...");
      createWorkflow();
    } else if (res.statusCode === 200) {
      console.log(
        "Workflow already exists. You may want to update it instead."
      );
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const response = JSON.parse(data);
          console.log("Existing workflow:");
          console.log(JSON.stringify(response, null, 2));
        } catch (error) {
          console.error("Error parsing response:", error.message);
        }
      });
    } else {
      console.log(`Unexpected status code: ${res.statusCode}`);
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        console.log("Response:", data);
      });
    }
  });

  req.on("error", (error) => {
    console.error("Error checking workflow:", error.message);
  });

  req.end();

  console.log("Checking if workflow exists...");
}

// Execute the script
checkApiStatus();
