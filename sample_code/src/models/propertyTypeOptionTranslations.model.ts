import * as Sequelize from 'sequelize';
import { sequelize } from './sequelize';

export class PropertyTypeOptionTranslation extends Sequelize.Model {}

PropertyTypeOptionTranslation.init(
    {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
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
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'property_type_option_translations',
        underscored: true,
    }
);
