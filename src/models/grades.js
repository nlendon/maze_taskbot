import { Database } from '../database/index.js';
import { DataTypes } from 'sequelize';
import { structures } from '../common/constants.js';

const Grades = Database.define('grades', {
    id: { type: DataTypes.UUID, primaryKey: true },
    structure: DataTypes.ENUM(...structures),
    conclusion: DataTypes.STRING,
    points: DataTypes.INTEGER,
    inspector: DataTypes.STRING
});

export default Grades;
