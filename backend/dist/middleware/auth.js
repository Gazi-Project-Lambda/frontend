"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.REFRESH_TOKEN_EXPIRY = exports.ACCESS_TOKEN_EXPIRY = exports.JWT_REFRESH_SECRET = exports.JWT_SECRET = void 0;
exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;
exports.authenticateToken = authenticateToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// JWT Secret Keys - Gerçek projede .env dosyasından alınmalı
exports.JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
exports.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your-super-secret-refresh-key-change-in-production";
// Token süreleri
exports.ACCESS_TOKEN_EXPIRY = "15m"; // 15 dakika
exports.REFRESH_TOKEN_EXPIRY = "7d"; // 7 gün
// Access token oluştur
function generateAccessToken(payload) {
    return jsonwebtoken_1.default.sign(payload, exports.JWT_SECRET, { expiresIn: exports.ACCESS_TOKEN_EXPIRY });
}
// Refresh token oluştur
function generateRefreshToken(payload) {
    return jsonwebtoken_1.default.sign(payload, exports.JWT_REFRESH_SECRET, { expiresIn: exports.REFRESH_TOKEN_EXPIRY });
}
// Access token doğrula
function verifyAccessToken(token) {
    return jsonwebtoken_1.default.verify(token, exports.JWT_SECRET);
}
// Refresh token doğrula
function verifyRefreshToken(token) {
    return jsonwebtoken_1.default.verify(token, exports.JWT_REFRESH_SECRET);
}
// Auth middleware - korunan route'lar için
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // "Bearer TOKEN"
    if (!token) {
        return res.status(401).json({ error: "Erişim token'ı gerekli" });
    }
    try {
        const decoded = verifyAccessToken(token);
        req.user = decoded;
        next();
    }
    catch (err) {
        if (err instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(401).json({ error: "Token süresi dolmuş", code: "TOKEN_EXPIRED" });
        }
        return res.status(403).json({ error: "Geçersiz token" });
    }
}
