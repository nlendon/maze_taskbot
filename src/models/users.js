import { Database } from '../database/index.js';
import { DataTypes } from 'sequelize';
import { roles } from '../common/constants.js';
import { v4 as uuid } from 'uuid';

const Users = Database.define('users', {
    id: { type: DataTypes.UUID, primaryKey: true },
    full_name: DataTypes.STRING,
    vk_id: DataTypes.STRING,
    role: DataTypes.ENUM(...roles),
    nick_name: DataTypes.STRING,
    points: DataTypes.INTEGER,
    warns: DataTypes.STRING,
    is_active: DataTypes.BOOLEAN
});

Users.beforeCreate((user) => {
    user.id = uuid();
});

export default Users;
