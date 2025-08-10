#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import OpenAI from "openai";

// Validate environment variables
function validateEnvironment() {
  if (!process.env.OPENAI_API_KEY) {
    console.error("Error: OPENAI_API_KEY environment variable is required");
    process.exit(1);
  }
}

validateEnvironment();

const server = new Server(
  {
    name: "gpt5-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  baseURL: process.env.OPENAI_BASE_URL,
  organization: process.env.OPENAI_ORGANIZATION,
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "gpt5_chat",
        description: "Chat with GPT-5 for Q&A and general assistance",
        inputSchema: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "The message or question to send to GPT-5",
            },
            model: {
              type: "string",
              description: "The GPT model to use (default: gpt-5)",
              default: "gpt-5",
            },
            max_tokens: {
              type: "number",
              description: "Maximum tokens in response (default: 4096)",
              default: 4096,
            },
            temperature: {
              type: "number",
              description: "Sampling temperature (0-2, default: 0.7)",
              minimum: 0,
              maximum: 2,
              default: 0.7,
            },
          },
          required: ["message"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name !== "gpt5_chat") {
    throw new McpError(
      ErrorCode.MethodNotFound,
      `Tool ${name} not found`
    );
  }

  const { message, model = "gpt-5", max_tokens = 4096, temperature = 0.7 } = args as {
    message: string;
    model?: string;
    max_tokens?: number;
    temperature?: number;
  };

  // Input validation
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    throw new McpError(
      ErrorCode.InvalidParams,
      "Message parameter is required and must be a non-empty string"
    );
  }

  if (typeof model !== 'string') {
    throw new McpError(
      ErrorCode.InvalidParams,
      "Model parameter must be a string"
    );
  }

  if (typeof max_tokens !== 'number' || max_tokens < 1 || max_tokens > 128000) {
    throw new McpError(
      ErrorCode.InvalidParams,
      "max_tokens must be a number between 1 and 128000"
    );
  }

  if (typeof temperature !== 'number' || temperature < 0 || temperature > 2) {
    throw new McpError(
      ErrorCode.InvalidParams,
      "Temperature must be a number between 0 and 2"
    );
  }

  try {
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "user",
          content: message.trim(),
        },
      ],
      max_tokens: max_tokens,
      temperature: temperature,
    });

    const response = completion.choices[0]?.message?.content || "No response generated";

    return {
      content: [
        {
          type: "text",
          text: response,
        },
      ],
    };
  } catch (error: any) {
    // Handle different types of OpenAI errors
    if (error.status === 401) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable."
      );
    } else if (error.status === 429) {
      throw new McpError(
        ErrorCode.InternalError,
        "OpenAI API rate limit exceeded. Please try again later."
      );
    } else if (error.status === 400) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Invalid request to OpenAI API: ${error.message}`
      );
    } else {
      throw new McpError(
        ErrorCode.InternalError,
        `OpenAI API error: ${error.message || 'Unknown error occurred'}`
      );
    }
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error("GPT-5 MCP Server started");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
