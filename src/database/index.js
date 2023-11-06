import { Sequelize } from 'sequelize';
import 'dotenv/config';

export const Database = new Sequelize(
    'ar1stokrat_mbot',
    'ar1stokrat_mbot',
    '%H1X2zj6',
    {
        dialect: 'mysql',
        host: 'ar1stokrat.beget.tech'
    }
);
