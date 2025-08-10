# GPT-5 MCP Server

A Model Context Protocol (MCP) server that provides GPT-5 Q&A functionality.

## Features

- **gpt5_chat**: Chat with GPT-5 for Q&A and general assistance
  - Configurable model selection
  - Adjustable response parameters (max_tokens, temperature)
  - Error handling and validation

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and configure your OpenAI API key:
   ```bash
   cp .env.example .env
   ```
4. Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Claude Desktop Integration

Add this server to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "gpt5": {
      "command": "node",
      "args": ["path/to/gpt5-mcp/dist/index.js"],
      "env": {
        "OPENAI_API_KEY": "your_openai_api_key_here"
      }
    }
  }
}
```

## Tool Reference

### gpt5_chat

Chat with GPT-5 for Q&A and assistance.

**Parameters:**
- `message` (required): The message or question to send to GPT-5
- `model` (optional): The GPT model to use (default: "gpt-4o")
- `max_tokens` (optional): Maximum tokens in response (default: 1000)
- `temperature` (optional): Sampling temperature 0-2 (default: 0.7)

**Example:**
```json
{
  "message": "What is the capital of France?",
  "model": "gpt-4o",
  "max_tokens": 500,
  "temperature": 0.5
}
```