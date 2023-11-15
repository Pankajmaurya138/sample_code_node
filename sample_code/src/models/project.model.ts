import * as Sequelize from 'sequelize';
import { sequelize } from './sequelize';
import { ProjectTranslation } from './projectTranslations.model';
export class Project extends Sequelize.Model {}

Project.init(
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
        developer_id: {
            type: Sequelize.BIGINT,
            allowNull: true,
        },

        is_active: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
        },
    },

    {
        sequelize,
        tableName: 'projects',
        underscored: true,
        paranoid: true,
    }
);

Project.hasMany(ProjectTranslation);
ProjectTranslation.belongsTo(Project);
