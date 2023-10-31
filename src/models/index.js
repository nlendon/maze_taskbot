import Commands from './commands.js';
import Settings from './settings.js';
import Owners from './owners.js';
import Users from './users.js';

await Commands.sync();
await Settings.sync();
await Owners.sync();
await Users.sync();
