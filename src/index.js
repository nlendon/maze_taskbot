import { Database } from './database/index.js';
import 'dotenv/config';
import './triggers/index.js';

const Main = async () => {
    await Database.authenticate();
    await Database.sync({ force: false });
};

Main();
