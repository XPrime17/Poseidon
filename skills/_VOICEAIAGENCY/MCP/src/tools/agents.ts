import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import Retell from "retell-sdk";
import { z } from "zod";
import { handler } from "../utils.js";

const GetAgentSchema = z.object({
  agent_id: z.string().describe("The Retell agent ID (e.g., agent_xxx)"),
});

export const registerAgentTools = (server: McpServer, client: Retell) => {
  // ── list_agents ──────────────────────────────────────────────
  server.tool(
    "list_agents",
    "List all Retell voice agents with their IDs, names, LLM IDs, and voice settings. " +
    "Use this to see all agents before fetching transcripts or updating prompts.",
    {},
    handler(async () => {
      // Enumerate agent_ids via POST /v2/list-agents — retell-sdk agent.list() still calls
      // the deprecated GET /list-agents (removed 2026-07-31). v2 items are a slim projection
      // (no response_engine/llm_id/language), so retrieve each to preserve this tool's output.
      const ids: string[] = [];
      let pag: string | undefined;
      do {
        const body: any = { filter_criteria: { channel: { op: "eq", type: "string", value: "voice" } }, limit: 1000 };
        if (pag) body.pagination_key = pag;
        const page: any = await (client as any).post("/v2/list-agents", { body });
        for (const a of (page?.items ?? [])) ids.push(a.agent_id);
        pag = page?.has_more ? page?.pagination_key : undefined;
      } while (pag);
      const agents = await Promise.all(ids.map((id) => client.agent.retrieve(id)));
      return agents.map((a: any) => ({
        agent_id: a.agent_id,
        agent_name: a.agent_name ?? "(unnamed)",
        voice_id: a.voice_id,
        language: a.language,
        llm_id: a.response_engine?.llm_id ?? null,
        llm_type: a.response_engine?.type ?? null,
        last_modified: a.last_modification_timestamp
          ? new Date(a.last_modification_timestamp).toISOString()
          : null,
      }));
    })
  );

  // ── get_agent ────────────────────────────────────────────────
  server.tool(
    "get_agent",
    "Get full configuration for a Retell agent including voice settings, " +
    "responsiveness, backchannel config, and the linked LLM ID. " +
    "To see the actual prompt text, use get_agent_prompt instead.",
    GetAgentSchema.shape,
    handler(async (data: z.infer<typeof GetAgentSchema>) => {
      const agent = await client.agent.retrieve(data.agent_id);
      return {
        agent_id: agent.agent_id,
        agent_name: agent.agent_name,
        version: agent.version,
        response_engine: agent.response_engine,
        voice_id: agent.voice_id,
        voice_model: (agent as any).voice_model,
        voice_temperature: (agent as any).voice_temperature,
        voice_speed: (agent as any).voice_speed,
        responsiveness: (agent as any).responsiveness,
        interruption_sensitivity: (agent as any).interruption_sensitivity,
        enable_backchannel: (agent as any).enable_backchannel,
        backchannel_frequency: (agent as any).backchannel_frequency,
        language: (agent as any).language,
        ambient_sound: (agent as any).ambient_sound,
        end_call_after_silence_ms: (agent as any).end_call_after_silence_ms,
        max_call_duration_ms: (agent as any).max_call_duration_ms,
        enable_voicemail_detection: (agent as any).enable_voicemail_detection,
        boosted_keywords: (agent as any).boosted_keywords,
        last_modification_timestamp: agent.last_modification_timestamp,
      };
    })
  );
};
