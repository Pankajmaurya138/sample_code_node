import * as Sequelize from 'sequelize';
import { sequelize } from './sequelize';
import { Property } from './property.model';
import { PropertyAttribute } from './propertyAttribute.model';
export class PropertyTranslation extends Sequelize.Model {
    public id!: number;
    public title!: string[];
    public keywords!: Text[];
    public address!: string[];
    public description!: Text[];
    public locale!: string[];
}

PropertyTranslation.init(
    {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        propertyId: {
            type: Sequelize.BIGINT,
            allowNull: false,
        },
        title: {
            type: new Sequelize.STRING(100),
            allowNull: true,
        },
        keywords: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        address: {
            type: Sequelize.STRING(100),
            allowNull: true,
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true,
        },

        locale: {
            type: new Sequelize.STRING(100),
            allowNull: false,
        },
        slug: {
            type: new Sequelize.STRING(255),
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'property_translations',
        underscored: true,
    }
);
