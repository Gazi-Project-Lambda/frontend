// In-memory refresh token store
// Gerçek projede burası yerine Redis veya veritabanı kullanılmalıdır.

interface StoredToken {
  userId: number;
  token: string;
  expiresAt: Date;
}

const refreshTokens: StoredToken[] = [];

export async function saveRefreshToken(userId: number, token: string, expiresAt: Date): Promise<void> {
  // Aynı kullanıcının eski token'larını temizle (opsiyonel - tek cihaz politikası)
  const index = refreshTokens.findIndex((t) => t.userId === userId);
  if (index !== -1) {
    refreshTokens.splice(index, 1);
  }
  refreshTokens.push({ userId, token, expiresAt });
}

export async function findRefreshToken(token: string): Promise<StoredToken | undefined> {
  return refreshTokens.find((t) => t.token === token && t.expiresAt > new Date());
}

export async function deleteRefreshToken(token: string): Promise<boolean> {
  const index = refreshTokens.findIndex((t) => t.token === token);
  if (index !== -1) {
    refreshTokens.splice(index, 1);
    return true;
  }
  return false;
}

export async function deleteRefreshTokensByUserId(userId: number): Promise<void> {
  const tokensToRemove = refreshTokens.filter((t) => t.userId === userId);
  tokensToRemove.forEach((t) => {
    const index = refreshTokens.indexOf(t);
    if (index !== -1) {
      refreshTokens.splice(index, 1);
    }
  });
}

