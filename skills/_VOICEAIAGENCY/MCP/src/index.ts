#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import Retell from "retell-sdk";
import { registerAgentTools } from "./tools/agents.js";
import { registerCallTools } from "./tools/calls.js";
import { registerLlmTools } from "./tools/llm.js";
import { registerAnalysisTools } from "./tools/analysis.js";
import { registerKnowledgeBaseTools } from "./tools/knowledge-base.js";

function createMcpServer() {
  const apiKey = process.env.RETELL_API_KEY;
  if (!apiKey) {
    throw new Error(
      "RETELL_API_KEY environment variable is required. " +
      "Set it in your MCP config or export it in your shell."
    );
  }

  const retellClient = new Retell({ apiKey });

  const mcpServer = new McpServer({
    name: "Retell Voice AI",
    version: "1.0.0",
  });

  registerAgentTools(mcpServer, retellClient);
  registerCallTools(mcpServer, retellClient);
  registerLlmTools(mcpServer, retellClient);
  registerAnalysisTools(mcpServer, retellClient);
  registerKnowledgeBaseTools(mcpServer, retellClient);

  return mcpServer;
}

async function main() {
  try {
    const mcpServer = createMcpServer();
    const transport = new StdioServerTransport();
    await mcpServer.connect(transport);

    process.on("SIGINT", async () => {
      try {
        await mcpServer.close();
        process.exit(0);
      } catch {
        process.exit(1);
      }
    });
  } catch (err) {
    console.error("Error starting Retell Voice AI MCP server:", err);
    process.exit(1);
  }
}

main();
