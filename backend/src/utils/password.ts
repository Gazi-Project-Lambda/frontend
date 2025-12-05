import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

// Güçlü şifre politikası: min 8, büyük, küçük, sayı, özel karakter
export const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;

export function isPasswordStrong(password: string): boolean {
  return strongPasswordRegex.test(password);
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}


