import * as Sequelize from 'sequelize';
import { sequelize } from './sequelize';
export class DeveloperTranslation extends Sequelize.Model {}

DeveloperTranslation.init(
    {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: new Sequelize.STRING(100),
            allowNull: false,
        },
        locale: {
            type: new Sequelize.STRING(100),
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'developer_translations',
        underscored: true,
    }
);
