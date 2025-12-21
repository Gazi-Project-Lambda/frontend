"use strict";
// Basit in-memory user store.
// Gerçek projede burası yerine bir veritabanı (PostgreSQL, MySQL, MongoDB vb.)
// ve bir ORM/Query katmanı (Prisma, TypeORM vb.) kullanılmalıdır.
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserByEmail = findUserByEmail;
exports.findUserById = findUserById;
exports.findUserByUsername = findUserByUsername;
exports.createUser = createUser;
const users = [];
let nextId = 1;
async function findUserByEmail(email) {
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}
async function findUserById(id) {
    return users.find((u) => u.id === id);
}
async function findUserByUsername(username) {
    return users.find((u) => u.username.toLowerCase() === username.toLowerCase());
}
async function createUser(username, email, passwordHash) {
    const user = { id: nextId++, username, email, passwordHash };
    users.push(user);
    return user;
}
