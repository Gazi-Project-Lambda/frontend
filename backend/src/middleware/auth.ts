import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// JWT Secret Keys - Gerçek projede .env dosyasından alınmalı
export const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your-super-secret-refresh-key-change-in-production";

// Token süreleri
export const ACCESS_TOKEN_EXPIRY = "15m"; // 15 dakika
export const REFRESH_TOKEN_EXPIRY = "7d"; // 7 gün

export interface JwtPayload {
  userId: number;
  email: string;
}

// Request interface'ine user property'si ekle
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Access token oluştur
export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

// Refresh token oluştur
export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

// Access token doğrula
export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

// Refresh token doğrula
export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
}

// Auth middleware - korunan route'lar için
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: "Erişim token'ı gerekli" });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: "Token süresi dolmuş", code: "TOKEN_EXPIRED" });
    }
    return res.status(403).json({ error: "Geçersiz token" });
  }
}

