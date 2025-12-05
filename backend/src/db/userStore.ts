// Basit in-memory user store.
// Gerçek projede burası yerine bir veritabanı (PostgreSQL, MySQL, MongoDB vb.)
// ve bir ORM/Query katmanı (Prisma, TypeORM vb.) kullanılmalıdır.

export interface User {
  id: number;
  email: string;
  passwordHash: string;
}

const users: User[] = [];
let nextId = 1;

export async function findUserByEmail(email: string): Promise<User | undefined> {
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export async function createUser(email: string, passwordHash: string): Promise<User> {
  const user: User = { id: nextId++, email, passwordHash };
  users.push(user);
  return user;
}


