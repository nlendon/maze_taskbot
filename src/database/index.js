import { Sequelize } from 'sequelize';
import 'dotenv/config';

export const Database = new Sequelize(
    'ar1stokrat_mbot',
    'ar1stokrat_mbot',
    'F9T*g6ly',
    {
        dialect: 'mysql',
        host: 'localhost'
    }
);
