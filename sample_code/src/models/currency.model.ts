import * as Sequelize from 'sequelize';
import { sequelize } from './sequelize';
export class Currency extends Sequelize.Model {}

Currency.init(
    {
        id: {
            type: Sequelize.INTEGER(),
            autoIncrement: true,
            primaryKey: true,
        },
        code: {
            type: Sequelize.STRING(50),
        },
        isActive: {
            type: Sequelize.BOOLEAN,
        },
        createdAt: {
            type: new Sequelize.DATE(),
        },
        updatedAt: {
            type: new Sequelize.DATE(),
        },
        deletedAt: {
            type: new Sequelize.DATE(),
        },
    },
    {
        sequelize,
        tableName: 'currency',
        underscored: true,
        paranoid: true,
    }
);
