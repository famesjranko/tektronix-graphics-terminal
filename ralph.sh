#!/bin/bash
# Ralph Wiggum - Long-running AI agent loop
# Usage: ./ralph.sh [--tool amp|claude] [max_iterations]

set -e

# Parse arguments
TOOL="claude"
MAX_ITERATIONS=10

while [[ $# -gt 0 ]]; do
  case $1 in
    --tool)
      TOOL="$2"
      shift 2
      ;;
    --tool=*)
      TOOL="${1#*=}"
      shift
      ;;
    *)
      if [[ "$1" =~ ^[0-9]+$ ]]; then
        MAX_ITERATIONS="$1"
      fi
      shift
      ;;
  esac
done

if [[ "$TOOL" != "amp" && "$TOOL" != "claude" ]]; then
  echo "Error: Invalid tool '$TOOL'. Must be 'amp' or 'claude'."
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PRD_FILE="$SCRIPT_DIR/prd.json"
PROGRESS_FILE="$SCRIPT_DIR/progress.txt"

# Initialize progress file if needed
if [ ! -f "$PROGRESS_FILE" ]; then
  echo "# Ralph Progress Log" > "$PROGRESS_FILE"
  echo "Started: $(date)" >> "$PROGRESS_FILE"
  echo "---" >> "$PROGRESS_FILE"
fi

echo "Starting Ralph - Tool: $TOOL - Max iterations: $MAX_ITERATIONS"

for i in $(seq 1 $MAX_ITERATIONS); do
  echo ""
  echo "==============================================================="
  echo "  Ralph Iteration $i of $MAX_ITERATIONS ($TOOL)"
  echo "==============================================================="

  # Find next incomplete story
  NEXT_STORY=$(jq -r '.userStories[] | select(.passes == false) | .id' "$PRD_FILE" | head -1)

  if [ -z "$NEXT_STORY" ]; then
    echo ""
    echo "========================================="
    echo "  Ralph completed all tasks!"
    echo "  Finished at iteration $i of $MAX_ITERATIONS"
    echo "========================================="
    exit 0
  fi

  STORY_TITLE=$(jq -r ".userStories[] | select(.id == \"$NEXT_STORY\") | .title" "$PRD_FILE")
  echo ">>> Working on: $NEXT_STORY - $STORY_TITLE"

  # Build the prompt for this specific story
  TASK_PROMPT="You are implementing a single user story for the Tektronix Graphics Terminal project.

## Your Task: $NEXT_STORY - $STORY_TITLE

Read prd.json to get the full acceptance criteria for story $NEXT_STORY.
Read progress.txt for codebase patterns and context from previous work.
Read PRD.md for overall project specifications.

Then:
1. Implement ONLY story $NEXT_STORY (not any other stories)
2. Test your implementation
3. Commit with message: feat: $NEXT_STORY - $STORY_TITLE
4. Update prd.json to set passes: true for $NEXT_STORY
5. Append your progress to progress.txt

Quality requirements:
- NO build step - vanilla JS with ES6 modules
- Use relative imports: import { x } from './path/to/file.js'
- Follow existing code patterns in the codebase

When done, output: <iteration-done>

DO NOT work on any other stories. Just $NEXT_STORY."

  # Run the tool
  if [[ "$TOOL" == "amp" ]]; then
    OUTPUT=$(echo "$TASK_PROMPT" | timeout 300 amp --dangerously-allow-all 2>&1 | tee /dev/stderr) || true
  else
    OUTPUT=$(echo "$TASK_PROMPT" | timeout 300 claude --dangerously-skip-permissions --print 2>&1 | tee /dev/stderr) || true
  fi

  # Check result
  if echo "$OUTPUT" | grep -q "<iteration-done>"; then
    echo ""
    echo ">>> Story $NEXT_STORY completed. Starting fresh context..."
  else
    echo ""
    echo ">>> Iteration ended (timeout or no marker). Checking progress..."
  fi

  sleep 2
done

echo ""
echo "Ralph reached max iterations ($MAX_ITERATIONS)."
echo "Check prd.json and progress.txt for status."
exit 1
