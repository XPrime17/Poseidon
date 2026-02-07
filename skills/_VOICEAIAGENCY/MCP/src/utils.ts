export type ToolResponse = {
  content: Array<{ type: "text"; text: string }>;
};

export function success(data: unknown): ToolResponse {
  return {
    content: [
      {
        type: "text" as const,
        text: typeof data === "string" ? data : JSON.stringify(data, null, 2),
      },
    ],
  };
}

export function error(err: unknown): ToolResponse {
  const message = err instanceof Error ? err.message : String(err);
  return {
    content: [
      {
        type: "text" as const,
        text: `Error: ${message}`,
      },
    ],
  };
}

export function handler<T>(
  fn: (data: T) => Promise<unknown>
): (data: T) => Promise<ToolResponse> {
  return async (data: T) => {
    try {
      const result = await fn(data);
      return success(result);
    } catch (err) {
      console.error("Tool error:", err);
      return error(err);
    }
  };
}
