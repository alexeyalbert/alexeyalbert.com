import type { PageServerLoad } from "./$types";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

function extractFirstImageSrc(markdown: string): string | null {
  const imageRegex = /!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/;
  const match = markdown.match(imageRegex);
  return match ? match[1] : null;
}

function extractDescription(markdown: string): string {
  const lines = markdown.split(/\r?\n/);
  const cleaned: string[] = [];
  let inCode = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (/^```/.test(line)) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;
    if (!line || /^#/.test(line) || /^</.test(line) || /^!\[/.test(line)) continue;
    if (/^[-*]\s+/.test(line)) continue;
    const stripped = line
      .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[`*_>#-]/g, "")
      .trim();
    if (stripped) {
      cleaned.push(stripped);
      if (cleaned.join(" ").length >= 160) break;
    }
  }
  const desc = cleaned.join(" ");
  return desc.length > 200 ? desc.slice(0, 197) + "…" : desc || "";
}

export const load: PageServerLoad = async ({ params, url }) => {
  const { slug } = params;
  // Resolve markdown path, prefer work subdirectory
  const workPath = path.resolve("src/lib/assets/markdown/work", `${slug}.md`);
  const rootPath = path.resolve("src/lib/assets/markdown", `${slug}.md`);
  const mdPath = fs.existsSync(workPath) ? workPath : rootPath;
  if (!fs.existsSync(mdPath)) {
    return {
      status: 404,
    } as any;
  }

  const raw = fs.readFileSync(mdPath, "utf-8");
  const { content, data: frontmatter } = matter(raw);

  const title = String((frontmatter as any)?.title ?? slug.replace(/[-_]+/g, " "));
  const description = String((frontmatter as any)?.description ?? extractDescription(content));
  const firstImage = (frontmatter as any)?.image || extractFirstImageSrc(content);
  const imagePath = typeof firstImage === "string" && firstImage
    ? firstImage
    : "/web-app-manifest-512x512.png";
  const absoluteImage = imagePath.startsWith("http")
    ? imagePath
    : `${url.origin}${imagePath}`;

  return {
    slug,
    source: content,
    meta: frontmatter as Record<string, unknown>,
    head: {
      title,
      description,
      image: absoluteImage,
      type: "article",
    },
  };
};
