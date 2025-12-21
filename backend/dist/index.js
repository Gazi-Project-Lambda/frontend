"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./routes/auth"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes - /api/auth prefix
app.use("/api/auth", auth_1.default);
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
});
