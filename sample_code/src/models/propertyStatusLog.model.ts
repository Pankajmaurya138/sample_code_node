import * as Sequelize from 'sequelize';
import { sequelize } from './sequelize';
import { TypeMaster } from './typeMaster.model';

export class PropertyStatusLog extends Sequelize.Model {}

PropertyStatusLog.init(
    {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        status_type_id: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        reason: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
        },
        property_id: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        user_id: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'property_status_logs',
        underscored: true,
        paranoid: false,
    }
);
PropertyStatusLog.belongsTo(TypeMaster, {
    foreignKey: 'status_type_id',
    as: 'propertyStatus',
});
