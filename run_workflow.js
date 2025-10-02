#!/usr/bin/env node
/**
 * ZetaV10 Workflow Runner
 * Replaces Kilo CLI: dry-run, backup, failure notifications, logging
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// === CONFIGURATION ===
const DRY_RUN = process.argv.includes("--dry") || false;
const LOG_DIR = "logs";
const BACKUP_DIR_BASE = "backup";
const MAX_LOGS = 30;
const BACKUP_COUNT = 5;

// Load environment variables for notifications
require("dotenv").config();

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const EMAIL_TO = process.env.EMAIL_TO;
const EMAIL_FROM = process.env.EMAIL_FROM;
const EMAIL_SERVER = process.env.EMAIL_SERVER;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// === UTILS ===
function notifyFailure(message) {
  console.error("⚠️ FAILURE:", message);

  // Slack
  if (SLACK_WEBHOOK_URL) {
    try {
      execSync(
        `curl -X POST -H 'Content-type: application/json' --data '{"text":"${message}"}' ${SLACK_WEBHOOK_URL}`
      );
    } catch {}
  }

  // Desktop
  try {
    execSync(`notify-send "ZetaV10 Update Failure" "${message}"`);
  } catch {}

  // Email
  if (EMAIL_TO) {
    const nodemailer = require("nodemailer");
    (async () => {
      let transporter = nodemailer.createTransport({
        host: EMAIL_SERVER,
        port: 587,
        secure: false,
        auth: { user: EMAIL_USER, pass: EMAIL_PASS },
      });
      await transporter.sendMail({
        from: EMAIL_FROM,
        to: EMAIL_TO,
        subject: "ZetaV10 Update Failure",
        text: message,
      });
    })();
  }
}

function runCommand(cmd, description) {
  try {
    console.log(`\n=== ${description} ===`);
    console.log("$", cmd);
    if (!DRY_RUN) execSync(cmd, { stdio: "inherit" });
    else console.log("(Dry-run) Command skipped.");
  } catch (err) {
    notifyFailure(`${description} failed.\n${err.message}`);
    // Rollback if backup exists
    if (!DRY_RUN && fs.existsSync(".last_backup")) {
      const lastBackup = fs.readFileSync(".last_backup", "utf8").trim();
      execSync(`cp -r ${lastBackup}/* .`);
      console.log("Rollback applied from", lastBackup);
    }
    process.exit(1);
  }
}

// === SETUP DIRECTORIES ===
fs.mkdirSync(LOG_DIR, { recursive: true });
fs.mkdirSync(BACKUP_DIR_BASE, { recursive: true });
fs.mkdirSync("dashboard/src", { recursive: true });
fs.mkdirSync("dashboard/public", { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, "_");
const logFile = path.join(LOG_DIR, `zetav10_${timestamp}.log`);
console.log("Logging to:", logFile);
fs.writeFileSync(logFile, `ZetaV10 Workflow Run - ${timestamp}\n\n`);

// Backup folder
const backupDir = path.join(BACKUP_DIR_BASE, timestamp);
fs.mkdirSync(backupDir, { recursive: true });
fs.writeFileSync(".last_backup", backupDir);

// Files to update
const FILES_TO_UPDATE = [
  "components/AgentCard.js",
  "components/MissionControl.js",
  "components/LogsPanel.js",
  "pages/index.js",
  "package.json",
];

// === BACKUP FILES ===
FILES_TO_UPDATE.forEach((f) => {
  if (fs.existsSync(f)) {
    runCommand(`cp ${f} ${backupDir}/`, `Backup ${f}`);
  }
});

// === INSTALL DEPENDENCIES ===
runCommand("npm install", "Install dependencies");
runCommand(
  "npm install --save-dev eslint prettier husky jest @testing-library/react axios",
  "Install devDependencies"
);

// === REPLACE FILES (path-based) ===
// No embedded content needed; files already in repo

// === LINT / FORMAT / TEST ===
runCommand("npm run lint", "Linting");
runCommand("npm run format", "Formatting");
runCommand("npm test", "Running tests");

// === COMMIT & PUSH ===
runCommand("git add .", "Git add files");
runCommand(
  `git commit -m "Update ZetaV10 components" || echo "No changes to commit"`,
  "Git commit"
);
runCommand("git push", "Git push");

// === CLEANUP ===
// Logs retention
const logFiles = fs.readdirSync(LOG_DIR).sort().reverse();
logFiles.slice(MAX_LOGS).forEach((f) => fs.unlinkSync(path.join(LOG_DIR, f)));

// Backup retention
const backupFolders = fs.readdirSync(BACKUP_DIR_BASE).sort().reverse();
backupFolders.slice(BACKUP_COUNT).forEach((f) => {
  fs.rmSync(path.join(BACKUP_DIR_BASE, f), { recursive: true, force: true });
});

// === SUMMARY EMAIL ===
if (EMAIL_TO) {
  const nodemailer = require("nodemailer");
  (async () => {
    let transporter = nodemailer.createTransport({
      host: EMAIL_SERVER,
      port: 587,
      secure: false,
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });
    const report = fs.readFileSync(logFile, "utf8");
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: EMAIL_TO,
      subject: "ZetaV10 Update Summary",
      text: report,
    });
    console.log("Summary email sent to", EMAIL_TO);
  })();
}

console.log("\n✅ ZetaV10 workflow completed successfully!");
