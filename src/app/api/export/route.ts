import { Buffer } from "node:buffer";

import { z } from "zod";
import type { UIMessage } from "ai";

import { exportChatPdf } from "@/src/features/export/export-chat-pdf";
import {
  createRequestId,
  logError,
  logInfo,
  measureAsync,
} from "@/src/shared/observability";

export const runtime = "nodejs";
export const maxDuration = 30;

const requestSchema = z.object({
  title: z.string().optional(),
  messages: z.array(z.custom<UIMessage>()),
});

export async function POST(request: Request): Promise<Response> {
  const requestId = createRequestId();

  try {
    const json = await request.json();
    const parsed = requestSchema.safeParse(json);

    if (!parsed.success) {
      return Response.json(
        {
          error: "Некорректный запрос на экспорт",
        },
        { status: 400 },
      );
    }

    const pdf = await measureAsync(
      "export.pdf",
      async () =>
        exportChatPdf({
          title: parsed.data.title,
          messages: parsed.data.messages,
        }),
      requestId,
    );

    logInfo(`export.pdf.size=${pdf.byteLength}`, requestId);

    const responseBody = Buffer.from(pdf);

    return new Response(responseBody, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="ask-alex-dialog.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    logError(
      `PDF export failed: ${error instanceof Error ? error.message : "unknown"}`,
      requestId,
    );

    return Response.json(
      {
        error: "Не удалось экспортировать диалог",
      },
      { status: 500 },
    );
  }
}
