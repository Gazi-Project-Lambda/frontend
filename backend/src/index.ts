import express from "express";
import cors from "cors";
import authRouter from "./routes/auth";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes - /api/auth prefix
app.use("/api/auth", authRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});


