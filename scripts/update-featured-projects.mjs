import fs from "node:fs";

import { formatDate, githubRequestOptional } from "./lib/github.mjs";
import { updateReadme } from "./lib/readme.mjs";

const token = process.env.GITHUB_TOKEN;
const configPath = new URL("../config/featured-projects.json", import.meta.url);
const outputPath = new URL("../generated/featured-projects.md", import.meta.url);

const { projects } = JSON.parse(fs.readFileSync(configPath, "utf8"));

const cards = await Promise.all(
  projects.map(async ({ repo, summary, name, url }) => {
    const data = await githubRequestOptional(`/repos/${repo}`, token);

    if (!data) {
      const label = name || repo.split("/").pop() || repo;
      const href = url || `https://github.com/${repo}`;
      return `- [\`${label}\`](${href}) - ${summary}`;
    }

    const stars = data.stargazers_count ?? 0;
    const language = data.language ?? "n/a";
    const updated = formatDate(data.pushed_at ?? data.updated_at);
    return `- [\`${data.name}\`](${data.html_url}) - ${summary} | ${language} | ${stars} stars | updated ${updated}`;
  })
);

const markdown = cards.join("\n");
fs.mkdirSync(new URL("../generated/", import.meta.url), { recursive: true });
fs.writeFileSync(outputPath, `${markdown}\n`);
updateReadme("featured-projects", markdown);
