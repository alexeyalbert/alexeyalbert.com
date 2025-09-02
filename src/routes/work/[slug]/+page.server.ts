import type { PageServerLoad } from "./$types";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export const load: PageServerLoad = async ({ params }) => {
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

  return {
    slug,
    source: content,
    meta: frontmatter as Record<string, unknown>,
  };
};
