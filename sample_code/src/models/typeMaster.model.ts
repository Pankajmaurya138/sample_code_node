import * as Sequelize from 'sequelize';
import { sequelize } from './sequelize';
import { TypeMasterTranslation } from './typeMasterTranslation.model';

export class TypeMaster extends Sequelize.Model {
    public id!: number;
    public type!: string;
    public slug!: string;
    public isActive!: boolean;
    public TypeMasterTranslations?: TypeMasterTranslation[];
}

TypeMaster.init(
    {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        type: {
            type: new Sequelize.STRING(100),
            allowNull: false,
        },
        slug: {
            type: new Sequelize.STRING(100),
            allowNull: false,
        },
        code: {
            type: new Sequelize.STRING(100),
            allowNull: true,
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: 'type_masters',
        underscored: true,
        paranoid: true,
    }
);
TypeMaster.hasOne(TypeMasterTranslation, {
    foreignKey: 'type_master_id',
    as: 'TypeMasterTranslationOne',
});

TypeMaster.hasMany(TypeMasterTranslation);
TypeMasterTranslation.belongsTo(TypeMaster);
