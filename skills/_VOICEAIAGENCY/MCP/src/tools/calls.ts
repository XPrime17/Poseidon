import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import Retell from "retell-sdk";
import { z } from "zod";
import { handler } from "../utils.js";

const ListCallsSchema = z.object({
  agent_id: z.string().describe("Filter calls to this agent ID. Required."),
  limit: z.number().optional().describe("Max calls to return (default 20, max 1000)"),
  sort_order: z.string().optional().describe("Sort: 'descending' (newest first, default) or 'ascending'"),
});

const GetTranscriptSchema = z.object({
  call_id: z.string().describe("The call ID to fetch transcript for (e.g., call_xxx)"),
});

export const registerCallTools = (server: McpServer, client: Retell) => {
  // ── list_calls ───────────────────────────────────────────────
  server.tool(
    "list_calls",
    "List recent calls for a Retell agent. Returns call IDs, status, duration, " +
    "timestamps, disconnection reason, and call analysis summary. " +
    "Use agent_id to filter by agent. Results ordered by most recent first.",
    ListCallsSchema.shape,
    handler(async (data: z.infer<typeof ListCallsSchema>) => {
      const calls = await client.call.list({
        filter_criteria: {
          agent_id: [data.agent_id],
        },
        limit: data.limit ?? 20,
        sort_order: (data.sort_order as any) ?? "descending",
      });
      return calls.map((c: any) => ({
        call_id: c.call_id,
        call_type: c.call_type,
        agent_id: c.agent_id,
        call_status: c.call_status,
        direction: c.direction,
        from_number: c.from_number,
        to_number: c.to_number,
        duration_ms: c.end_timestamp && c.start_timestamp
          ? c.end_timestamp - c.start_timestamp
          : null,
        start_time: c.start_timestamp
          ? new Date(c.start_timestamp).toISOString()
          : null,
        end_time: c.end_timestamp
          ? new Date(c.end_timestamp).toISOString()
          : null,
        disconnection_reason: c.disconnection_reason,
        call_analysis: c.call_analysis ?? null,
        has_transcript: !!c.transcript,
        transcript_preview: c.transcript
          ? c.transcript.substring(0, 200) + (c.transcript.length > 200 ? "..." : "")
          : null,
      }));
    })
  );

  // ── get_transcript ───────────────────────────────────────────
  server.tool(
    "get_transcript",
    "Get the full transcript for a specific call, including timestamped utterances, " +
    "tool calls, call analysis, recording URL, and cost breakdown. " +
    "Use list_calls first to get call IDs.",
    GetTranscriptSchema.shape,
    handler(async (data: z.infer<typeof GetTranscriptSchema>) => {
      const call = await client.call.retrieve(data.call_id);
      return {
        call_id: call.call_id,
        agent_id: call.agent_id,
        call_status: call.call_status,
        direction: (call as any).direction,
        from_number: (call as any).from_number,
        to_number: (call as any).to_number,
        duration_ms: call.end_timestamp && call.start_timestamp
          ? call.end_timestamp - call.start_timestamp
          : null,
        start_time: call.start_timestamp
          ? new Date(call.start_timestamp).toISOString()
          : null,
        transcript: call.transcript ?? null,
        transcript_object: call.transcript_object ?? null,
        transcript_with_tool_calls: (call as any).transcript_with_tool_calls ?? null,
        call_analysis: call.call_analysis ?? null,
        recording_url: call.recording_url ?? null,
        public_log_url: (call as any).public_log_url ?? null,
        disconnection_reason: call.disconnection_reason ?? null,
        call_cost: (call as any).call_cost ?? null,
      };
    })
  );
};
