// REAShield exposure gate: runs `reashield scan --json`, writes a job summary and
// outputs, and fails when the score is below MIN_SCORE or the scan found no code.
import { spawnSync } from "node:child_process";
import { appendFileSync } from "node:fs";

const appPath = process.env.APP_PATH || ".";
const min = Number(process.env.MIN_SCORE ?? 60);
if (!Number.isFinite(min) || min < 0 || min > 100) fail(`min-score must be a number from 0 to 100, got "${process.env.MIN_SCORE}".`);

const run = spawnSync("reashield", ["scan", appPath, "--json"], {
  encoding: "utf8",
  shell: process.platform === "win32",
  maxBuffer: 64 * 1024 * 1024,
});
if (run.error) fail(`Could not run the REAShield CLI: ${run.error.message}`);

let r;
try {
  r = JSON.parse(run.stdout);
} catch {
  process.stderr.write(run.stderr || "");
  fail(`REAShield did not return a result for "${appPath}" (exit ${run.status}). Check that the path exists and the CLI installed.`);
}

output("scanned-path", appPath);

if (r.inconclusive || r.score == null) {
  summary(`### REAShield: no score for \`${appPath}\`\n\nNo JavaScript was found to score, so this check cannot pass. Point \`path\` at your built app.\n`);
  fail(`No JavaScript found in "${appPath}", so there is nothing to score.`);
}

const pass = r.score >= min;
output("score", String(r.score));
output("grade", r.grade?.letter ?? "");

// sourceShaped ("is it still JavaScript at all") always reads 0% without bytecode, which is not shipped; leave it out.
const rows = (r.breakdown || [])
  .filter((b) => b.key !== "sourceShaped")
  .map((b) => `| ${b.label} | ${b.count} | ${Math.round((1 - b.exposed) * 100)}% |`)
  .join("\n");
const warn = (r.warnings || []).map((w) => `> ${w}`).join("\n>\n");
summary(
  `### ${pass ? "✅" : "❌"} REAShield exposure: ${r.score} / 100 (${r.grade?.letter ?? "?"}, ${r.grade?.label ?? ""})\n\n` +
    `Minimum for this check: **${min}**. Higher is better: it measures how little an AI agent can extract from \`${appPath}\`.\n\n` +
    (rows ? `| Signal | Found | Protected |\n|---|---|---|\n${rows}\n\n` : "") +
    (warn ? `${warn}\n\n` : "") +
    (pass ? "" : `Run \`reashield scan ${appPath}\` locally to see what leaks, then \`reashield harden\` (Pro) to fix it.\n`),
);

console.log(`REAShield exposure: ${r.score}/100 (${r.grade?.letter ?? "?"}), minimum ${min}`);
if (!pass) fail(`Exposure score ${r.score} is below the minimum of ${min}.`);

function output(k, v) {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${k}=${v}\n`);
}
function summary(md) {
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
}
function fail(msg) {
  console.log(`::error::${msg}`);
  process.exit(1);
}
