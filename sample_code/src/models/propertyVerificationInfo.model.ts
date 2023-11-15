import * as Sequelize from 'sequelize';
import { PostProperty } from './postProperty.model';
import { sequelize } from './sequelize';
export class PropertyVerificationInfo extends Sequelize.Model {
    id: number;
    regaAuthNumber: string;
    PostProperty: PostProperty;
    identityNumber: number;
    identity: string;
    wathqVerified: any;
    authDraft: any;
}

PropertyVerificationInfo.init(
    {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        identity: {
            type: Sequelize.ENUM('nid', 'iqama', 'crno'),
            allowNull: true,
        },
        identityNumber: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        deedNumber: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        regaAuthNumber: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        isVerified: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        },
        wathqVerified: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        authDraft: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        sequelize,
        tableName: 'property_verification_info',
        underscored: true,
        paranoid: true,
    }
);
