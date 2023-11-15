import * as Sequelize from 'sequelize';
import { sequelize } from './sequelize';

export class TitleRules extends Sequelize.Model {}
TitleRules.init(
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        listingTypeId: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        entityTypeId: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        attributeName: {
            type: Sequelize.STRING(50),
            allowNull: true,
        },
        weightage: {
            type: Sequelize.INTEGER,
        },
    },
    {
        sequelize,
        tableName: 'title_rules',
        underscored: true,
        paranoid: true,
        timestamps: false,
    }
);
