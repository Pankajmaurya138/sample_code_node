import * as Sequelize from 'sequelize';
import { sequelize } from './sequelize';
import { PropertyTypes } from './propertyTypes.model';

export class PropertyTypesTranslation extends Sequelize.Model {
    name?: string;
    description?: string;
    locale?: string;
}

PropertyTypesTranslation.init(
    {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        property_type_id: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        name: {
            type: new Sequelize.STRING(100),
            allowNull: false,
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        locale: {
            type: new Sequelize.STRING(100),
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'property_type_translations',
        underscored: true,
    }
);

PropertyTypesTranslation.belongsTo(PropertyTypes);
PropertyTypes.hasMany(PropertyTypesTranslation);
