#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const action = process.argv[2];
const input = JSON.parse(fs.readFileSync(0, "utf8"));
const root = (() => {
  let current = input.cwd || process.cwd();
  while (current !== path.dirname(current)) {
    if (fs.existsSync(path.join(current, ".git"))) return current;
    current = path.dirname(current);
  }
  return process.cwd();
})();
const logsDirectory = path.join(root, ".agent-logs");
const stateDirectory = path.join(logsDirectory, ".capture-state");
const project = path.basename(root);
const sessionId = input.session_id;
const shortSessionId = sessionId.slice(0, 8);
const now = new Date().toISOString();

fs.mkdirSync(stateDirectory, { recursive: true });

function escapeYaml(value) {
  return JSON.stringify(value ?? "");
}

function indent(value) {
  return String(value ?? "").split("\n").map((line) => `  ${line}`).join("\n");
}

const statePath = path.join(stateDirectory, `${sessionId}.json`);
const state = fs.existsSync(statePath)
  ? JSON.parse(fs.readFileSync(statePath, "utf8"))
  : {
      file: path.join(logsDirectory, `${now.slice(0, 10)}_${now.slice(11, 19).replaceAll(":", "-")}_${sessionId}.md`),
      exchanges: 0,
      firstPromptTime: now,
      pending: null
    };

function ensureLog() {
  if (fs.existsSync(state.file)) return;
  fs.mkdirSync(logsDirectory, { recursive: true });
  const author = process.env.GITHUB_USER || "asfandnadeem-1106";
  fs.writeFileSync(state.file, `---\nsession_id: ${sessionId}\ndate: ${now.slice(0, 10)}\nauthor: ${author}\nmodel: ${escapeYaml(input.model)}\ntool: codex-desktop\nproject: ${project}\ntotal_exchanges: 0\nfirst_prompt_time: ${state.firstPromptTime}\nlast_prompt_time: ${state.firstPromptTime}\n---\n\n# Session Log - ${now.slice(0, 10)}\n\nSession: \`${shortSessionId}\` | Project: \`${project}\` | Author: \`${author}\`\n\n---\n`);
}

if (action === "prompt") {
  ensureLog();
  state.exchanges += 1;
  state.pending = {
    number: state.exchanges,
    timestamp: now,
    prompt: input.prompt ?? "",
    model: input.model ?? "unknown"
  };
  fs.appendFileSync(state.file, `\n[LOG_ENTRY type=PROMPT num=${state.pending.number} session=${shortSessionId}]\ntimestamp: ${now}\nmodel: ${state.pending.model}\n\n${state.pending.prompt}\n\n`);
} else if (action === "response") {
  if (!state.pending) process.exit(0);
  fs.appendFileSync(state.file, `[LOG_ENTRY type=RESPONSE num=${state.pending.number} session=${shortSessionId}]\ntimestamp: ${now}\nmodel: ${input.model ?? state.pending.model}\n\n${input.last_assistant_message ?? ""}\n\n`);
  state.pending = null;
} else {
  throw new Error("Expected action: prompt or response");
}

fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
