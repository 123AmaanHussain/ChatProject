# Chat-App

> A production-grade real-time messaging experience with a portfolio-friendly DX.

## Executive Summary
Chat-App is a full-stack messaging platform that mirrors engineering practices—typed REST APIs, socket-driven live updates, secure session handling, and cloud-native services—while staying approachable for contributors. The project showcases:

- **End-to-end messaging** with optimistic UI updates, image attachments, and deletion controls.
- **Session-aware UX** powered by JWT cookies, resilient socket reconnections, and presence signals.
- **Cloud-first integrations** (MongoDB Atlas, Cloudinary, Resend, Arcjet) that reflect real-world deployment patterns.

## System Architecture
```
┌───────────┐       HTTPS + Cookies        ┌──────────────┐
│ React/Vite│  ─────────────────────────▶  │ Express API  │
│ + Zustand │◀───────────────────────────  │ (auth, msgs) │
└────┬──────┘        Socket.IO WS           └─────┬────────┘
     │                                         │
     │                                         │
     ▼                                         ▼
Tailwind UI                          MongoDB • Cloudinary
(Frontend)                           Resend • Arcjet Guardrails
```
- Frontend routes gated via Zustand auth store (`/`, `/login`, `/signup`).
- Express services expose `/api/auth` and `/api/messages`, sharing a single server instance with Socket.IO for real-time flows.
- Production build serves the Vite bundle directly from the Node server for simplified deployment.

## Tech Stack
| Layer        | Technologies |
|--------------|--------------|
| Frontend     | React 19, Vite, Zustand, Tailwind CSS, DaisyUI, react-hot-toast, lucide-react |
| Backend      | Node.js 20+, Express, Socket.IO, Mongoose, bcryptjs, JWT, cookie-parser |
| Cloud & Ops  | MongoDB Atlas, Cloudinary (media), Resend (emails), Arcjet (security), dotenv |

## Feature Highlights
1. **Secure Onboarding** – Signup/login with hashed credentials, JWT cookies, and welcome emails.
2. **Presence & Notifications** – Live online roster, keyboard/audio cues, optimistic message delivery.
3. **Media-Rich Chat** – Inline image uploads via Cloudinary, message timestamps, deletion controls.
4. **Performance UX** – Skeleton loaders, suspenseful transitions, and sound toggles for accessibility.
5. **Production-ready Deployment** – Single `server.js` entry that serves API + static assets with CORS + cookie hardening.

## Repository Layout
```
Chat-APP/
├── backend/
│   ├── src/
│   │   ├── controllers/        # Auth & messaging orchestration
│   │   ├── lib/                # DB, env, socket, cloud utilities
│   │   ├── middleware/         # Auth guards and inspectors
│   │   └── routes/             # /auth and /messages REST surfaces
├── frontend/
│   ├── src/
│   │   ├── pages/              # Chat, Login, Signup layouts
│   │   ├── components/         # Chat UI, inputs, headers, loaders
│   │   └── store/              # Zustand stores for auth + chat
├── package.json                # Root scripts (build/start)
└── README.md                   # You are here
```

## Getting Started (Local)
1. **Prerequisites** – Node.js ≥ 20, npm ≥ 10, MongoDB/Cloudinary accounts for secrets.
2. **Install dependencies**
   ```bash
   npm install --prefix backend
   npm install --prefix frontend
   ```
3. **Run the backend (API + Socket.IO)**
   ```bash
   npm run dev --prefix backend
   ```
4. **Run the frontend (Vite dev server)**
   ```bash
   npm run dev --prefix frontend
   ```
5. Navigate to the printed Vite URL (default `http://localhost:5173`). The frontend proxies `/api` to the backend and shares credentials for auth.

> Production build: `npm run build` at repo root bundles the Vite app and installs server deps; `npm start` bootstraps the Express server.

## Environment Variables
Create `backend/.env` with the following keys:

| Variable | Description |
|----------|-------------|
| `PORT` | Backend port (default 3000) |
| `NODE_ENV` | `development` or `production` |
| `CLIENT_URL` | Frontend origin for CORS + emails |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing auth cookies |
| `RESEND_API_KEY` / `EMAIL_FROM` / `EMAIL_FROM_NAME` | Transactional email identity |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Media upload credentials |
| `ARCJET_KEY` / `ARCJET_SECRET` | Bot/abuse protection tokens |

> Frontend consumes Vite env vars (e.g., `VITE_API_BASE_URL`) if you need to override defaults.

## API Surface
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| `POST` | `/api/auth/signup` | Register user + issue JWT cookie | No |
| `POST` | `/api/auth/login` | Session login | No |
| `POST` | `/api/auth/logout` | Invalidate cookie | Yes |
| `GET`  | `/api/auth/check` | Validate existing session | Yes |
| `PUT`  | `/api/auth/update-profile` | Upload profile picture via Cloudinary | Yes |
| `GET`  | `/api/messages/contacts` | Fetch address book | Yes |
| `GET`  | `/api/messages/chats` | Recent chat partners | Yes |
| `GET`  | `/api/messages/:userId` | Conversation history | Yes |
| `POST` | `/api/messages/send/:userId` | Send message (text/image) | Yes |
| `DELETE` | `/api/messages/:messageId` | Delete a message | Yes |

Socket events: `setup`, `getOnlineUsers`, `newMessage`, `messageDeleted` keep clients synchronized in real time.

## Frontend Experience
- **Route Guarding:** `App.jsx` conditionally renders ChatPage vs. Auth flows based on `useAuthStore` state.
- **State Management:** Lightweight Zustand stores manage auth, chat data, and sound preferences without Redux boilerplate.
- **UI/UX:** Tailwind + DaisyUI + custom gradients deliver a polished interface with skeletons and toasts to guide users.

## Quality & Future Work
- Add automated integration tests (Playwright/Vitest) around messaging flows.
- Expand accessibility coverage (focus traps for menus, ARIA on chat bubbles).
- Instrument analytics and tracing hooks for production observability.