import * as Sequelize from 'sequelize';
import { sequelize } from './sequelize';
import { Country } from './country.model';
export class CountryTranslation extends Sequelize.Model {}

CountryTranslation.init(
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
        tableName: 'country_translations',
        underscored: true,
    }
);
