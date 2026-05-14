#!/usr/bin/env node

const fs = require("fs");

const commitMessagePath = process.argv[2];

if (!commitMessagePath) {
  console.error("Missing commit message file path.");
  process.exit(1);
}

const commitMessage = fs.readFileSync(commitMessagePath, "utf8").trim();

const allowedPrefixes = ["Merge ", "Revert \"", "fixup!", "squash!"];
const commitTypes = ["feat", "fix", "refactor", "docs", "test", "chore"];
const commitScopes = [
  "snippet",
  "component",
  "style",
  "import",
  "navigation",
  "form",
  "list",
  "type",
  "readme",
  "testing"
];

if (!commitMessage) {
  console.error("Commit message cannot be empty.");
  process.exit(1);
}

if (allowedPrefixes.some((prefix) => commitMessage.startsWith(prefix))) {
  process.exit(0);
}

const commitPattern = new RegExp(
  `^(${commitTypes.join("|")})\\((${commitScopes.join("|")})\\): [a-z0-9][a-z0-9 \\-/',.]*$`
);

if (commitPattern.test(commitMessage)) {
  process.exit(0);
}

console.error("Invalid commit message.");
console.error("");
console.error("Expected format:");
console.error("  type(scope): description");
console.error("");
console.error("Allowed types:");
console.error(`  ${commitTypes.join(", ")}`);
console.error("");
console.error("Allowed scopes:");
console.error(`  ${commitScopes.join(", ")}`);
console.error("");
console.error("Examples:");
console.error("  feat(list): add smart empty state snippets");
console.error("  fix(style): avoid duplicate stylesheet placeholders");
console.error("  docs(readme): document commit hooks");
console.error("");
console.error("Notes:");
console.error("  - Use English");
console.error("  - Keep type, scope, and description in lowercase");
console.error("  - Keep the scope singular and focused");
process.exit(1);
