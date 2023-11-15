import * as Sequelize from 'sequelize';
import { sequelize } from './sequelize';
export class PropertyTypePropertyTypeOption extends Sequelize.Model {}

PropertyTypePropertyTypeOption.init(
    {
        property_type_option_id: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        property_type_id: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'property_type_property_type_option',
        underscored: true,
        timestamps: false,
    }
);
PropertyTypePropertyTypeOption.removeAttribute('id');
