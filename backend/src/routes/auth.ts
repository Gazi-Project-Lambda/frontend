import express, { Request, Response } from "express";
import { validateEmail, validateStrongPassword } from "../utils/validators";
import { hashPassword, verifyPassword } from "../utils/password";
import { createUser, findUserByEmail } from "../db/userStore";

const router = express.Router();

// POST /auth/register
router.post("/register", async (req: Request, res: Response) => {
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

    // 1) E-posta format kontrolü (backend)
    const normalizedEmail = validateEmail(email);

    // 2) E-posta veritabanında var mı?
    const existing = await findUserByEmail(normalizedEmail);
    if (existing) {
      return res
        .status(409)
        .json({ error: "Bu e-posta ile kayıtlı bir kullanıcı zaten var" });
    }

    // 3) Güçlü şifre politikası (backend tarafında zorlanıyor)
    validateStrongPassword(password);

    // 4) Şifre hashing (bcrypt)
    const passwordHash = await hashPassword(password);

    const user = await createUser(normalizedEmail, passwordHash);

    // Dönüşte şifre hash'i asla gönderme
    return res.status(201).json({
      id: user.id,
      email: user.email,
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({
      error:
        err instanceof Error ? err.message : "Kayıt sırasında bir hata oluştu",
    });
  }
});

// POST /auth/login
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

    // Burada JWT veya session üretilebilir (şimdilik sadece success mesajı).
    return res.status(200).json({
      message: "Giriş başarılı",
      user: {
        id: user.id,
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

export default router;


