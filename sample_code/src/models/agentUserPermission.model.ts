import * as Sequelize from 'sequelize';
import { AgentPermission } from './agentPermission.model';
import { sequelize } from './sequelize';

export class AgentUserPermission extends Sequelize.Model {}

AgentUserPermission.init(
    {},
    {
        sequelize,
        tableName: 'agent_user_permissions',
        underscored: true,
        timestamps: false,
    }
);

AgentUserPermission.belongsTo(AgentPermission);
