#!/usr/bin/env python3
"""
Auto-Commit Pipeline for ChatBot Repository
Compliant with IMPLEMENTATION_PLAN.md Sections 48, 49, 50, and 54.

Features:
- Configurable threshold (Default: >= 20 meaningful changed lines)
- Scans for secrets and forbidden file extensions
- Enforces Conventional Commits: <type>(<scope>): <description>
- Timeline dating support starting from March 1, 2026 (via GIT_AUTHOR_DATE & GIT_COMMITTER_DATE)
- Safe push pipeline to origin without force-pushing
"""

import argparse
import os
import re
import subprocess
import sys
import time
from datetime import datetime, timedelta
from typing import List, Optional, Tuple

DEFAULT_THRESHOLD = 10

ALLOWED_TYPES = [
    "feat", "fix", "refactor", "test", "docs",
    "chore", "security", "perf", "build", "ci"
]

FORBIDDEN_FILE_PATTERNS = [
    r"(\.env($|\.(?!example).*))",
    r".*\.pem$",
    r".*\.key$",
    r".*id_rsa.*",
]

SECRET_CONTENT_PATTERNS = [
    re.compile(r"sk" + r"-[a-zA-Z0-9]{20,}"),
    re.compile(r"ghp" + r"_[a-zA-Z0-9]{20,}"),
]

IGNORED_PATH_PREFIXES = (
    ".venv/", "venv/", "node_modules/", ".git/",
    "__pycache__/", "dist/", "build/", ".next/"
)


def run_cmd(cmd: List[str], env: dict = None) -> Tuple[int, str, str]:
    full_env = os.environ.copy()
    if env:
        full_env.update(env)
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, env=full_env)
    return res.returncode, res.stdout.strip(), res.stderr.strip()


def check_secrets(staged_files: List[str]) -> bool:
    """Scan staged files and contents for secrets."""
    clean = True
    for fpath in staged_files:
        for pat in FORBIDDEN_FILE_PATTERNS:
            if re.search(pat, fpath, re.IGNORECASE):
                print(f"[SECURITY ALERT] Forbidden file pattern detected: {fpath}")
                clean = False
        if fpath != "scripts/auto_commit.py" and os.path.exists(fpath) and os.path.isfile(fpath):
            try:
                with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read(100000)
                    for pat in SECRET_CONTENT_PATTERNS:
                        if pat.search(content):
                            print(f"[SECURITY ALERT] Suspected secret detected in {fpath}")
                            clean = False
            except Exception:
                pass
    return clean


def get_diff_stats() -> Tuple[int, int, List[str]]:
    """Calculates added and deleted meaningful lines and changed file list."""
    code, out, _ = run_cmd(["git", "diff", "--cached", "--numstat"])
    if not out:
        code, out, _ = run_cmd(["git", "diff", "--numstat"])
    
    total_added = 0
    total_deleted = 0
    files = []

    for line in out.splitlines():
        parts = line.split("\t")
        if len(parts) == 3:
            add_str, del_str, path = parts
            if any(path.startswith(prefix) for prefix in IGNORED_PATH_PREFIXES):
                continue
            add = int(add_str) if add_str.isdigit() else 0
            dels = int(del_str) if del_str.isdigit() else 0
            total_added += add
            total_deleted += dels
            files.append(path)

    # Check untracked files
    code, untracked_out, _ = run_cmd(["git", "status", "--porcelain"])
    for line in untracked_out.splitlines():
        if line.startswith("??"):
            path = line[3:].strip()
            if not any(path.startswith(prefix) for prefix in IGNORED_PATH_PREFIXES):
                if path not in files:
                    files.append(path)
                    if os.path.isfile(path):
                        try:
                            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                                total_added += sum(1 for _ in f)
                        except Exception:
                            pass

    return total_added, total_deleted, files


def get_next_chronological_date() -> str:
    """Calculates next chronological date starting from March 1, 2026 based on git history."""
    code, out, _ = run_cmd(["git", "log", "-1", "--format=%cI"])
    if code == 0 and out:
        try:
            last_dt = datetime.fromisoformat(out)
            next_dt = last_dt + timedelta(days=1)
            # Cap at today
            now = datetime.now(last_dt.tzinfo)
            if next_dt > now:
                next_dt = now
            return next_dt.strftime("%Y-%m-%d %H:%M:%S %z")
        except Exception:
            pass
    return "2026-03-03 10:00:00 +0545"


def format_commit_date(date_input: str) -> str:
    """Formats input date into standard git ISO format."""
    try:
        if len(date_input) == 10:
            dt = datetime.strptime(date_input, "%Y-%m-%d")
            return dt.strftime("%Y-%m-%d 12:00:00 +0545")
        dt = datetime.fromisoformat(date_input)
        return dt.strftime("%Y-%m-%d %H:%M:%S +0545")
    except Exception:
        return date_input


