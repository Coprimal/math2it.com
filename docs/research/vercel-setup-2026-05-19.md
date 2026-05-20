# Vercel Project Setup for GH Actions Deploy

Date: 2026-05-19
Phase: 8.3 — one-time manual configuration

## 1. Link Vercel project (if `.vercel/project.json` is missing)

```bash
yarn dlx vercel link
# Follow prompts to select the math2it project
# This creates .vercel/project.json locally (gitignored)
```

## 2. GitHub Secrets

Go to **GitHub repo → Settings → Secrets and variables → Actions** and add:

| Secret              | Source                                          |
| ------------------- | ----------------------------------------------- |
| `VERCEL_TOKEN`      | https://vercel.com/account/tokens (project-scoped) |
| `VERCEL_ORG_ID`     | `.vercel/project.json` → `orgId`                |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` → `projectId`            |

## 3. Vercel Environment Variables

Go to **Vercel project → Settings → Environment Variables** and add these for **both Production and Preview**:

| Variable                        | Notes                                      |
| ------------------------------- | ------------------------------------------ |
| `NOTION_TOKEN`                  | Official Notion integration token          |
| `NOTION_TOKEN_V2`               | Unofficial Notion cookie token (optional)  |
| `NOTION_ACTIVE_USER`            | Unofficial Notion active user ID (optional)|
| `NOTION_DB_POSTS`               | Posts database ID                          |
| `NEXT_PUBLIC_ID_SLUG`           | Public page/ID slug mappings               |
| `NEXT_PUBLIC_SITE_URL`          | Site URL (prod: https://math2it.com)       |
| `POSTS_PER_PAGE`                | Number of posts per paginated page         |
| `ENV_MODE`                      | `prod` for Production, `dev` for Preview   |
| `NEXT_PUBLIC_ENV_MODE`          | Same as ENV_MODE                           |

Copy values from local `.env.local`. The GH Actions workflow passes `ENV_MODE` and `NEXT_PUBLIC_ENV_MODE` at build time, but the others must be set in Vercel so `vercel pull` brings them down.

## 4. Disable Vercel Auto-Build

Go to **Vercel project → Settings → Git → "Ignored Build Step"** and set the command to:

```
exit 0
```

This makes Vercel skip its own build on every git push. Only `vercel deploy --prebuilt` from the GitHub Actions workflow ships a build.

**Alternative**: Disconnect the Git integration entirely (Settings → Git → Disconnect). `exit 0` is preferred because it's reversible.

## 5. Verify

After completing the above:
1. Push to `dev` — Vercel dashboard should show "Ignored Build Step"
2. GH Actions workflow triggers → builds → deploys via `vercel deploy --prebuilt`
3. Preview URL renders correctly

## Rollback

- Re-enable auto-build: clear the "Ignored Build Step" field in Vercel settings
- Or reconnect Git integration if it was disconnected
