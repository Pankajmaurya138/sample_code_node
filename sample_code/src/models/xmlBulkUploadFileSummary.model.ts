import * as Sequelize from 'sequelize';
import { sequelize } from './sequelize';
export class XmlBulkUploadFileSummary extends Sequelize.Model {
    public id!: number;
}

XmlBulkUploadFileSummary.init(
    {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: Sequelize.TEXT,
        },
        xmlUrl: {
            type: Sequelize.TEXT,
        },
        successCount: {
            type: Sequelize.BIGINT,
        },
        failureCount: {
            type: Sequelize.BIGINT,
        },
        response: {
            type: Sequelize.JSON,
        },
    },
    {
        sequelize,
        tableName: 'xml_bulk_upload_file_summary',
        updatedAt: false,
        underscored: true,
    }
);
