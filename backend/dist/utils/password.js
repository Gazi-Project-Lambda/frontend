"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strongPasswordRegex = void 0;
exports.isPasswordStrong = isPasswordStrong;
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
const bcrypt_1 = __importDefault(require("bcrypt"));
const SALT_ROUNDS = 12;
// Güçlü şifre politikası: min 8, büyük, küçük, sayı, özel karakter
exports.strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;
function isPasswordStrong(password) {
    return exports.strongPasswordRegex.test(password);
}
async function hashPassword(plain) {
    return bcrypt_1.default.hash(plain, SALT_ROUNDS);
}
async function verifyPassword(plain, hash) {
    return bcrypt_1.default.compare(plain, hash);
}
