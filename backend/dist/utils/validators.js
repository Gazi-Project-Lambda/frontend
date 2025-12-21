"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailSchema = void 0;
exports.validateEmail = validateEmail;
exports.validateStrongPassword = validateStrongPassword;
const zod_1 = require("zod");
const password_1 = require("./password");
// E-posta format kontrolü (backend tarafında)
exports.emailSchema = zod_1.z
    .string()
    .min(5)
    .max(254)
    .email("Geçerli bir e-posta adresi giriniz");
function validateEmail(email) {
    const parsed = exports.emailSchema.safeParse(email);
    if (!parsed.success) {
        throw new Error(parsed.error.errors[0]?.message ?? "Geçersiz e-posta");
    }
    return parsed.data;
}
function validateStrongPassword(password) {
    if (!(0, password_1.isPasswordStrong)(password)) {
        throw new Error("Şifre en az 8 karakter olmalı; büyük harf, küçük harf, sayı ve özel karakter içermelidir");
    }
    return password;
}
