import * as Sequelize from 'sequelize';
import { sequelize } from './sequelize';
export class ProjectTranslation extends Sequelize.Model {}

ProjectTranslation.init(
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
        tableName: 'project_translations',
        underscored: true,
    }
);
