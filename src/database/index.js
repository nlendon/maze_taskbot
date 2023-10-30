import { Sequelize } from 'sequelize';
import 'dotenv/config';

export const Database = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        dialect: 'mysql',
        host: process.env.DB_HOST
    }
);
