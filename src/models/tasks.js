import { Database } from '../database/index.js';
import { DataTypes } from 'sequelize';
import { priorities } from '../common/constants.js';

const Tasks = Database.define('tasks', {
    id: { type: DataTypes.UUID(), primaryKey: true },
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    appointer: DataTypes.STRING,
    performer: DataTypes.STRING,
    priority: DataTypes.ENUM(...priorities),
    estimation_time: DataTypes.STRING,
    deadline: DataTypes.DATE,
    points: DataTypes.INTEGER,
    is_done: { type: DataTypes.BOOLEAN, defaultValue: false },
    cancelable: { type: DataTypes.BOOLEAN(), defaultValue: false }
});

export default Tasks;
