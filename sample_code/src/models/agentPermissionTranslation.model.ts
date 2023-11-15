import * as Sequelize from 'sequelize';
import { sequelize } from './sequelize';
import { TypeMaster } from './typeMaster.model';

export class AgentPermissionTranslation extends Sequelize.Model {
    public id!: number;
    public AgentPermissionId!: number;
    public name!: string;
    public locale!: string;
    public createdAt!: string;
    public updatedAt!: string;
}

AgentPermissionTranslation.init(
    {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: Sequelize.STRING(100),
            allowNull: true,
        },
        locale: {
            type: Sequelize.STRING(100),
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'agent_permission_translations',
        underscored: true,
    }
);
