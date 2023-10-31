import { Database } from '../database/index.js';
import { DataTypes } from 'sequelize';
import { v4 as uuid } from 'uuid';

const Commands = Database.define('commands', {
    id: { type: DataTypes.UUID(), primaryKey: true },
    command_name: DataTypes.STRING,
    description: DataTypes.STRING,
    access: DataTypes.STRING,
    dialog_id: DataTypes.STRING
});

Commands.beforeCreate((command) => {
    command.id = uuid();
});

export default Commands;
