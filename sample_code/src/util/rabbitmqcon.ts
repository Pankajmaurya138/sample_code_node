import rabbitmqEventBus, {
    RabbitContent,
    RabbitQueues,
    RabbitActions,
    ServiceSource,
} from './rabbitmqEventBus';
import { PropertyController } from '../v1/controllers/property.controller';
import logger from './logger';
import { saveJob, updateJob } from '../models/job.model';

class RabbitMQService {
    private nodeEnv = process.env.NODE_ENV
        ? process.env.NODE_ENV.toUpperCase()
        : '';
    private propertyAssignmentQueue = `${RabbitQueues.PROPERTY_ASSIGNMENT}_${this.nodeEnv}`;
    private propertyQueue = `${RabbitQueues.PROPERTY}_${this.nodeEnv}`;
    private sendNotificationQueue = `${RabbitQueues.SEND_NOTIFICATION}_${this.nodeEnv}`;
    // private propertyAssignmentQueue = `${RabbitQueues.PROPERTY_ASSIGNMENT}_DEVELOPMENT`;

    handlePublishCallback = async (jobId: any, source: string, err: any) => {
        try {
            if (err) {
                throw err;
            }
            await updateJob(jobId, 'published');
        } catch (err: any) {
            logger.error(
                `RabbitMQService:${source}:handlePublishCallback → ${err.message}`
            );
        }
    };

    consumeMessageFromQueue = async () => {
        try {
            rabbitmqEventBus.consumeMessageFromQueue(
                this.propertyAssignmentQueue,
                { noAck: false },
                false,
                false,
                async (data: RabbitContent | null) => {
                    try {
                        if (!data) {
                            throw new Error('Data not found');
                        }
                        let returnData = false;
                        switch (data.action) {
                            case RabbitActions.PROPERTY_ASSIGN:
                                returnData =
                                    await new PropertyController().assignProperty(
                                        data
                                    );
                                break;
                            default:
                                break;
                        }
                        if (returnData) {
                            await updateJob(data.uid, 'consumed');
                        }
                        return returnData;
                    } catch (err: any) {
                        logger.error(err.message);
                        return false;
                    }
                }
            );
        } catch (err: any) {
            logger.error(err.message);
        }
    };

    publishToDeleteProperty = async (content: any) => {
        try {
            const contentData: RabbitContent = {
                uid: 0,
                source: ServiceSource.PROPERTY_SERVICE,
                queue: this.propertyQueue,
                action: RabbitActions.DELETE_PROPERTY_ELASTIC,
                metadata: content,
                timestamp: Date.now(),
            };
            const job = await saveJob(contentData);
            if (!job) {
                throw new Error('Job failed to save');
            }
            contentData.uid = job.id;
            rabbitmqEventBus.sendMessageToQueue(
                this.propertyQueue,
                contentData,
                async (err: any) => {
                    await updateJob(contentData.uid, err);
                }
            );
        } catch (err: any) {
            logger.error(`RabbitMQService :: publishToDeleteProperty :${err}`);
        }
    };

    // Trigger event when a property is submitted for review.
    propertySubmittedForReview = async (content: any) => {
        try {
            const contentData: RabbitContent = {
                uid: 0,
                source: ServiceSource.PROPERTY_SERVICE,
                queue: this.sendNotificationQueue,
                action: RabbitActions.PROPERTY_ASSIGNED_FOR_REVIEW,
                metadata: content,
                timestamp: Date.now(),
            };
            const job = await saveJob(contentData);
            if (!job) {
                throw new Error('Job failed to save');
            }
            contentData.uid = job.id;
            rabbitmqEventBus.sendMessageToQueue(
                this.sendNotificationQueue,
                contentData,
                async (err: any) => {
                    await this.handlePublishCallback(
                        job.id,
                        'propertyApproved',
                        err
                    );
                }
            );
        } catch (err: any) {
            logger.error(`RabbitMQService:propertyApproved → ${err.message}`);
            throw err;
        }
    };

    /**
     *
     * @param content
     * @description publish property occupied event
     */
    markPropertyOccupied = async (content: any) => {
        try {
            const contentData: RabbitContent = {
                uid: 0,
                source: ServiceSource.PROPERTY_SERVICE,
                queue: this.propertyQueue,
                action: RabbitActions.PROPERTY_MARK_OCCUPIED,
                metadata: content,
                timestamp: Date.now(),
            };
            console.log('markPropertyOccupied :', contentData);
            const job = await saveJob(contentData);
            if (!job) {
                throw new Error('Job failed to save');
            }
            contentData.uid = job.id;
            rabbitmqEventBus.sendMessageToQueue(
                this.propertyQueue,
                contentData,
                async (err: any) => {
                    await updateJob(contentData.uid, err);
                }
            );
        } catch (err: any) {
            logger.error(`RabbitMQService :: markPropertyOccupied :${err}`);
        }
    };

