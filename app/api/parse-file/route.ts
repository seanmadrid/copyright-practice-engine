// File-to-text parsing for the Upload tab. The educator uploads a real source
// file — a case opinion as .pdf, a chapter as .docx, notes as .txt/.md — and we
// turn it into plain text here, then hand it back to the client so it can flow
// into the exact same ingestion path the Paste tab uses. Both tabs converge on
// /api/ingest; this route only does the file → text conversion.

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Mirrors the source ceiling enforced downstream by /api/ingest. Kept generous
// so a full case opinion or doctrine chapter is extracted in one pass: ~400k
// chars is roughly 100k tokens, well within the extraction model's context
// window, with headroom left for the prompt and the JSON output.
const MAX_TEXT_CHARS = 400_000;
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB — generous for an opinion or chapter.

type ParseResponse =
  | { ok: true; text: string; truncated: boolean }
  | { ok: false; error: string };

function ext(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot + 1).toLowerCase();
}

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json<ParseResponse>(
      { ok: false, error: "Upload a file using the file picker." },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json<ParseResponse>(
      { ok: false, error: "No file received. Choose a .txt, .md, .pdf, or .docx file." },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json<ParseResponse>(
      { ok: false, error: "That file is over 10 MB. Upload a smaller source." },
      { status: 400 },
    );
  }

  const kind = ext(file.name);
  const buffer = Buffer.from(await file.arrayBuffer());

  let text: string;
  try {
    if (kind === "txt" || kind === "md") {
      text = buffer.toString("utf8");
    } else if (kind === "pdf") {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      try {
        const parsed = await parser.getText();
        text = parsed.text;
      } finally {
        await parser.destroy();
      }
    } else if (kind === "docx") {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      return NextResponse.json<ParseResponse>(
        {
          ok: false,
          error: "Unsupported file type. Upload a .txt, .md, .pdf, or .docx file.",
        },
        { status: 400 },
      );
    }
  } catch {
    return NextResponse.json<ParseResponse>(
      {
        ok: false,
        error: `Could not read that ${kind.toUpperCase()} file. Try another file, or paste the text instead.`,
      },
      { status: 200 },
    );
  }

  // Collapse the runs of whitespace that PDF and DOCX extraction leave behind,
  // while keeping paragraph breaks so the ingestion prompt still sees structure.
  const cleaned = text
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

  if (cleaned.length < 120) {
    return NextResponse.json<ParseResponse>(
      {
        ok: false,
        error:
          "That file held almost no extractable text (a scanned PDF, perhaps). Upload a text-based source or paste it instead.",
      },
      { status: 200 },
    );
  }

  const truncated = cleaned.length > MAX_TEXT_CHARS;
  return NextResponse.json<ParseResponse>(
    {
      ok: true,
      text: cleaned.slice(0, MAX_TEXT_CHARS),
      truncated,
    },
    { status: 200 },
  );
}
