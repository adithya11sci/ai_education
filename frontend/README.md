# Frontend - AI Powered Educator

This directory contains the client-side application for the AI Powered Educator. It is a modern web application built with Next.js, featuring real-time collaboration, 3D graphics, and live audio/video capabilities.

## 🔧 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (React)
- **Language:** TypeScript
- **Styling:** [TailwindCSS](https://tailwindcss.com/)
- **Deployment:** [Cloudflare Pages](https://pages.cloudflare.com/) via `@cloudflare/next-on-pages`
- **Real-time Collaboration:** [PartyKit](https://partykit.io/)
- **Audio/Video:** [LiveKit](https://livekit.io/)
- **3D Graphics:** [Three.js](https://threejs.org/) / [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- **Code Editor:** Monaco Editor
- **Linting & Formatting:** [Biome](https://biomejs.dev/)

## 🚀 Getting Started

### Prerequisites

Ensure you have `Node.js` installed. We use `npm` (or `pnpm`) for package management.

### Installation

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Environment Variables

Create a `.env.local` file in the root of the `frontend` directory. You will need keys for the following services:

```env
# Example configuration
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
NEXT_PUBLIC_PARTYKIT_HOST=localhost:1999
```

*Note: Contact the project maintainer for the specific environment variable keys required.*

### Running Development Server

To start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### PartyKit (Real-time Server)

If you are working on real-time features, you also need to run the PartyKit server:

```bash
npm run dev:party
```

### Building for Production

To build the application for deployment (specifically for Cloudflare Pages):

```bash
npm run pages:build
```

## 📂 Project Structure

- **`/src`**: Main source code (Components, Pages, Hooks).
- **`/public`**: Static assets.
- **`/party`**: PartyKit server-side logic.
- **`next.config.ts`**: Next.js configuration.
- **`biome.json`**: Linter and formatter configuration.

## 🧼 Linting & Formatting

We use **Biome** for fast linting and formatting.

- **Check:** `npm run lint`
- **Format:** `npm run format`
