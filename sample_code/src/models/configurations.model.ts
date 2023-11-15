import * as Sequelize from 'sequelize';
import { sequelize } from './sequelize';
import { ConfigurationTranslation } from './configurationTranslations.model';
export class Configuration extends Sequelize.Model {
    public id!: number;
    public key!: string;
    public type!: string;
    public group!: string;
    public createdAt!: Date;
    public updatedAt!: Date;
}

Configuration.init(
    {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        key: {
            type: new Sequelize.STRING(100),
            allowNull: true,
        },
        group: {
            type: new Sequelize.STRING(100),
            allowNull: true,
        },
        type: {
            type: new Sequelize.STRING(100),
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'configurations',
        underscored: true,
        // paranoid: true,
    }
);

Configuration.hasMany(ConfigurationTranslation);

ConfigurationTranslation.belongsTo(Configuration);

export const getMailConfigurations = async () => {
    try {
        const keys = [
            'SMTP_HOST',
            'SMTP_PORT',
            'SMTP_USERNAME',
            'SMTP_PASSWORD',
            'FROM_EMAIL',
        ];
        const configurationIds: any = await Configuration.findAll({
            where: { key: keys },
            attributes: ['id'],
        }).then((configurationsData) =>
            configurationsData.map(
                (configurationData: Configuration) => configurationData.id
            )
        );
        const configurationTranslations =
            await ConfigurationTranslation.findAll({
                where: { configuration_id: configurationIds },
                include: { model: Configuration, attributes: ['key'] },
                attributes: ['value'],
            });
        let data: any = {};
        (await configurationTranslations).map(
            (configurationTranslationsData: ConfigurationTranslation) =>
                (data[configurationTranslationsData.Configuration.key] =
                    configurationTranslationsData.value[0])
        );
        return data;
    } catch (err) {
        return false;
    }
};
