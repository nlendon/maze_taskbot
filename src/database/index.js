import { Sequelize } from 'sequelize';
import 'dotenv/config';

export const Database = new Sequelize(
    'ar1stokrat_test',
    'ar1stokrat_test',
    'ytHqYuNNml19972941',
    {
        dialect: 'mysql',
        host: 'ar1stokrat.beget.tech',
        port: 3306
    }
);
