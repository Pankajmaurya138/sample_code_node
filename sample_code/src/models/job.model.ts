import * as Sequelize from 'sequelize';
import logger from '../util/logger';
import { RabbitContent } from '../util/rabbitmqEventBus';
import { sequelize } from './sequelize';

export class Job extends Sequelize.Model {
    public id!: number;
    public source!: string;
    public queue!: string;
    public action!: string;
    public payload!: string;
    public status!: string;
    public createdAt!: Date;
    public updatedAt!: Date;
}

Job.init(
    {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        source: {
            type: Sequelize.STRING(100),
            allowNull: true,
        },
        queue: {
            type: new Sequelize.STRING(100),
            allowNull: false,
        },
        action: {
            type: Sequelize.STRING(100),
            defaultValue: true,
        },
        payload: {
            type: Sequelize.JSON,
            defaultValue: true,
        },
        status: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
        },
    },

    {
        sequelize,
        tableName: 'jobs',
        underscored: true,
        paranoid: false,
    }
);

export const saveJob = async (rabbitContent: RabbitContent) => {
    let job = null;
    try {
        const jobData = {
            source: rabbitContent.source,
            queue: rabbitContent.queue,
            action: rabbitContent.action,
            payload: rabbitContent.metadata,
            status: 'processing',
        };
        job = await Job.create(jobData);
    } catch (err) {
        logger.error(err.message);
    }
    return job;
};

export const updateJob = async (id: number, status: string) => {
    let job = null;
    try {
        job = await Job.findByPk(id);
        if (!job) {
            throw new Error('Job not found');
        }
        job.status = status;
        await job.save();
    } catch (err) {
        logger.error(err.message);
    }
    return job;
};
