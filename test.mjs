
import dotenv from 'dotenv';
import fs from 'fs';
try {
    const rawContent = fs.readFileSync('.env');
    console.log('--- Đọc file .env (dạng thô) ---');
    console.log(rawContent);
    console.log('--- Kết thúc đọc thô ---');
} catch (e) {
    console.log('Không thể đọc file .env:', e.message);
}
dotenv.config();
console.log('--- Thư viện dotenv đọc ---');
console.log('Biến DATABASE_URL là:', process.env.DATABASE_URL);
console.log('--- Kết thúc ---');