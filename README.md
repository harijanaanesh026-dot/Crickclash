# NeuronHub — AI Tool Marketplace

A full-stack AI tool marketplace built with **Next.js 14 (App Router)**, **TypeScript**, and **Tailwind CSS**.

## Features

- **Browse & search** AI tools with real-time filtering by category, sort, and keyword
- **Tool detail pages** with full descriptions, tags, ratings, and usage stats
- **Run any tool** — live input forms with output simulation and copy-to-clipboard
- **Add your own tool** — validated form with icon picker, color selector, and output template editor
- **In-memory backend** — Next.js API routes with a shared in-memory store (swap for a DB easily)
- **Modern dark UI** — DM Sans + Inter typography, custom Tailwind tokens, skeleton loaders, animated transitions

---

## Folder Structure

```
ai-marketplace/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout + Navbar
│   │   ├── globals.css          # Tailwind base + custom utilities
│   │   ├── page.tsx             # Homepage: Browse & filter tools
│   │   ├── add-tool/
│   │   │   └── page.tsx         # Submit a new tool form
│   │   ├── tools/
│   │   │   └── [id]/
│   │   │       └── page.tsx     # Tool detail + runner
│   │   └── api/
│   │       ├── tools/
│   │       │   ├── route.ts     # GET (list/filter) + POST (create)
│   │       │   └── [id]/
│   │       │       └── route.ts # GET single tool by ID
│   │       └── run-tool/
│   │           └── route.ts     # POST — execute tool simulation
│   ├── components/
│   │   ├── Navbar.tsx           # Sticky top nav with mobile menu
│   │   ├── ToolCard.tsx         # Tool grid card
│   │   ├── CategoryPill.tsx     # Filter pill button
│   │   └── SkeletonCard.tsx     # Loading skeleton
│   ├── lib/
│   │   └── store.ts             # In-memory data store + helpers
│   └── types/
│       └── index.ts             # TypeScript interfaces
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
├── postcss.config.js
└── package.json
```

---

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- npm, yarn, or pnpm

### 1. Clone or copy the project

```bash
# If cloned from git:
git clone <repo-url> ai-marketplace
cd ai-marketplace

# Or if you have the folder already:
cd ai-marketplace
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for production

```bash
npm run build
npm run start
```

---

## API Reference

### `GET /api/tools`

Returns filtered/sorted list of tools.

| Query Param | Type   | Description                                 |
|-------------|--------|---------------------------------------------|
| `q`         | string | Search query (name, tagline, tags)          |
| `category`  | string | Filter by category name, or `All`           |
| `sort`      | string | `featured` \| `popular` \| `rating` \| `newest` |

**Response**: `{ tools: AITool[], total: number }`

---

### `GET /api/tools/:id`

Returns a single tool by ID.

**Response**: `{ tool: AITool }`

---

### `POST /api/tools`

Creates a new tool.

**Body**: `AITool` shape minus `id`, `usageCount`, `rating`, `createdAt`.

**Response**: `{ tool: AITool }` with status `201`

---

### `POST /api/run-tool`

Executes a tool with given inputs.

**Body**:
```json
{
  "toolId": "code-explainer",
  "inputs": { "code": "...", "language": "TypeScript" }
}
```

**Response**:
```json
{
  "output": "...",
  "processingMs": 743,
  "toolName": "Code Explainer",
  "timestamp": "2024-03-20T10:45:00Z"
}
```

---

## Upgrading to a Real Database

Replace `src/lib/store.ts` with your preferred database client:

- **SQLite**: Use `better-sqlite3`
- **PostgreSQL**: Use `pg` or Prisma
- **MongoDB**: Use the official `mongodb` driver or Mongoose
- **PlanetScale / Turso**: Drop-in cloud SQL

The API route signatures stay identical — only the store internals change.

---

## Customization

- **Add categories**: Update `ToolCategory` in `src/types/index.ts` and `CATEGORIES` in `page.tsx`
- **Add real AI**: Replace `run-tool/route.ts` with an OpenAI / Anthropic API call
- **Persistent storage**: Replace the in-memory array in `store.ts` with a DB
- **Auth**: Add NextAuth.js to gate tool submission behind login
