import { Database } from '../database/index.js';
import { DataTypes } from 'sequelize';
import { structures } from '../common/constants.js';
import { v4 as uuid } from 'uuid';

const Records = Database.define('records', {
    id: { type: DataTypes.UUID(), primaryKey: true },
    structure: DataTypes.ENUM(...structures),
    description: DataTypes.STRING,
    points: DataTypes.INTEGER,
    inspector: DataTypes.STRING
});

Records.beforeCreate((record) => {
    record.id = uuid();
});

export default Records;
