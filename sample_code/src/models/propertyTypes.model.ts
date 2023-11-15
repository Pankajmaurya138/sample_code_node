import * as Sequelize from 'sequelize';
import { sequelize } from './sequelize';
export class PropertyTypes extends Sequelize.Model {
    public id!: number;
    public parent_id!: number;
    public slug!: string;
    public code!: string;
    public isActive!: boolean;
}

PropertyTypes.init(
    {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        parent_id: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        slug: {
            type: new Sequelize.STRING(100),
            allowNull: false,
        },
        code: {
            type: new Sequelize.STRING(100),
            allowNull: true,
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
        },
        meta: {
            type: Sequelize.JSON,
            allowNull: true,
        },
    },

    {
        sequelize,
        tableName: 'property_types',
        underscored: true,
        paranoid: true,
    }
);
