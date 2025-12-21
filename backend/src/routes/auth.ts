import express, { Request, Response } from "express";
import { validateEmail, validateStrongPassword } from "../utils/validators";
import { hashPassword, verifyPassword } from "../utils/password";
import { createUser, findUserByEmail, findUserById, findUserByUsername } from "../db/userStore";
import { saveRefreshToken, findRefreshToken, deleteRefreshToken, deleteRefreshTokensByUserId } from "../db/tokenStore";
import { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyRefreshToken, 
  authenticateToken,
  JwtPayload
} from "../middleware/auth";

const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body as {
      username?: string;
      email?: string;
      password?: string;
    };

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
    const normalizedEmail = validateEmail(email);

    // 2) Kullanıcı adı veritabanında var mı?
    const existingUsername = await findUserByUsername(username);
    if (existingUsername) {
      return res
        .status(409)
        .json({ error: "Bu kullanıcı adı zaten kullanılıyor" });
    }

    // 3) E-posta veritabanında var mı?
    const existingEmail = await findUserByEmail(normalizedEmail);
    if (existingEmail) {
      return res
        .status(409)
        .json({ error: "Bu e-posta ile kayıtlı bir kullanıcı zaten var" });
    }

    // 4) Güçlü şifre politikası (backend tarafında zorlanıyor)
    validateStrongPassword(password);

    // 5) Şifre hashing (bcrypt)
    const passwordHash = await hashPassword(password);

    const user = await createUser(username, normalizedEmail, passwordHash);

    // Dönüşte şifre hash'i asla gönderme
    return res.status(201).json({
      message: "Kayıt başarılı",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({
      error:
        err instanceof Error ? err.message : "Kayıt sırasında bir hata oluştu",
    });
  }
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "E-posta ve şifre alanları zorunludur" });
    }

    // 1) E-posta format kontrolü
    const normalizedEmail = validateEmail(email);

    // 2) E-posta veritabanında var mı? (varlık kontrolü)
    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      // Bilgi sızdırmamak için, genelde "e-posta veya şifre hatalı" denir.
      return res
        .status(401)
        .json({ error: "E-posta veya şifre hatalı" });
    }

    // 3) Parola doğrulama (hash karşılaştırma)
    const passwordOk = await verifyPassword(password, user.passwordHash);
    if (!passwordOk) {
      return res
        .status(401)
        .json({ error: "E-posta veya şifre hatalı" });
    }

    // 4) JWT Token'ları oluştur
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email
    };

    const authToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // 5) Refresh token'ı kaydet (7 gün geçerlilik)
    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + 7);
    await saveRefreshToken(user.id, refreshToken, refreshExpiry);

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
  } catch (err) {
    console.error(err);
    return res.status(400).json({
      error:
        err instanceof Error ? err.message : "Giriş sırasında bir hata oluştu",
    });
  }
});

// POST /api/auth/refresh-token
router.post("/refresh-token", async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token gerekli" });
    }

    // 1) Refresh token'ı store'da ara
    const storedToken = await findRefreshToken(refreshToken);
    if (!storedToken) {
      return res.status(401).json({ error: "Geçersiz veya süresi dolmuş refresh token" });
    }

    // 2) JWT imzasını doğrula
    let decoded: JwtPayload;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      await deleteRefreshToken(refreshToken);
      return res.status(401).json({ error: "Geçersiz refresh token" });
    }

    // 3) Kullanıcının hala var olduğunu kontrol et
    const user = await findUserById(decoded.userId);
    if (!user) {
      await deleteRefreshToken(refreshToken);
      return res.status(401).json({ error: "Kullanıcı bulunamadı" });
    }

    // 4) Yeni access token oluştur
    const newPayload: JwtPayload = {
      userId: user.id,
      email: user.email
    };
    const newAuthToken = generateAccessToken(newPayload);

    return res.status(200).json({
      message: "Token yenilendi",
      authToken: newAuthToken
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Token yenileme sırasında bir hata oluştu"
    });
  }
});

// POST /api/auth/logout
router.post("/logout", authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: "Yetkisiz erişim" });
    }

    // Kullanıcının tüm refresh token'larını sil
    await deleteRefreshTokensByUserId(user.userId);

    return res.status(200).json({
      message: "Çıkış başarılı"
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Çıkış sırasında bir hata oluştu"
    });
  }
});

export default router;
