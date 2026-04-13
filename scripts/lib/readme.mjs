import fs from "node:fs";

export function replaceSection(readme, marker, replacement) {
  const start = `<!-- ${marker}:start -->`;
  const end = `<!-- ${marker}:end -->`;
  const pattern = new RegExp(`${escapeRegExp(start)}[\\s\\S]*?${escapeRegExp(end)}`);
  const next = `${start}\n${replacement}\n${end}`;

  if (!pattern.test(readme)) {
    throw new Error(`Missing README marker section: ${marker}`);
  }

  return readme.replace(pattern, next);
}

export function updateReadme(marker, replacement) {
  const path = new URL("../../README.md", import.meta.url);
  const readme = fs.readFileSync(path, "utf8");
  const next = replaceSection(readme, marker, replacement.trimEnd());
  fs.writeFileSync(path, next);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
