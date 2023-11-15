import * as Sequelize from 'sequelize';
import logger from '../util/logger';
import { sequelize } from './sequelize';
import { User } from './user.model';
export class StaffPermission extends Sequelize.Model {
    public id!: number;
    public userId!: number;
    public permission!: string;
    public value!: string;
    public createdAt!: string;
    public updatedAt!: string;
}

StaffPermission.init(
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
        permission: {
            type: new Sequelize.STRING(100),
            allowNull: true,
        },
        value: {
            type: new Sequelize.STRING(10),
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'staff_permissions',
        underscored: true,
    }
);

StaffPermission.belongsTo(User);

export const savePropertyPermissionData = async (reqData: any) => {
    try {
        let saveData;
        await StaffPermission.destroy({ where: { userId: reqData.userId } });
        reqData.staff_permission.map(async (staffPermissionData: any) => {
            saveData = {
                userId: reqData.userId,
                permission: staffPermissionData.permission,
                value: staffPermissionData.value
                    ? staffPermissionData.value.length == 2
                        ? 3
                        : staffPermissionData.value[0]
                    : undefined,
            };
            await StaffPermission.create(saveData);
        });
        return true;
    } catch (err) {
        logger.error(
            `StaffPermissionModel::savePropertyPermissionData : ${err.message}`
        );
        throw err;
    }
};

export const getPropertyPermissionUserId = async (reqData: any) => {
    try {
        const staffPermissionData = await StaffPermission.findAll({
            where: { userId: reqData.userId },
        });
        return staffPermissionData;
    } catch (err) {
        logger.error(
            `StaffPermissionModel::savePropertyPermissionData : ${err.message}`
        );
        throw err;
    }
};
