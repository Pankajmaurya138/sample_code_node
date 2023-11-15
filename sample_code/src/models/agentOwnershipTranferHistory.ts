import * as Sequelize from 'sequelize';
import { sequelize } from './sequelize';

export class AgentOwnershipTranferHistory extends Sequelize.Model {
    public id!: number;
    public propertyId!: number;
    public addedByUserId!: number;
    public transferToUserId!: number;
    public createdAt!: string;
    public updatedAt!: string;
}

AgentOwnershipTranferHistory.init(
    {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        propertyId: {
            type: new Sequelize.BIGINT(),
            allowNull: true,
        },
        addedByUserId: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        transferToUserId: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'agent_ownership_tranfer_history',
        underscored: true,
        paranoid: true,
    }
);
