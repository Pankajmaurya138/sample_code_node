import * as Sequelize from 'sequelize';
import { sequelize } from './sequelize';

export class Realestate_token extends Sequelize.Model {}

Realestate_token.init(
    {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        username: {
            type: Sequelize.STRING(100),
        },
        token: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
        validityDate: {
            type: Sequelize.DATE,
            field: 'validity_date',
            allowNull: false,
        },

        createdAt: {
            type: Sequelize.DATE,
            field: 'created_at',
            allowNull: false,
        },
        updatedAt: {
            type: Sequelize.DATE,
            field: 'updated_at',
            allowNull: true,
        },
        deletedAt: {
            type: Sequelize.DATE,
            field: 'deleted_at',
            allowNull: true,
        },
    },

    {
        sequelize,
        tableName: 'realestate_token',
        underscored: true,
        paranoid: false,
    }
);
