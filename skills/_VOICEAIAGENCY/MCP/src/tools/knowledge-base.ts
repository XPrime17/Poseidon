import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import Retell from "retell-sdk";
import { z } from "zod";
import { handler } from "../utils.js";

const GetKBSchema = z.object({
  knowledge_base_id: z.string().describe("The Retell knowledge base ID (e.g., kb_xxx)"),
});

const CreateKBSchema = z.object({
  knowledge_base_name: z.string().describe("Name for the KB (max 40 chars)"),
  knowledge_base_texts: z
    .array(
      z.object({
        title: z.string().describe("Title of the text source"),
        text: z.string().describe("Text content to add"),
      })
    )
    .optional()
    .describe("Text sources to include at creation"),
  knowledge_base_urls: z
    .array(z.string())
    .optional()
    .describe("URLs to scrape and add"),
});

const AddTextSourceSchema = z.object({
  knowledge_base_id: z.string().describe("The KB ID to add sources to"),
  knowledge_base_texts: z
    .array(
      z.object({
        title: z.string().describe("Title of the text source"),
        text: z.string().describe("Text content to add"),
      })
    )
    .describe("Text sources to add"),
});

const DeleteSourceSchema = z.object({
  knowledge_base_id: z.string().describe("The KB ID containing the source"),
  source_id: z.string().describe("The source ID to delete"),
});

const SyncDocToKBSchema = z.object({
  knowledge_base_id: z.string().describe("The KB ID to sync content into"),
  title: z.string().describe("Title for the new text source"),
  text: z.string().describe("Full text content to replace existing text sources with"),
});

export const registerKnowledgeBaseTools = (server: McpServer, client: Retell) => {
  // ── list_knowledge_bases ─────────────────────────────────────
  server.tool(
    "list_knowledge_bases",
    "List all Retell knowledge bases with their IDs, names, status, and source counts. " +
    "Use this to discover existing KBs and their current state.",
    {},
    handler(async () => {
      const kbs = await client.knowledgeBase.list();
      return kbs.map((kb: any) => ({
        knowledge_base_id: kb.knowledge_base_id,
        knowledge_base_name: kb.knowledge_base_name,
        status: kb.status,
        source_count: kb.knowledge_base_sources?.length ?? 0,
        enable_auto_refresh: kb.enable_auto_refresh ?? false,
      }));
    })
  );

  // ── get_knowledge_base ───────────────────────────────────────
  server.tool(
    "get_knowledge_base",
    "Get full details for a knowledge base including all sources (text, URL, document) " +
    "with their IDs, titles, and types. Use this to inspect KB contents before syncing.",
    GetKBSchema.shape,
    handler(async (data: z.infer<typeof GetKBSchema>) => {
      const kb = await client.knowledgeBase.retrieve(data.knowledge_base_id);
      return {
        knowledge_base_id: kb.knowledge_base_id,
        knowledge_base_name: kb.knowledge_base_name,
        status: kb.status,
        enable_auto_refresh: kb.enable_auto_refresh ?? false,
        sources: (kb.knowledge_base_sources ?? []).map((s: any) => ({
          source_id: s.source_id,
          type: s.type,
          title: s.title ?? null,
          url: s.url ?? null,
          filename: s.filename ?? null,
        })),
      };
    })
  );

  // ── create_knowledge_base ────────────────────────────────────
  server.tool(
    "create_knowledge_base",
    "Create a new Retell knowledge base with optional text or URL sources. " +
    "Returns the new KB with its ID. Status will be 'in_progress' until processing completes.",
    CreateKBSchema.shape,
    handler(async (data: z.infer<typeof CreateKBSchema>) => {
      const kb = await client.knowledgeBase.create({
        knowledge_base_name: data.knowledge_base_name,
        knowledge_base_texts: data.knowledge_base_texts,
        knowledge_base_urls: data.knowledge_base_urls,
      });
      return {
        knowledge_base_id: kb.knowledge_base_id,
        knowledge_base_name: kb.knowledge_base_name,
        status: kb.status,
        source_count: kb.knowledge_base_sources?.length ?? 0,
      };
    })
  );

  // ── add_kb_text_source ───────────────────────────────────────
  server.tool(
    "add_kb_text_source",
    "Add one or more text sources to an existing knowledge base. " +
    "Each source needs a title and text content. KB will re-process after adding.",
    AddTextSourceSchema.shape,
    handler(async (data: z.infer<typeof AddTextSourceSchema>) => {
      const kb = await client.knowledgeBase.addSources(
        data.knowledge_base_id,
        { knowledge_base_texts: data.knowledge_base_texts }
      );
      return {
        knowledge_base_id: kb.knowledge_base_id,
        status: kb.status,
        source_count: kb.knowledge_base_sources?.length ?? 0,
      };
    })
  );

  // ── delete_kb_source ─────────────────────────────────────────
  server.tool(
    "delete_kb_source",
    "Delete a specific source from a knowledge base by source ID. " +
    "Use get_knowledge_base first to find the source_id to delete.",
    DeleteSourceSchema.shape,
    handler(async (data: z.infer<typeof DeleteSourceSchema>) => {
      const kb = await client.knowledgeBase.deleteSource(
        data.knowledge_base_id,
        data.source_id
      );
      return {
        knowledge_base_id: kb.knowledge_base_id,
        status: kb.status,
        remaining_sources: kb.knowledge_base_sources?.length ?? 0,
      };
    })
  );

  // ── sync_doc_to_kb ───────────────────────────────────────────
  server.tool(
    "sync_doc_to_kb",
    "Replace all text sources in a knowledge base with new content. " +
    "Deletes every existing text source, then adds the new text as a single source. " +
    "URL and document sources are preserved. Use this for full content syncs from Google Docs.",
    SyncDocToKBSchema.shape,
    handler(async (data: z.infer<typeof SyncDocToKBSchema>) => {
      // Step 1: Get current KB to find text sources
      const current = await client.knowledgeBase.retrieve(data.knowledge_base_id);
      const textSources = (current.knowledge_base_sources ?? []).filter(
        (s: any) => s.type === "text"
      );

      // Step 2: Delete all existing text sources
      for (const source of textSources) {
        await client.knowledgeBase.deleteSource(
          data.knowledge_base_id,
          source.source_id
        );
      }

      // Step 3: Add new text source
      const updated = await client.knowledgeBase.addSources(
        data.knowledge_base_id,
        {
          knowledge_base_texts: [
            { title: data.title, text: data.text },
          ],
        }
      );

      return {
        knowledge_base_id: updated.knowledge_base_id,
        status: updated.status,
        deleted_text_sources: textSources.length,
        new_source_count: updated.knowledge_base_sources?.length ?? 0,
        message: `Replaced ${textSources.length} text source(s) with new content "${data.title}"`,
      };
    })
  );
};
