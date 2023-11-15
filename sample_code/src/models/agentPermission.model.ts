import * as Sequelize from 'sequelize';
import { AgentPermissionTranslation } from './agentPermissionTranslation.model';
import { sequelize } from './sequelize';
import { TypeMaster } from './typeMaster.model';

export class AgentPermission extends Sequelize.Model {
    public id!: number;
    public permissionTypeId!: number;
    public slug!: string;
    public isActive!: boolean;
    public createdAt!: string;
    public updatedAt!: string;
}

AgentPermission.init(
    {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        permissionTypeId: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        slug: {
            type: Sequelize.STRING(100),
            allowNull: true,
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'agent_permissions',
        underscored: true,
        paranoid: true,
    }
);

AgentPermission.belongsTo(TypeMaster, {
    as: 'permissionType',
    foreignKey: 'permissionTypeId',
});
AgentPermission.hasMany(AgentPermissionTranslation);
AgentPermissionTranslation.belongsTo(AgentPermission);
