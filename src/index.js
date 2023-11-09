import { Database } from './database/index.js';
import 'dotenv/config';
import './triggers/index.js';
import moment from 'moment-timezone';

const Main = async () => {
    await Database.authenticate();
    await Database.sync({ force: false });
    moment.tz.setDefault('Europe/Moscow');
};

Main();