    // Trigger event when a property review is reassigned to a resolver.
    propertyReassignedToResolver = async (content: any) => {
        try {
            const contentData: RabbitContent = {
                uid: 0,
                source: ServiceSource.PROPERTY_SERVICE,
                queue: this.sendNotificationQueue,
                action: RabbitActions.PROPERTY_REASSIGNED_TO_RESOLVER,
                metadata: content,
                timestamp: Date.now(),
            };
            const job = await saveJob(contentData);
            if (!job) {
                throw new Error('Job failed to save');
            }
            contentData.uid = job.id;
            rabbitmqEventBus.sendMessageToQueue(
                this.sendNotificationQueue,
                contentData,
                async (err: any) => {
                    await this.handlePublishCallback(
                        job.id,
                        'propertyApproved',
                        err
                    );
                }
            );
        } catch (err: any) {
            logger.error(`RabbitMQService:propertyApproved → ${err.message}`);
            throw err;
        }
    };

    propertyApproved = async (content: any) => {
        try {
            const contentData: RabbitContent = {
                uid: 0,
                source: ServiceSource.PROPERTY_SERVICE,
                queue: this.sendNotificationQueue,
                action: RabbitActions.PROPERTY_APPROVED,
                metadata: content,
                timestamp: Date.now(),
            };
            const job = await saveJob(contentData);
            if (!job) {
                throw new Error('Job failed to save');
            }
            contentData.uid = job.id;
            rabbitmqEventBus.sendMessageToQueue(
                this.sendNotificationQueue,
                contentData,
                async (err: any) => {
                    await this.handlePublishCallback(
                        job.id,
                        'propertyApproved',
                        err
                    );
                }
            );
        } catch (err: any) {
            logger.error(`RabbitMQService:propertyApproved → ${err.message}`);
            throw err;
        }
    };

    propertyRejected = async (content: any) => {
        try {
            const contentData: RabbitContent = {
                uid: 0,
                source: ServiceSource.PROPERTY_SERVICE,
                queue: this.sendNotificationQueue,
                action: RabbitActions.PROPERTY_REJECTED,
                metadata: content,
                timestamp: Date.now(),
            };
            const job = await saveJob(contentData);
            if (!job) {
                throw new Error('Job failed to save');
            }
            contentData.uid = job.id;
            rabbitmqEventBus.sendMessageToQueue(
                this.sendNotificationQueue,
                contentData,
                async (err: any) => {
                    await this.handlePublishCallback(
                        job.id,
                        'propertyRejected',
                        err
                    );
                }
            );
        } catch (err: any) {
            logger.error(`RabbitMQService:propertyRejected → ${err.message}`);
            throw err;
        }
    };

    postPropertyStatusChange = async (content: any) => {
        try {
            const contentData: RabbitContent = {
                uid: 0,
                source: ServiceSource.PROPERTY_SERVICE,
                queue: this.sendNotificationQueue,
                action: RabbitActions.ADD_POST_PROPERTY,
                metadata: content,
                timestamp: Date.now(),
            };
            const job = await saveJob(contentData);
            if (!job) {
                throw new Error('Job failed to save');
            }
            contentData.uid = job.id;
            rabbitmqEventBus.sendMessageToQueue(
                this.sendNotificationQueue,
                contentData,
                async (err: any) => {
                    await this.handlePublishCallback(
                        job.id,
                        'postPropertyStatusChange',
                        err
                    );
                }
            );
        } catch (err: any) {
            logger.error(
                `RabbitMQService:propertyStatusChange → ${err.message}`
            );
        }
    };
    publishToAddProperty = async (content: any) => {
        try {
            const contentData: RabbitContent = {
                uid: 0,
                source: ServiceSource.PROPERTY_SERVICE,
                queue: this.propertyQueue,
                action: RabbitActions.ADD_PROPERTY_ELASTIC,
                metadata: content,
                timestamp: Date.now(),
            };
            const job = await saveJob(contentData);
            if (!job) {
                throw new Error('Job failed to save');
            }
            contentData.uid = job.id;
            rabbitmqEventBus.sendMessageToQueue(
                this.propertyQueue,
                contentData,
                async (err: any) => {
                    await this.handlePublishCallback(
                        job.id,
                        'propertyApproved',
                        err
                    );
                }
            );
        } catch (err: any) {
            logger.error(err.message);
        }
    };
}

const rabbitMQService = new RabbitMQService();
export default rabbitMQService;
