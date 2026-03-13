# Everyday Story

A personal daily storytelling journal app to practice and improve storytelling skills.

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Database**: MongoDB via Mongoose
- **AI**: Claude API via `@anthropic-ai/sdk`
- **Styling**: Tailwind CSS v4 (with `@tailwindcss/postcss`)
- **Deployment**: Vercel

## Project Structure

```
app/                    # Next.js App Router
  layout.tsx            # Root layout (fonts: Bebas Neue, DM Sans, Playfair Display)
  page.tsx              # Single-page app with tab navigation (client component)
  globals.css           # Tailwind theme + decorative CSS (dot-grid, rule-line, story-card)
  api/
    stories/route.ts    # GET (list/filter by date), POST (create story)
    stories/[id]/route.ts  # DELETE story
    stories/export/route.ts # GET → download all stories as markdown
    ai/route.ts         # POST → Claude Q&A about user's stories
components/             # Client components
  Header.tsx            # App title + decorative elements
  TabNav.tsx            # Write | Browse | AI Chat | Export
  StoryEditor.tsx       # Date picker + textarea + save
  StoryBrowser.tsx      # Date-grouped story list with filter
  StoryCard.tsx         # Single story display with delete
  AiChat.tsx            # Chat UI with suggestion chips
  ExportPanel.tsx       # Download button + story count
lib/mongodb.ts          # Cached Mongoose connection (serverless pattern)
models/Story.ts         # Schema: { date, content, timestamps }
types/index.ts          # StoryType, TabId
```

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — run ESLint

## Environment Variables

- `MONGODB_URI` — MongoDB connection string
- `ANTHROPIC_API_KEY` — Anthropic API key for Claude AI features

## Design System

Retro-modern editorial aesthetic (Warm Earth palette):
- **Colors**: cream `#F5F0E8`, olive `#8B9A6E`, forest `#1A3A2A`, terracotta `#C4603A`
- **Fonts**: Bebas Neue (display), DM Sans (body/labels), Playfair Display (story text)
- **Patterns**: dot grids, rule lines, 6px terracotta card top borders
- All theme tokens defined in `app/globals.css` under `@theme`

## Key Patterns

- MongoDB connection uses global cache for Vercel serverless (`lib/mongodb.ts`)
- Dates stored as UTC midnight; queried with day range to avoid timezone issues
- AI endpoint sends last 50 stories as context to Claude
- No auth — personal app
