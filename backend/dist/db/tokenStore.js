"use strict";
// In-memory refresh token store
// Gerçek projede burası yerine Redis veya veritabanı kullanılmalıdır.
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveRefreshToken = saveRefreshToken;
exports.findRefreshToken = findRefreshToken;
exports.deleteRefreshToken = deleteRefreshToken;
exports.deleteRefreshTokensByUserId = deleteRefreshTokensByUserId;
const refreshTokens = [];
async function saveRefreshToken(userId, token, expiresAt) {
    // Aynı kullanıcının eski token'larını temizle (opsiyonel - tek cihaz politikası)
    const index = refreshTokens.findIndex((t) => t.userId === userId);
    if (index !== -1) {
        refreshTokens.splice(index, 1);
    }
    refreshTokens.push({ userId, token, expiresAt });
}
async function findRefreshToken(token) {
    return refreshTokens.find((t) => t.token === token && t.expiresAt > new Date());
}
async function deleteRefreshToken(token) {
    const index = refreshTokens.findIndex((t) => t.token === token);
    if (index !== -1) {
        refreshTokens.splice(index, 1);
        return true;
    }
    return false;
}
async function deleteRefreshTokensByUserId(userId) {
    const tokensToRemove = refreshTokens.filter((t) => t.userId === userId);
    tokensToRemove.forEach((t) => {
        const index = refreshTokens.indexOf(t);
        if (index !== -1) {
            refreshTokens.splice(index, 1);
        }
    });
}
