import { Database } from '../database/index.js';
import { DataTypes } from 'sequelize';
import { v4 as uuid } from 'uuid';

const Owners = Database.define('owners', {
    id: { type: DataTypes.UUID, primaryKey: true },
    full_name: DataTypes.STRING,
    vk_id: DataTypes.STRING,
    is_super: DataTypes.BOOLEAN
});

Owners.beforeCreate((owner) => {
    owner.id = uuid();
});

export default Owners;
