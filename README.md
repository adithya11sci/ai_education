# AI Powered Educator

Welcome to the **AI Powered Educator** project! This repository contains a full-stack application designed to leverage artificial intelligence for educational purposes. It is built as a monorepo containing both the frontend and backend applications.

## 📂 Project Structure

- **`frontend/`**: A Next.js 14+ application using TypeScript, TailwindCSS, and Three.js for a rich, interactive user interface. Deployed on Cloudflare Pages.
- **`backend/`**: A high-performance API built with Hono, running on Cloudflare Workers. It uses Drizzle ORM to interact with a Neon Postgres database.

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or later recommended)
- [pnpm](https://pnpm.io/) (Recommended package manager)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (for Cloudflare deployment/local dev)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/adithya11sci/Ai_powerd_eduator.git
    cd Ai_powerd_eduator
    ```

2.  **Install dependencies:**
    Navigate to each directory and install dependencies.
    ```bash
    # Backend
    cd backend
    npm install

    # Frontend
    cd ../frontend
    npm install
    ```

## 🛠️ Running Locally

To run the full stack locally, you will need to start both the backend and frontend servers in separate terminal windows.

1.  **Start Backend:**
    ```bash
    cd backend
    npm run dev
    ```

2.  **Start Frontend:**
    ```bash
    cd frontend
    npm run dev
    ```
    *Note: The frontend allows for real-time collaboration using PartyKit. You may also need to run `npm run dev:party` if working on those features.*

## 📚 Documentation

For detailed instructions on environment setup, API endpoints, and component details, please refer to the specific README files in each directory:

- [Frontend Documentation](./frontend/README.md)
- [Backend Documentation](./backend/README.md)

## 🤝 Contributing

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
