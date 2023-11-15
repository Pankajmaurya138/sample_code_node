import * as Sequelize from 'sequelize';
import { sequelize } from './sequelize';
import { Amenity } from './amenity.model';
export class AmenityTranslation extends Sequelize.Model {}

AmenityTranslation.init(
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
        locale: {
            type: new Sequelize.STRING(100),
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'amenity_translations',
        underscored: true,
    }
);
