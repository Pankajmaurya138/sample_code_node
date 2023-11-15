import * as Sequelize from 'sequelize';
import { sequelize } from './sequelize';

export class Notification extends Sequelize.Model {}

Notification.init(
    {
        type: {
            type: new Sequelize.STRING(100),
            allowNull: false,
        },
        data: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        read_at: {
            type: Sequelize.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'notifications',
        underscored: true,
        paranoid: true,
    }
);

export const addNotification = async (data: any) => {
    var returnData = false;
    try {
        // inser data in notification table.
        returnData = true;
    } catch (e) {
        // Generate log
    }
    return returnData;
};
