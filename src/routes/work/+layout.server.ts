import type { LayoutServerLoad } from "./$types";
import matter from "gray-matter";

type ImageBody = { src: string; alt?: string };
type WorkCard = {
  slug: string;
  title: string;
  date: string;
  body: string | string[] | ImageBody;
};

function getSlugFromPath(filePath: string): string {
  const filename = filePath.split("/").pop() ?? "";
  return filename.replace(/\.md$/, "");
}

function deriveTitleFromPath(filePath: string): string {
  return getSlugFromPath(filePath)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function extractPreviewBody(content: string): string | string[] | ImageBody {
  // Prefer first image that is NOT explicitly excluded from thumbnail use.
  // To exclude an image, add "no-thumb" to its markdown title, e.g.:
  // ![Alt text](/path/to/img.png "no-thumb")
  const imageRegex = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g;
  let match: RegExpExecArray | null;
  while ((match = imageRegex.exec(content)) !== null) {
    const alt = match[1] || "";
    const src = match[2];
    const title = (match[3] || "").toLowerCase();
    const altLower = alt.toLowerCase();
    const isExcluded =
      title.includes("no-thumb") || altLower.includes("no-thumb");
    if (!isExcluded) {
      return { src, alt };
    }
  }

  // Try to find first bullet list block outside of code blocks
  const lines = content.split(/\r?\n/);
  const bullets: string[] = [];
  let inCodeBlock = false;
  let collecting = false;
  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (/^```/.test(line)) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;
    const m = line.match(/^\s*[-*]\s+(.+)/);
    if (m) {
      collecting = true;
      const item = m[1]
        .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/[`*_>#]/g, "")
        .trim();
      if (item) bullets.push(item);
      // collect full contiguous bullet list; line clamping is handled in UI
      continue;
    }
    if (collecting) break; // stop at end of contiguous list block
  }
  if (bullets.length) return bullets;

  // Fall back to first paragraph-like text block
  const blocks = content
    .split(/\r?\n\s*\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  const firstTextBlock = blocks.find(
    (b) =>
      !b.startsWith("#") &&
      !b.startsWith("![") &&
      !b.startsWith("<") &&
      !/^[-*]\s+/.test(b) &&
      !b.startsWith("> "),
  );
  if (firstTextBlock) {
    const stripped = firstTextBlock
      .replace(/!\[[^\]]*\]\([^)]+\)/g, "") // images
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links
      .replace(/[`*_>#-]/g, "")
      .trim();
    return stripped.length > 200 ? stripped.slice(0, 197) + "…" : stripped;
  }
  return "";
}

export const load: LayoutServerLoad = async () => {
  const files = import.meta.glob("/src/lib/assets/markdown/work/*.md", {
    as: "raw",
    eager: true,
  }) as Record<string, string>;

  const works: WorkCard[] = Object.entries(files).map(([filePath, raw]) => {
    const { content, data } = matter(raw);
    const title = String((data as any)?.title ?? deriveTitleFromPath(filePath));
    const date = String((data as any)?.date ?? "");
    const slug = getSlugFromPath(filePath);
    const body = extractPreviewBody(content);
    return { slug, title, date, body };
  });

  function getEndDateTimestamp(dateStr: string): number {
    const trimmed = (dateStr || "").trim();
    if (!trimmed) return NaN;
    const isRange =
      /\s-\s/.test(trimmed) || /–|—/.test(trimmed) || /\s+to\s+/i.test(trimmed);
    const parts = isRange ? trimmed.split(/\s-\s|–|—|\s+to\s+/i) : [trimmed];
    const endStr = (parts[parts.length - 1] || "").trim();

    if (/^(present|current|now|ongoing)$/i.test(endStr)) {
      return Date.now();
    }
    const parsedEnd = Date.parse(endStr);
    if (!Number.isNaN(parsedEnd)) return parsedEnd;
    // Fallback: try parsing the whole string
    const parsedWhole = Date.parse(trimmed);
    return Number.isNaN(parsedWhole) ? NaN : parsedWhole;
  }

  works.sort((a, b) => {
    const da = getEndDateTimestamp(a.date);
    const db = getEndDateTimestamp(b.date);
    if (Number.isNaN(da) && Number.isNaN(db)) return 0;
    if (Number.isNaN(da)) return 1;
    if (Number.isNaN(db)) return -1;
    return db - da;
  });

  return { works };
};
