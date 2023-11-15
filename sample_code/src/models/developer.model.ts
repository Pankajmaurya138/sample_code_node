import * as Sequelize from 'sequelize';
import { sequelize } from './sequelize';
import { DeveloperTranslation } from './developerTranslation.model';
import logger from '../util/logger';
export class Developer extends Sequelize.Model {}

Developer.init(
    {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        email: {
            type: new Sequelize.STRING(100),
            allowNull: true,
        },
        logo: {
            type: new Sequelize.STRING(100),
            allowNull: true,
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: 'developers',
        underscored: true,
        paranoid: true,
    }
);

Developer.hasMany(DeveloperTranslation);

DeveloperTranslation.belongsTo(Developer);
