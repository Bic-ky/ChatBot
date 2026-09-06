#!/usr/bin/env python3
"""
Forestation History Generator
Recreates commit history from March 1, 2026 to present with natural distribution.
Compliant with user specification for contribution backfill.
"""

import os
import random
import subprocess
import sys
from datetime import datetime, timedelta, timezone

USER_NAME = "Bic-ky"
USER_EMAIL = "yadavbicky99@gmail.com"
BRANCH_NAME = "main"

# Start date: March 1, 2026 10:00:00
START_DT = datetime(2026, 3, 1, 10, 0, 0)
# End date: Current time
END_DT = datetime.now()


def run_git(args, env=None):
    full_env = os.environ.copy()
    if env:
        full_env.update(env)
    res = subprocess.run(["git"] + args, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, env=full_env)
    return res.returncode, res.stdout.strip(), res.stderr.strip()


def run_forestation():
    print(f"Starting history backfill from {START_DT.strftime('%Y-%m-%d')} to {END_DT.strftime('%Y-%m-%d')}...")

    current_dt = START_DT
    commit_count = 0

    # Ensure repo directory
    history_file = ".backfill_history"

    while current_dt < END_DT:
        daily_commits = random.randint(1, 3)

        for _ in range(daily_commits):
            # 1 to 4 hours apart
            offset_seconds = random.randint(3600, 10800)
            current_dt += timedelta(seconds=offset_seconds)

            if current_dt >= END_DT:
                break

            readable_date = current_dt.strftime("%Y-%m-%d %H:%M:%S")
            iso_date = current_dt.strftime("%Y-%m-%dT%H:%M:%S+05:45")

            with open(history_file, "a", encoding="utf-8") as f:
                f.write(f"/* Architecture update logged at {readable_date} */\n")

            run_git(["add", "-f", history_file])

            commit_env = {
                "GIT_AUTHOR_NAME": USER_NAME,
                "GIT_AUTHOR_EMAIL": USER_EMAIL,
                "GIT_COMMITTER_NAME": USER_NAME,
                "GIT_COMMITTER_EMAIL": USER_EMAIL,
                "GIT_AUTHOR_DATE": iso_date,
                "GIT_COMMITTER_DATE": iso_date,
            }

            code, out, err = run_git(["commit", "-m", "docs: update architecture records and system specs"], env=commit_env)
            if code != 0:
                print(f"[ERROR] Commit failed on {readable_date}: {err}")
                return False

            commit_count += 1

        # Jump forward to next morning (roughly 12-18 hours)
        next_day_jump = random.randint(43200, 64800)
        current_dt += timedelta(seconds=next_day_jump)

    # Set state file
    with open(".last_commit_date", "w", encoding="utf-8") as f:
        f.write(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    run_git(["add", "-f", ".last_commit_date"])
    now_iso = datetime.now().strftime("%Y-%m-%dT%H:%M:%S+05:45")
    commit_env = {
        "GIT_AUTHOR_NAME": USER_NAME,
        "GIT_AUTHOR_EMAIL": USER_EMAIL,
        "GIT_COMMITTER_NAME": USER_NAME,
        "GIT_COMMITTER_EMAIL": USER_EMAIL,
        "GIT_AUTHOR_DATE": now_iso,
        "GIT_COMMITTER_DATE": now_iso,
    }
    run_git(["commit", "-m", "chore: finalize backfill state tracking"], env=commit_env)
    commit_count += 1

    print(f"Created {commit_count} commits successfully.")
    print("Pushing all commits to GitHub origin main...")

    code, out, err = run_git(["push", "origin", BRANCH_NAME])
    if code != 0:
        print(f"[WARNING] Push failed:\n{err or out}")
        return False

    print("Backfill complete! Contribution graph is now populated with green tiles.")
    return True


if __name__ == "__main__":
    success = run_forestation()
    sys.exit(0 if success else 1)
