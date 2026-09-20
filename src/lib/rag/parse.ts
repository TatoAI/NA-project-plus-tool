import mammoth from "mammoth";
import { extractText, getDocumentProxy } from "unpdf";

export const SUPPORTED_EXTENSIONS = ["pdf", "docx"] as const;

export async function parseFile(filename: string, buffer: Buffer): Promise<string> {
  const ext = filename.split(".").pop()?.toLowerCase();

  if (ext === "pdf") {
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await extractText(pdf, { mergePages: true });
    return text;
  }
  if (ext === "docx") {
    const { value } = await mammoth.extractRawText({ buffer });
    return value;
  }
  throw new Error(`Unsupported file type ".${ext}". Upload a PDF or DOCX.`);
}
