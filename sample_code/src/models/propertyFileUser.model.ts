import * as Sequelize from 'sequelize';
import { PropertyFile } from './propertyFile.model';
import { sequelize } from './sequelize';
export class PropertyFileUser extends Sequelize.Model {}

PropertyFileUser.init(
    {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        propertyFileId: {
            type: Sequelize.BIGINT,
        },
        userId: {
            type: Sequelize.BIGINT,
        },
        roleId: {
            type: Sequelize.BIGINT,
        },
    },
    {
        sequelize,
        tableName: 'property_file_user',
        underscored: true,
    }
);

PropertyFile.hasOne(PropertyFileUser);
PropertyFileUser.belongsTo(PropertyFile);
