import * as Sequelize from 'sequelize';
import { sequelize } from './sequelize';

export class ListingAgentUsers extends Sequelize.Model {
    public id!: number;
    public sellerId!: number;
    public userId!: number;
    public hasOnboarded!: boolean;
    public createdAt!: Date;
    public updatedAt!: Date;
}

ListingAgentUsers.init(
    {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        sellerId: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        userId: {
            type: new Sequelize.BIGINT(),
            allowNull: false,
        },
        hasOnboarded: {
            type: Sequelize.BIGINT,
            defaultValue: true,
        },
    },

    {
        sequelize,
        tableName: 'listing_agent_users',
        underscored: true,
        paranoid: false,
    }
);
