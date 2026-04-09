# MERN Deployment Teaching Starter

This project is a teaching starter for:
- React (Vite frontend)
- Express backend
- MongoDB Atlas
- Session-based authentication
- Basic HTTP caching examples
- Deployment to Render as **one web service**

## Goal
You receive most of the code already written.
Complete a few focused TODOs around and focus on deployment:
1. Session setup
2. Login / logout
3. Cache headers
4. Protected route behavior

## Project structure
- `client/` - React frontend
- `server/` - Express + Mongoose backend
- `instructor-only/` - solution notes and deployment checklist

## Local setup
### 1) Install root dev dependency
```bash
npm install
```

### 2) Create environment file
Create `server/.env` from `server/.env.example`

### 3) Start both frontend and backend
```bash
npm run dev
```

- React client: `http://localhost:5173`
- Express server: `http://localhost:5001`

## Build for production
```bash
npm run build
npm start
```

The Express server will serve the built React app from `client/dist`.

## Suggested TODOs
Search the backend for `TODO:`.
