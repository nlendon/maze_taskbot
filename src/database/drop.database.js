import Commands from '../models/commands.js';
import Settings from '../models/settings.js';
import Owners from '../models/owners.js';
import Users from '../models/users.js';
import Tasks from '../models/tasks.js';
import Records from '../models/records.js';
import Grades from '../models/grades.js';

await Commands.sync();
await Settings.sync();
await Owners.sync();
await Users.sync();
await Tasks.sync({ force: true });
await Records.sync({ force: true });
await Grades.sync({ force: true });
