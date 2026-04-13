import fs from "node:fs";

import { formatDate, githubRequest } from "./lib/github.mjs";
import { updateReadme } from "./lib/readme.mjs";

const username = process.env.GITHUB_USERNAME || "aryanmiriyala";
const token = process.env.GITHUB_TOKEN;
const outputPath = new URL("../generated/recent-activity.md", import.meta.url);

const events = await githubRequest(`/users/${username}/events/public?per_page=100`, token);

const lines = [];
const touchedRepos = new Set();

for (const event of events) {
  const repoName = event.repo?.name;
  if (!repoName) continue;

  if (event.type === "PullRequestEvent") {
    const action = event.payload?.action;
    const pr = event.payload?.pull_request;
    if (!pr?.html_url || !pr?.title) continue;
    touchedRepos.add(repoName);

    if (action === "closed" && pr.merged_at) {
      lines.push(`- Merged [PR](${pr.html_url}) in \`${repoName}\`: ${pr.title} (${formatDate(pr.merged_at)})`);
    } else if (action === "opened") {
      lines.push(`- Opened [PR](${pr.html_url}) in \`${repoName}\`: ${pr.title} (${formatDate(pr.created_at)})`);
    }
  }

  if (event.type === "PushEvent") {
    const commits = event.payload?.commits?.length ?? 0;
    const ref = event.payload?.ref?.replace("refs/heads/", "") || "branch";
    touchedRepos.add(repoName);
    lines.push(`- Pushed ${commits} commit${commits === 1 ? "" : "s"} to \`${repoName}\` on \`${ref}\` (${formatDate(event.created_at)})`);
  }

  if (lines.length >= 6) break;
}

const summary = [
  `- Public activity across ${touchedRepos.size} repos in recent events`,
  ...(lines.length > 0
    ? lines
    : ["- No recent public PR or push events were found in the latest GitHub event window"])
];

const markdown = summary.join("\n");
fs.mkdirSync(new URL("../generated/", import.meta.url), { recursive: true });
fs.writeFileSync(outputPath, `${markdown}\n`);
updateReadme("recent-activity", markdown);
