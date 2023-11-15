import * as Sequelize from 'sequelize';
import { InternalReviewEntityTypes } from '../util/enums';
import { Property } from './property.model';
import { sequelize } from './sequelize';
import { TypeMaster } from './typeMaster.model';

export class InternalTeamReview extends Sequelize.Model {
    public id!: number;
    public reviewerId!: number;
    public reviewerRoleId!: number;
    public resolverId!: number;
    public enityType!: string;
    public enityId!: number;
    public resolverRoleId!: number;
    public stagesMeta!: JSON;
    public statusId!: number;
    public reassignedAt!: Date;
    public createdAt!: Date;
    public updatedAt!: Date;
}

InternalTeamReview.init(
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        reviewerId: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        resolverRoleId: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        resolverId: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        entityId: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        entityType: {
            type: Sequelize.ENUM(InternalReviewEntityTypes.PROPERTY),
            allowNull: true,
        },
        reviewerRoleId: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        stagesMeta: {
            type: Sequelize.JSON,
            allowNull: true,
        },
        statusId: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        reassignedAt: {
            type: Sequelize.DATE,
            field: 'reassigned_at',
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
        tableName: 'internal_team_reviews',
        underscored: true,
        paranoid: false,
    }
);

Property.hasMany(InternalTeamReview, {
    as: 'reviews',
    foreignKey: 'entity_id',
});
InternalTeamReview.belongsTo(Property, {
    as: 'property',
    foreignKey: 'entity_id',
});
InternalTeamReview.belongsTo(TypeMaster, {
    foreignKey: 'statusId',
});
