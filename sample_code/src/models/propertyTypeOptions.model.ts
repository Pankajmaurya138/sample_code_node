import * as Sequelize from 'sequelize';
import { sequelize } from './sequelize';
import { PropertyTypeOptionTranslation } from './propertyTypeOptionTranslations.model';
export class PropertyTypeOption extends Sequelize.Model {}

PropertyTypeOption.init(
    {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        slug: {
            type: new Sequelize.STRING(100),
            allowNull: false,
        },
        code: {
            type: new Sequelize.STRING(100),
            allowNull: false,
        },
        is_active: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
        },
    },

    {
        sequelize,
        tableName: 'property_type_options',
        underscored: true,
        paranoid: true,
    }
);

PropertyTypeOption.hasMany(PropertyTypeOptionTranslation);
PropertyTypeOptionTranslation.belongsTo(PropertyTypeOption);
