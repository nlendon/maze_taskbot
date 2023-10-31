import { Database } from '../database/index.js';
import { DataTypes } from 'sequelize';
import { v4 as uuid } from 'uuid';

const Settings = Database.define('settings', {
    id: { type: DataTypes.UUID(), primaryKey: true },
    name: DataTypes.STRING,
    value: DataTypes.BOOLEAN,
    dialog_id: DataTypes.STRING
});

Settings.beforeCreate((setting) => {
    setting.id = uuid();
});

export default Settings;
