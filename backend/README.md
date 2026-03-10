# Backend - AI Powered Educator

This directory contains the server-side logic for the AI Powered Educator. It is a lightweight, edge-compatible API built with Hono and deployed on Cloudflare Workers.

## 🔧 Tech Stack

- **Framework:** [Hono](https://hono.dev/)
- **Runtime:** [Cloudflare Workers](https://workers.cloudflare.com/)
- **Database:** [Neon (Serverless Postgres)](https://neon.tech/)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication:** [Arctic](https://arcticjs.dev/)
- **LiveKit SDK:** For managing video/audio rooms.
- **Linting & Formatting:** [Biome](https://biomejs.dev/)

## 🚀 Getting Started

### Prerequisites

- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/): `npm install -g wrangler`
- A Neon database connection string.
- LiveKit API keys.

### Installation

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Environment Variables

This project uses `wrangler` for secrets management in development. Create a `.dev.vars` file in the `backend` directory (do **NOT** commit this file):

```ini
# .dev.vars
DATABASE_URL="postgresql://user:password@endpoint.neon.tech/neondb?sslmode=require"
LIVEKIT_URL="wss://your-project.livekit.cloud"
LIVEKIT_API_KEY="your_api_key"
LIVEKIT_API_SECRET="your_api_secret"
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
FRONTEND_URL="http://localhost:3000"
API_URL="http://localhost:8787"
```

### Database Setup (Drizzle & Neon)

To manage the database schema:

- **Generate migrations:** `npm run db:generate` (if script configured) or use `drizzle-kit generate`
- **Push schema changes directly:** `npm run db:push`
- **Open Drizzle Studio:** `npm run db:studio` (View and edit data via UI)

### Running Development Server

To start the local worker development server:

```bash
npm run dev
```

The API will be available at [http://localhost:8787](http://localhost:8787).

## 📂 Project Structure

- **`/src`**: API routes and Hono application logic.
- **`drizzle.config.ts`**: Configuration for Drizzle ORM.
- **`wrangler.toml`**: Cloudflare Workers configuration.
- **`biome.json`**: Linter and formatter configuration.

## 🚀 Deployment

Deploy to Cloudflare Workers using Wrangler:

```bash
npm run deploy
```
