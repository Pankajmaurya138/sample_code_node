import * as Sequelize from 'sequelize';
import { sequelize } from './sequelize';
import { TypeMaster } from './typeMaster.model';
import { TypeMasterTranslation } from './typeMasterTranslation.model';
import { User } from './user.model';
import { UserInfo } from './userInfo.model';
export class UserUploadItem extends Sequelize.Model {}

UserUploadItem.init(
    {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: Sequelize.BIGINT,
        },
        name: {
            type: new Sequelize.STRING(100),
            allowNull: true,
        },
        status_type_id: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'user_upload_items',
        underscored: true,
    }
);
UserUploadItem.belongsTo(TypeMaster, {
    foreignKey: 'status_type_id',
    as: 'documentStatus',
});
