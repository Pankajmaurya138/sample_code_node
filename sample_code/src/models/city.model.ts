import * as Sequelize from 'sequelize';
import { sequelize } from './sequelize';
import { CityTranslation } from './cityTranslations.model';
import { Country } from './country.model';

export class City extends Sequelize.Model {
    country_id: any;
    state_id: any;
}

City.init(
    {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        country_id: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
        state_id: {
            type: Sequelize.BIGINT,
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
    },

    {
        sequelize,
        tableName: 'cities',
        underscored: true,
        paranoid: true,
    }
);

City.hasMany(CityTranslation);
CityTranslation.belongsTo(City);
City.belongsTo(Country);
