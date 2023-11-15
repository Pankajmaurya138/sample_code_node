import * as Sequelize from 'sequelize';
import { sequelize } from './sequelize';
import { Configuration } from './configurations.model';
export class ConfigurationTranslation extends Sequelize.Model {
    public id!: number;
    public value!: string[];
    public locale!: string;
    public categoryId!: number;
    public createdAt!: string;
    public updatedAt!: string;
    public Configuration!: Configuration;
}

ConfigurationTranslation.init(
    {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        value: {
            type: new Sequelize.ARRAY(Sequelize.TEXT),
            allowNull: true,
        },
        locale: {
            type: new Sequelize.STRING(20),
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'configuration_translations',
        underscored: true,
    }
);