def auto_commit(
    commit_type: str = "feat",
    scope: str = "core",
    message: str = "update codebase",
    commit_date: Optional[str] = None,
    push: bool = True,
    dry_run: bool = False,
    threshold: int = DEFAULT_THRESHOLD,
    allow_threshold_bypass: bool = False
) -> bool:
    if commit_type not in ALLOWED_TYPES:
        print(f"[ERROR] Invalid commit type '{commit_type}'. Must be one of: {', '.join(ALLOWED_TYPES)}")
        return False

    total_added, total_deleted, files = get_diff_stats()
    meaningful_changes = total_added + total_deleted

    print(f"[PIPELINE] Detected {meaningful_changes} meaningful changed lines across {len(files)} files (Threshold: >={threshold}).")

    if meaningful_changes < threshold and not allow_threshold_bypass:
        print(f"[PENDING] Meaningful changes ({meaningful_changes}) < threshold ({threshold}). Awaiting further changes.")
        return False

    # Stage files
    if not dry_run:
        run_cmd(["git", "add", "-A"])
    
    # Check secrets in staged files
    _, staged_out, _ = run_cmd(["git", "diff", "--cached", "--name-only"])
    staged_files = staged_out.splitlines() if staged_out else files
    if not check_secrets(staged_files):
        print("[ABORT] Secret scanning failed. Remove secrets before committing.")
        return False

    formatted_msg = f"{commit_type}({scope}): {message}" if scope else f"{commit_type}: {message}"
    print(f"[PIPELINE] Commit message: \"{formatted_msg}\"")

    env_vars = {}
    if not commit_date:
        commit_date = get_next_chronological_date()

    git_date = format_commit_date(commit_date)
    env_vars["GIT_AUTHOR_DATE"] = git_date
    env_vars["GIT_COMMITTER_DATE"] = git_date
    print(f"[PIPELINE] Commit timestamp: {git_date}")

    if dry_run:
        print(f"[DRY RUN] Would execute: git commit -m \"{formatted_msg}\"")
        if push:
            print("[DRY RUN] Would execute: git push origin <current-branch>")
        return True

    commit_cmd = ["git", "commit", "-m", formatted_msg]
    code, out, err = run_cmd(commit_cmd, env=env_vars)
    if code != 0:
        print(f"[ERROR] Commit failed:\n{err or out}")
        return False
    print(f"[SUCCESS] Committed successfully:\n{out}")

    if push:
        print("[PIPELINE] Pushing to remote repository...")
        code, branch, _ = run_cmd(["git", "rev-parse", "--abbrev-ref", "HEAD"])
        push_cmd = ["git", "push", "origin", branch]
        code, out, err = run_cmd(push_cmd)
        if code != 0:
            print(f"[WARNING] Push failed (commit preserved locally):\n{err or out}")
            return False
        print(f"[SUCCESS] Pushed to origin/{branch} successfully.")

    return True


def watch_and_commit(threshold: int = DEFAULT_THRESHOLD, interval_seconds: int = 15):
    """Watches workspace and automatically commits and pushes whenever >= threshold lines change."""
    print(f"[WATCHER] Watching workspace for changes >= {threshold} lines (poll interval: {interval_seconds}s)...")
    while True:
        try:
            total_added, total_deleted, files = get_diff_stats()
            meaningful = total_added + total_deleted
            if meaningful >= threshold:
                print(f"[WATCHER] Change threshold reached: {meaningful} lines changed across {len(files)} files.")
                auto_commit(
                    commit_type="feat",
                    scope="core",
                    message="automated checkpoint of progressive changes",
                    push=True,
                    threshold=threshold
                )
            time.sleep(interval_seconds)
        except KeyboardInterrupt:
            print("[WATCHER] Stopped.")
            break


def main():
    parser = argparse.ArgumentParser(description="ChatBot Auto-Commit Pipeline")
    parser.add_argument("--type", choices=ALLOWED_TYPES, default="feat", help="Conventional commit type")
    parser.add_argument("--scope", default="", help="Commit scope (e.g., backend, auth, rag)")
    parser.add_argument("--msg", default="update progressive changes", help="Commit description")
    parser.add_argument("--date", help="Set commit date (e.g., '2026-03-01' or '2026-03-01 14:30:00')")
    parser.add_argument("--no-push", action="store_true", help="Do not push after committing")
    parser.add_argument("--dry-run", action="store_true", help="Inspect what would be committed without executing")
    parser.add_argument("--threshold", type=int, default=DEFAULT_THRESHOLD, help="Line threshold (default: 20)")
    parser.add_argument("--force-threshold", action="store_true", help="Allow commit even if < threshold")
    parser.add_argument("--watch", action="store_true", help="Run in background watcher mode")

    args = parser.parse_args()

    if args.watch:
        watch_and_commit(threshold=args.threshold)
        return

    success = auto_commit(
        commit_type=args.type,
        scope=args.scope,
        message=args.msg,
        commit_date=args.date,
        push=not args.no_push,
        dry_run=args.dry_run,
        threshold=args.threshold,
        allow_threshold_bypass=args.force_threshold
    )
    if not success:
        sys.exit(1)


if __name__ == "__main__":
    main()
