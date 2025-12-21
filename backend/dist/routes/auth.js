"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validators_1 = require("../utils/validators");
const password_1 = require("../utils/password");
const userStore_1 = require("../db/userStore");
const tokenStore_1 = require("../db/tokenStore");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// POST /api/auth/register
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // Zorunlu alan kontrolü
        if (!username || !email || !password) {
            return res
                .status(400)
                .json({ error: "Kullanıcı adı, e-posta ve şifre alanları zorunludur" });
        }
        // Username minimum uzunluk kontrolü
        if (username.length < 3) {
            return res
                .status(400)
                .json({ error: "Kullanıcı adı en az 3 karakter olmalıdır" });
        }
        // 1) E-posta format kontrolü (backend)
        const normalizedEmail = (0, validators_1.validateEmail)(email);
        // 2) Kullanıcı adı veritabanında var mı?
        const existingUsername = await (0, userStore_1.findUserByUsername)(username);
        if (existingUsername) {
            return res
                .status(409)
                .json({ error: "Bu kullanıcı adı zaten kullanılıyor" });
        }
        // 3) E-posta veritabanında var mı?
        const existingEmail = await (0, userStore_1.findUserByEmail)(normalizedEmail);
        if (existingEmail) {
            return res
                .status(409)
                .json({ error: "Bu e-posta ile kayıtlı bir kullanıcı zaten var" });
        }
        // 4) Güçlü şifre politikası (backend tarafında zorlanıyor)
        (0, validators_1.validateStrongPassword)(password);
        // 5) Şifre hashing (bcrypt)
        const passwordHash = await (0, password_1.hashPassword)(password);
        const user = await (0, userStore_1.createUser)(username, normalizedEmail, passwordHash);
        // Dönüşte şifre hash'i asla gönderme
        return res.status(201).json({
            message: "Kayıt başarılı",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            }
        });
    }
    catch (err) {
        console.error(err);
        return res.status(400).json({
            error: err instanceof Error ? err.message : "Kayıt sırasında bir hata oluştu",
        });
    }
});
// POST /api/auth/login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res
                .status(400)
                .json({ error: "E-posta ve şifre alanları zorunludur" });
        }
        // 1) E-posta format kontrolü
        const normalizedEmail = (0, validators_1.validateEmail)(email);
        // 2) E-posta veritabanında var mı? (varlık kontrolü)
        const user = await (0, userStore_1.findUserByEmail)(normalizedEmail);
        if (!user) {
            // Bilgi sızdırmamak için, genelde "e-posta veya şifre hatalı" denir.
            return res
                .status(401)
                .json({ error: "E-posta veya şifre hatalı" });
        }
        // 3) Parola doğrulama (hash karşılaştırma)
        const passwordOk = await (0, password_1.verifyPassword)(password, user.passwordHash);
        if (!passwordOk) {
            return res
                .status(401)
                .json({ error: "E-posta veya şifre hatalı" });
        }
        // 4) JWT Token'ları oluştur
        const payload = {
            userId: user.id,
            email: user.email
        };
        const authToken = (0, auth_1.generateAccessToken)(payload);
        const refreshToken = (0, auth_1.generateRefreshToken)(payload);
        // 5) Refresh token'ı kaydet (7 gün geçerlilik)
        const refreshExpiry = new Date();
        refreshExpiry.setDate(refreshExpiry.getDate() + 7);
        await (0, tokenStore_1.saveRefreshToken)(user.id, refreshToken, refreshExpiry);
        return res.status(200).json({
            message: "Giriş başarılı",
            authToken,
            refreshToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
        });
    }
    catch (err) {
        console.error(err);
        return res.status(400).json({
            error: err instanceof Error ? err.message : "Giriş sırasında bir hata oluştu",
        });
    }
});
// POST /api/auth/refresh-token
router.post("/refresh-token", async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ error: "Refresh token gerekli" });
        }
        // 1) Refresh token'ı store'da ara
        const storedToken = await (0, tokenStore_1.findRefreshToken)(refreshToken);
        if (!storedToken) {
            return res.status(401).json({ error: "Geçersiz veya süresi dolmuş refresh token" });
        }
        // 2) JWT imzasını doğrula
        let decoded;
        try {
            decoded = (0, auth_1.verifyRefreshToken)(refreshToken);
        }
        catch {
            await (0, tokenStore_1.deleteRefreshToken)(refreshToken);
            return res.status(401).json({ error: "Geçersiz refresh token" });
        }
        // 3) Kullanıcının hala var olduğunu kontrol et
        const user = await (0, userStore_1.findUserById)(decoded.userId);
        if (!user) {
            await (0, tokenStore_1.deleteRefreshToken)(refreshToken);
            return res.status(401).json({ error: "Kullanıcı bulunamadı" });
        }
        // 4) Yeni access token oluştur
        const newPayload = {
            userId: user.id,
            email: user.email
        };
        const newAuthToken = (0, auth_1.generateAccessToken)(newPayload);
        return res.status(200).json({
            message: "Token yenilendi",
            authToken: newAuthToken
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "Token yenileme sırasında bir hata oluştu"
        });
    }
});
// POST /api/auth/logout
router.post("/logout", auth_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: "Yetkisiz erişim" });
        }
        // Kullanıcının tüm refresh token'larını sil
        await (0, tokenStore_1.deleteRefreshTokensByUserId)(user.userId);
        return res.status(200).json({
            message: "Çıkış başarılı"
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "Çıkış sırasında bir hata oluştu"
        });
    }
});
exports.default = router;
