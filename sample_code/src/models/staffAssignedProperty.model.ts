import * as Sequelize from 'sequelize';
import logger from '../util/logger';
import { sequelize } from './sequelize';

export class StaffAssignedProperty extends Sequelize.Model {
    public id!: number;
    public userId!: number;
    public propertyId!: number;
    public createdAt!: string;
    public updatedAt!: string;
}

StaffAssignedProperty.init(
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
        propertyId: {
            type: new Sequelize.BIGINT(),
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'staff_assigned_properties',
        underscored: true,
    }
);

export const saveAssignProperty = async (reqData: any) => {
    try {
        await StaffAssignedProperty.destroy({
            where: { propertyId: reqData.propertyId },
        });
        await StaffAssignedProperty.create(reqData);
        return true;
    } catch (err) {
        logger.error(
            `StaffPermissionModel::savePropertyPermissionData : ${err.message}`
        );
        throw err;
    }
};
