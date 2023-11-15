import * as Sequelize from 'sequelize';
import { sequelize } from './sequelize';
import { CountryTranslation } from './countryTranslations.model';
export class Country extends Sequelize.Model {}

Country.init(
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

        iso_code: {
            type: new Sequelize.STRING(100),
            allowNull: true,
        },
        country_code: {
            type: new Sequelize.STRING(100),
            allowNull: true,
        },
        is_active: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
        },
    },

    {
        sequelize,
        tableName: 'countries',
        underscored: true,
        paranoid: true,
    }
);

Country.hasMany(CountryTranslation);
CountryTranslation.belongsTo(Country);

export const listAll = (arg: any) => {
    return new Promise((resolve, reject) => {
        var limit = arg.length;
        var offset = arg.start;
        var order: any = ['name', 'ASC'];
        if (
            typeof arg.order[0].column != 'undefined' &&
            typeof arg.order[0].dir != 'undefined'
        ) {
            order = [arg.order[0].column, arg.order[0].dir];
        }
        var where: any = {};
        if (arg.search['value']) {
            var searchData = {
                [Sequelize.Op.iLike]: '%' + arg.search['value'] + '%',
            };
            where = {
                [Sequelize.Op.or]: [{ name: searchData }],
            };
        }
        if (arg.locale) {
            where['locale'] = arg.locale;
        }
        CountryTranslation.findAndCountAll({
            include: { model: Country, required: true },
            where: where,
            order: [order],
            limit: limit,
            offset: offset,
        })
            .then(function (result) {
                resolve(result);
            })
            .catch((e) => reject(e));
    });
};
