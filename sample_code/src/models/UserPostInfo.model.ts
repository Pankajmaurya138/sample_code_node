import * as Sequelize from 'sequelize';
import { sequelize } from './sequelize';

export class UserPostInfo extends Sequelize.Model {}
UserPostInfo.init(
    {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: Sequelize.BIGINT,
        },
        identityNumber: {
            type: Sequelize.DataTypes.ENUM('3', '1'),
        },
        number: {
            type: Sequelize.BIGINT,
        },
        adNumber: {
            type: Sequelize.BIGINT,
        },
        capacity: {
            type: Sequelize.DataTypes.ENUM(
                'individual_broker',
                'individual_developer',
                'company_broker',
                'company_developer'
            ),
            allowNull: false,
        },
        isVerified: {
            type: Sequelize.BOOLEAN,
        },
    },

    {
        sequelize,
        tableName: 'user_post_info',
        underscored: true,
        paranoid: false,
    }
);
