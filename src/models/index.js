import Commands from './commands.js';
import Settings from './settings.js';
import Owners from './owners.js';
import Users from './users.js';
import Tasks from './tasks.js';
import Records from './records.js';
import Grades from './grades.js';

await Commands.sync();
await Settings.sync();
await Owners.sync();
await Users.sync();
await Tasks.sync();
await Records.sync();
await Grades.sync();
