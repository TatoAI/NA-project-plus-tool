const MAX_CHARS = 1200;
const OVERLAP = 200;

// Paragraph-aware chunking: pack paragraphs up to MAX_CHARS, hard-split oversized
// ones, and carry a short overlap so context isn't lost at chunk boundaries.
export function chunkText(raw: string): string[] {
  const paragraphs = raw
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = "";

  const flush = () => {
    if (current.trim()) chunks.push(current.trim());
    current = current.slice(-OVERLAP);
  };

  for (const para of paragraphs) {
    if (para.length > MAX_CHARS) {
      flush();
      for (let i = 0; i < para.length; i += MAX_CHARS - OVERLAP) {
        chunks.push(para.slice(i, i + MAX_CHARS));
      }
      current = "";
      continue;
    }
    if (current.length + para.length + 1 > MAX_CHARS) flush();
    current += (current ? "\n" : "") + para;
  }
  if (current.trim() && current.trim() !== chunks[chunks.length - 1]) chunks.push(current.trim());
  return chunks;
}
