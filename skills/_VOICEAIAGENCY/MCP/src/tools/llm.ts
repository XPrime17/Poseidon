import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import Retell from "retell-sdk";
import { z } from "zod";
import { handler } from "../utils.js";

const GetAgentPromptSchema = z.object({
  agent_id: z.string().describe("The Retell agent ID. The tool resolves the linked LLM automatically."),
});

const UpdateAgentPromptSchema = z.object({
  agent_id: z.string().describe("The Retell agent ID whose prompt to update."),
  general_prompt: z.string().describe("The new prompt text to set as the agent's general_prompt."),
  begin_message: z.string().optional().describe("Optional: update the agent's opening message too."),
});

const GetRetellLLMSchema = z.object({
  llm_id: z.string().describe("The Retell LLM ID (e.g., llm_xxx)"),
});

export const registerLlmTools = (server: McpServer, client: Retell) => {
  // ── get_agent_prompt ─────────────────────────────────────────
  server.tool(
    "get_agent_prompt",
    "Get the current prompt (general_prompt) for a Retell agent. " +
    "Automatically resolves the agent's LLM ID and fetches the prompt text. " +
    "Also returns the LLM model, begin message, tools, and knowledge base IDs.",
    GetAgentPromptSchema.shape,
    handler(async (data: z.infer<typeof GetAgentPromptSchema>) => {
      const agent = await client.agent.retrieve(data.agent_id);
      const engine = agent.response_engine as any;
      if (!engine?.llm_id) {
        throw new Error(
          `Agent ${data.agent_id} does not have a Retell LLM response engine. ` +
          `Engine type: ${engine?.type ?? "unknown"}`
        );
      }

      const llm = await client.llm.retrieve(engine.llm_id);
      return {
        agent_id: data.agent_id,
        agent_name: agent.agent_name,
        llm_id: engine.llm_id,
        model: (llm as any).model,
        general_prompt: (llm as any).general_prompt ?? null,
        begin_message: (llm as any).begin_message ?? null,
        general_tools: (llm as any).general_tools ?? [],
        knowledge_base_ids: (llm as any).knowledge_base_ids ?? [],
        default_dynamic_variables: (llm as any).default_dynamic_variables ?? {},
        last_modified: llm.last_modification_timestamp
          ? new Date(llm.last_modification_timestamp).toISOString()
          : null,
      };
    })
  );

  // ── update_agent_prompt ──────────────────────────────────────
  server.tool(
    "update_agent_prompt",
    "Update the prompt (general_prompt) for a Retell agent. " +
    "Automatically resolves the agent's LLM ID and updates the prompt text. " +
    "IMPORTANT: This modifies the live agent prompt. The change takes effect immediately " +
    "on the next call. Returns the updated prompt for confirmation.",
    UpdateAgentPromptSchema.shape,
    handler(async (data: z.infer<typeof UpdateAgentPromptSchema>) => {
      const agent = await client.agent.retrieve(data.agent_id);
      const engine = agent.response_engine as any;
      if (!engine?.llm_id) {
        throw new Error(
          `Agent ${data.agent_id} does not have a Retell LLM response engine.`
        );
      }

      const updatePayload: Record<string, unknown> = {
        general_prompt: data.general_prompt,
      };
      if (data.begin_message !== undefined) {
        updatePayload.begin_message = data.begin_message;
      }

      const updated = await client.llm.update(engine.llm_id, updatePayload as any);
      return {
        success: true,
        agent_id: data.agent_id,
        agent_name: agent.agent_name,
        llm_id: engine.llm_id,
        updated_prompt_preview: (updated as any).general_prompt
          ? (updated as any).general_prompt.substring(0, 500) + "..."
          : null,
        updated_begin_message: (updated as any).begin_message ?? null,
        prompt_length: (updated as any).general_prompt?.length ?? 0,
        last_modified: updated.last_modification_timestamp
          ? new Date(updated.last_modification_timestamp).toISOString()
          : null,
      };
    })
  );

  // ── get_retell_llm ───────────────────────────────────────────
  server.tool(
    "get_retell_llm",
    "Get the full Retell LLM configuration by LLM ID. " +
    "Returns the model, prompt, tools, states, knowledge bases, and all settings. " +
    "Use get_agent_prompt if you have an agent ID instead.",
    GetRetellLLMSchema.shape,
    handler(async (data: z.infer<typeof GetRetellLLMSchema>) => {
      const llm = await client.llm.retrieve(data.llm_id);
      return llm;
    })
  );
};
