import * as Sequelize from 'sequelize';
import { sequelize } from './sequelize';
export class XmlUploadErrors extends Sequelize.Model {}

XmlUploadErrors.init(
    {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        xmlUrl: {
            type: Sequelize.STRING(300),
        },
        userId: {
            type: new Sequelize.STRING(100),
        },
        errorDetails: {
            type: new Sequelize.STRING(300),
        },
        propertyRef: {
            type: new Sequelize.STRING(300),
        },
        status: {
            type: new Sequelize.STRING(300),
        },
        propertyIndex: {
            type: new Sequelize.STRING(300),
        },
        errorType: {
            type: new Sequelize.STRING(300),
        },
        createdAt: {
            type: Sequelize.DATE,
        },
        updatedAt: {
            type: Sequelize.DATE,
        },
        deletedAt: {
            type: Sequelize.DATE,
        },
    },
    {
        sequelize,
        tableName: 'xml_upload_errors',
        underscored: true,
        paranoid: true,
    }
);
