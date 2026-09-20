import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isFormatKey } from "@/lib/drafting/formats";
import { buildSystemPrompt, gatherContext } from "@/lib/drafting/prompt";

export const runtime = "nodejs";
export const maxDuration = 300;

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-5";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY is not set in .env.local" }, { status: 500 });
  }

  const body = (await request.json()) as { brief?: string; format?: string; project_id?: string | null };
  const brief = body.brief?.trim();
  const projectId = body.project_id || null;
  if (!brief) return NextResponse.json({ error: "Brief is required" }, { status: 400 });
  if (!isFormatKey(body.format)) return NextResponse.json({ error: "Unknown format" }, { status: 400 });
  const format = body.format;

  let system: string;
  try {
    system = buildSystemPrompt(format, await gatherContext(supabase, brief, projectId));
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Context retrieval failed" }, { status: 500 });
  }

  const client = new Anthropic();
  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: { effort: "medium" },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system,
    messages: [{ role: "user", content: brief }],
  });

  const encoder = new TextEncoder();
  let draft = "";

  const readable = new ReadableStream({
    async start(controller) {
      try {
        stream.on("text", (delta) => {
          draft += delta;
          controller.enqueue(encoder.encode(delta));
        });
        const final = await stream.finalMessage();

        if (final.stop_reason === "refusal") {
          controller.enqueue(encoder.encode("\n\n[The model declined to write this draft.]"));
        } else if (draft.trim()) {
          await supabase.from("drafts").insert({ project_id: projectId, format, brief, content: draft });
        }
        controller.close();
      } catch (e) {
        const message =
          e instanceof Anthropic.APIError ? `Claude API error ${e.status}: ${e.message}` : "Drafting failed";
        controller.enqueue(encoder.encode(`\n\n[${message}]`));
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(readable, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}
