require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const Todo = require("./Todo");

const app = express();
const PORT = process.env.PORT || 5001;
const isProduction = process.env.NODE_ENV === "production";

app.set("trust proxy", 1);
app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// TODO 1:
// Add express-session middleware here.
// Requirements:
// - secret should use process.env.SESSION_SECRET
// - resave should be false
// - saveUninitialized should be false
// - cookie.maxAge should be 1000 * 60 * 60 * 2
// - cookie.httpOnly should be true
// - cookie.sameSite should be 'lax'
// - cookie.secure should be true only in production
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 2,
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
    },
  }),
);

const classroomUsers = {
  student: { username: "student", password: "password123", role: "student" },
  admin: { username: "admin", password: "password123", role: "admin" },
};

function requireLogin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: "Login required." });
  }
  next();
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/public/tips", (req, res) => {
  // TODO 2:
  // Add a short cache header for public demo data.
  // Use Cache-Control: public, max-age=30
  res.set("Cache-Control", "public, max-age=30");

  res.json({
    generatedAt: new Date().toISOString(),
    tips: [
      "Public content can usually be cached for a short time.",
      "Private user data should normally avoid shared caching.",
      "Render Free may sleep when idle, so first load can be slower.",
    ],
  });
});

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  const user = classroomUsers[username];

  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid username or password." });
  }

  // TODO 3:
  // Save a minimal user object in req.session.user
  // Example shape:
  // { username: user.username, role: user.role }
  req.session.user = {
    username: user.username,
    role: user.role,
  };

  res.json({
    message: "Login successful.",
    user: req.session.user,
  });
});

app.post("/api/auth/logout", (req, res) => {
  // TODO 4:
  // Destroy the session and return:
  // { message: 'Logged out.' }
  // If an error occurs, return status 500 with JSON { error: 'Logout failed.' }
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed." });
    }

    res.json({ message: "Logged out." });
  });
});

app.get("/api/session/me", requireLogin, (req, res) => {
  // TODO 5:
  // For private/session-based data, disable caching with these headers:
  // Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate
  // Pragma: no-cache
  // Expires: 0
  res.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");

  res.json({ user: req.session.user });
});

app.get("/api/todos", requireLogin, async (req, res) => {
  const todos = await Todo.find({ owner: req.session.user.username }).sort({
    createdAt: -1,
  });
  res.json(todos);
});

app.post("/api/todos", requireLogin, async (req, res) => {
  const title = (req.body.title || "").trim();
  if (!title) return res.status(400).json({ error: "Title is required." });

  const created = await Todo.create({
    title,
    owner: req.session.user.username,
  });

  res.status(201).json(created);
});

app.patch("/api/todos/:id/toggle", requireLogin, async (req, res) => {
  const todo = await Todo.findOne({
    _id: req.params.id,
    owner: req.session.user.username,
  });

  if (!todo) {
    return res.status(404).json({ error: "Todo not found." });
  }

  todo.completed = !todo.completed;
  await todo.save();
  res.json(todo);
});

const clientDistPath = path.join(__dirname, "..", "client", "dist");
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
