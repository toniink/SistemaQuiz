import * as SQLite from 'expo-sqlite';
// Opcional: para o hash
import SHA256 from 'crypto-js/sha256';

// 1. Abrir (ou criar) o banco de dados
const db = SQLite.openDatabase('users.db');

// 2. Inicializar a tabela (executar isso na inicialização do app)
export const initDatabase = () => {
    db.transaction(tx => {
        tx.executeSql(
            `CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL
            );`
        );
    });
};

// 3. Função de Cadastro (INSERT)
export const registerUser = (username, password) => {
    const passwordHash = SHA256(password).toString(); // Hashing da senha

    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                'INSERT INTO users (username, password_hash) VALUES (?, ?)',
                [username, passwordHash],
                (_, result) => resolve(result), // Sucesso
                (_, error) => reject(error)   // Erro (ex: usuário já existe)
            );
        });
    });
};

// 4. Função de Login (SELECT)
export const loginUser = (username, password) => {
    const passwordHash = SHA256(password).toString();

    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM users WHERE username = ? AND password_hash = ?',
                [username, passwordHash],
                (_, { rows }) => {
                    if (rows.length > 0) {
                        resolve(rows._array[0]); // Usuário encontrado
                    } else {
                        reject(new Error('Usuário ou senha inválidos.')); // Não encontrado
                    }
                },
                (_, error) => reject(error) // Erro de SQL
            );
        });
    });
};