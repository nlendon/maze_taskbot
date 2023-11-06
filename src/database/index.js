import { Sequelize } from 'sequelize';
import 'dotenv/config';

export const Database = new Sequelize(
    'ar1stokrat_mbot',
    'ar1stokrat_mbot',
    'ytHqYuNNml19972941',
    {
        dialect: 'mysql',
        host: 'ar1stokrat.beget.tech'
    }
);
