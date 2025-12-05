import { z } from "zod";
import { isPasswordStrong } from "./password";

// E-posta format kontrolü (backend tarafında)
export const emailSchema = z
  .string()
  .min(5)
  .max(254)
  .email("Geçerli bir e-posta adresi giriniz");

export function validateEmail(email: string): string {
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message ?? "Geçersiz e-posta");
  }
  return parsed.data;
}

export function validateStrongPassword(password: string): string {
  if (!isPasswordStrong(password)) {
    throw new Error(
      "Şifre en az 8 karakter olmalı; büyük harf, küçük harf, sayı ve özel karakter içermelidir"
    );
  }
  return password;
}


