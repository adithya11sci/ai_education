# AI Powered Educator

Welcome to the **AI Powered Educator** project! This repository contains a full-stack application designed to leverage artificial intelligence for educational purposes. It is built as a monorepo containing both the frontend and backend applications.

## 📂 Project Structure

- **`frontend/`**: A Next.js 14+ application using TypeScript, TailwindCSS, and Three.js for a rich, interactive user interface. Deployed on Cloudflare Pages.
- **`backend/`**: A high-performance API built with Hono, running on Cloudflare Workers. It uses Drizzle ORM to interact with a Neon Postgres database.

## 🌟 Key Features & Advantages

### 1. Course System (Inner Pages)
Each course includes **detailed modules, assessments, and intelligent recommendations**.
- Structured **course → module → lesson flow**
- **Questions and quizzes after each module**
- **Performance-based recommendations** (Weak topic revisions, Additional practice content)
- Adaptive learning path based on user performance & speed

### 2. AI Tutor System
A **fully personalized AI-powered learning assistant**.
- One-on-one **AI interview simulator**
- AI-powered **podcast-based learning**
- **RAG-based (Retrieval Augmented Generation) learning**
- Real-time **question answering & explanations**

### 3. Smart Roadmap Generator
A **dynamic roadmap creation & tracking system**.
- Pre-built **career-based & skill-based roadmaps**
- AI-generated **custom roadmaps based on user goals**
- Personalized content & coding challenges

### 4. User Profiles & Analytics Dashboard
A **complete learning activity tracker**, similar to a **LeetCode-style dashboard**.
- Daily & weekly activity graphs
- Coding streaks, Achievements & badges
- Learning insights powered by AI

### 5. Notes System (Personal + Collaborative)
A **powerful digital notebook with collaboration support**.
- Markdown & rich-text support (Code snippets, Images, Diagrams)
- Collaborative notes with real-time multi-user editing

### 6. Study Groups & Collaborative Rooms
Real-time **group-based learning environment**.
- Create **study rooms** with Group chat, Voice & video meetings
- Team collaboration for Learning, Coding, & Interview preparation

### 7. Collaborative Coding & Learning
Live **collaborative coding & problem-solving platform**.
- Real-time code editing & Pair programming
- Shared debugging sessions & Whiteboard-style explanations

### 8. Updates & Opportunities Hub
Centralized **learning opportunity feed**.
- Scholarships, Internships, Hackathons, & Job alerts
- Personalized recommendations based on Skills & Career interests

### 9. VR Learning & Immersive Classrooms (Future Vision)
A **virtual reality-based collaborative learning world**.
- Virtual classrooms with Avatar-based presence
- Gamified VR learning spaces & Hands-on simulation environments

### 10. Gamified Learning & Competitive Platform
Game-based learning for **high engagement & motivation**.
- Quiz-based games, Course-level competitions, & Coding battles
- Leaderboards, Rewards, Badges & achievements

### 11. 🛡️ AI Proctoring System
An **AI-powered proctoring system** to ensure **fair play & distraction-free learning**.
- Real-time **face, eye, and head movement detection**
- **Audio monitoring & Screen detection**
- **Proctor-verified leaderboards**

### 12. 🏫 Virtual Classroom Features
An **interactive online classroom** for **live, collaborative learning**.
- Live **video & audio classes** with Screen sharing & Whiteboard
- **In-class quizzes & instant feedback**

### 13. 💬 AI Help Chatbox
An **AI-powered assistant** to guide users on platform usage.
- Step-by-step **guided navigation**
- Smart **feature recommendations**

### 14. Focus Mode & Voice Control
- **Focus Mode:** Distraction-free UI, Pomodoro timer, Ambient music
- **Voice Mode:** Fully voice-controlled navigation ("Open my roadmap", "Start focus mode")

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
