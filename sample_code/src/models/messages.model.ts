import * as Sequelize from 'sequelize';
import { MessageEntityTypes } from '../util/enums';
import { InternalTeamReview } from './internalTeamReviews.model';
import { Property } from './property.model';
import { sequelize } from './sequelize';

export class Message extends Sequelize.Model {
    public id!: number;
    public enityType!: string;
    public enityId!: number;
    public message!: string;
    public createdAt!: Date;
    public updatedAt!: Date;
}

Message.init(
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        entityId: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        message: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        entityType: {
            type: Sequelize.ENUM(MessageEntityTypes.INTERNAL_TEAM_REVIEWS),
            allowNull: true,
        },
        createdAt: {
            type: Sequelize.DATE,
            field: 'created_at',
            allowNull: false,
        },
        updatedAt: {
            type: Sequelize.DATE,
            field: 'updated_at',
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'messages',
        underscored: true,
        paranoid: false,
    }
);

InternalTeamReview.hasOne(Message, {
    as: 'message',
    foreignKey: 'entity_id',
});
Message.belongsTo(Property, {
    as: 'review',
    foreignKey: 'entity_id',
});
