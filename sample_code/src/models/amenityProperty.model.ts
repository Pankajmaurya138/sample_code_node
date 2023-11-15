import * as Sequelize from 'sequelize';
import { Amenity } from './amenity.model';
import { sequelize } from './sequelize';

export class AmenityProperty extends Sequelize.Model {}

AmenityProperty.init(
    {
        amenityId: {
            type: new Sequelize.INTEGER(),
        },
        propertyId: {
            type: new Sequelize.INTEGER(),
        },
    },
    {
        sequelize,
        tableName: 'amenity_property',
        underscored: true,
        timestamps: false,
    }
);
