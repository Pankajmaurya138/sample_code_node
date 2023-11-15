import * as Sequelize from 'sequelize';
import { sequelize } from './sequelize';
import { AmenityTranslation } from './amenityTranslations.model';
export class Amenity extends Sequelize.Model {}

Amenity.init(
    {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        icon: {
            type: new Sequelize.STRING(100),
            allowNull: true,
        },
        slug: {
            type: new Sequelize.STRING(100),
            allowNull: false,
        },
        is_active: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
        },
        amenity_type_id: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        property_main_type_id: {
            type: new Sequelize.INTEGER(),
        },
    },

    {
        sequelize,
        tableName: 'amenities',
        underscored: true,
        paranoid: true,
    }
);

Amenity.hasMany(AmenityTranslation);
AmenityTranslation.belongsTo(Amenity);
