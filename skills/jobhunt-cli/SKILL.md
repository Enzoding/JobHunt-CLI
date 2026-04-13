---
name: jobhunt-cli
description: Search, export, compare, and analyze public company recruitment jobs with the standalone jobs CLI from JobHunt-CLI. Use when users ask for company job searches, role details, CSV exports, full recruitment indexing, or AI product role reports.
---

# JobHunt-CLI

Use this skill when the user asks to search, export, compare, or analyze public company recruitment jobs.

The primary tool is the standalone `jobs` CLI. Do not require OpenCLI.

## Supported Sites

Run this first when unsure:

```bash
jobs sites
```

Current sites:

- `didi`
- `kuaishou`

## Common Commands

List filters:

```bash
jobs <site> filters --format json
```

Search jobs:

```bash
jobs <site> search "<query>" --category <category> --location <city> --limit 20 --format json
```

Get one detail:

```bash
jobs <site> detail <id> --format json
```

Export all matching jobs:

```bash
jobs <site> all "<query>" --category <category> --max 0 --format json
```

Create an AI product role report:

```bash
jobs <site> analyze ai-product --format md
```

## Workflow

1. Run `jobs sites` to confirm the company is supported.
2. Run `jobs <site> filters --format json` to inspect locations and categories.
3. Use `search` for focused discovery.
4. Use `detail` for one specific job.
5. Use `jobs <site> all --max 0 --format json` for complete analysis or indexing.
6. Use `jobs <site> analyze ai-product --format md` when the user wants a report or role capability profile.

## Output Guidance

- Use `--format json` for agent reasoning, filtering, or further processing.
- Use `--format csv --output <file>` for spreadsheet deliverables.
- Use `--format md --output <file>` for user-facing reports.
- Use `--format table` only for quick terminal previews.

## Notes

Prefer the standalone `jobs` command. OpenCLI compatibility exists only as an optional integration for users who already have OpenCLI installed.
