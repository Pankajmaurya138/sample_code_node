import amqp = require('amqplib');
import logger from './logger';

export enum ServiceSource {
    ADMIN_CMS = 'ADMIN_CMS',
    IDENTITY_SERVICE = 'IDENTITY_SERVICE',
    PROPERTY_SERVICE = 'PROPERTY_SERVICE',
    MISC_SERVICE = 'MISC_SERVICE',
    NOTIFICATION_SERVICE = 'NOTIFICATION_SERVICE',
    ELASTIC_SERVICE = 'ELASTIC_SERVICE',
}

export enum RabbitExchange {
    NOTIFICATION = 'NOTIFICATION',
}

export enum RabbitQueues {
    SEND_NOTIFICATION = 'SEND_NOTIFICATION',
    PROPERTY = 'PROPERTY',
    PROPERTY_ASSIGNMENT = 'PROPERTY_ASSIGNMENT',
}

export enum RabbitActions {
    FORGOT_PASSWORD = 'FORGOT_PASSWORD',
    REGISTER = 'REGISTER',
    ADD_SUBSCRIPTION = 'ADD_SUBSCRIPTION',
    ADD_PROPERTY_ELASTIC = 'ADD_PROPERTY_ELASTIC',
    DELETE_PROPERTY_ELASTIC = 'DELETE_PROPERTY_ELASTIC',
    PUBLISH_PROPERTY = 'PUBLISH_PROPERTY',
    UNPUBLISH_PROPERTY = 'UNPUBLISH_PROPERTY',
    PROPERTY_ASSIGN = 'PROPERTY_ASSIGN',
    PROPERTY_MARK_OCCUPIED = 'PROPERTY_MARK_OCCUPIED',
    PROPERTY_APPROVED = 'PROPERTY_APPROVED',
    PROPERTY_REJECTED = 'PROPERTY_REJECTED',
    ADD_POST_PROPERTY = 'ADD_POST_PROPERTY',
    PROPERTY_ASSIGNED_FOR_REVIEW = 'PROPERTY_ASSIGNED_FOR_REVIEW',
    PROPERTY_REASSIGNED_TO_RESOLVER = 'PROPERTY_REASSIGNED_TO_RESOLVER',
}

export interface RabbitContent {
    uid: number;
    source: ServiceSource;
    queue: string;
    action: RabbitActions;
    metadata: any;
    timestamp: number;
}

interface ChannelWithConnection {
    channel: amqp.ConfirmChannel;
    connection: amqp.Connection;
}

class RabbitMQEventBus {
    public connection: any = null;
    public channel: any = null;

    public connect = async (): Promise<amqp.Connection> => {
        try {
            if (!this.connection) {
                console.log(
                    '****************** RABBITMQ CONNECTION INITIATING ******************************'
                );
                this.connection = await amqp.connect(
                    process.env.CLOUDAMQP_URL || ''
                );
                this.channel = await this.connection.createConfirmChannel();
                this.connection.on('error', (err: any) => {
                    this.connection = null;
                    console.log(
                        '****************** RABBITMQ CONNECTION ERROR ******************************'
                    );
                });
                this.connection.on('blocked', () => {
                    this.connection = null;
                    console.log(
                        '****************** RABBITMQ CONNECTION blocked ******************************'
                    );
                });
                this.connection.on('close', () => {
                    this.connection = null;
                    console.log(
                        '****************** RABBITMQ CONNECTION closed ******************************'
                    );
                });
            }
            let obj: any = {
                connection: this.connection,
                channel: this.channel,
            };
            return obj;
        } catch (ex: any) {
            console.log(
                '****************** RABBITMQ CONNECTION ERROR ******************************'
            );
            logger.error(ex.message);
            this.connection = null;
            throw ex;
        }
    };

    private createChannel = async (
        prefetch: number = 10
    ): Promise<ChannelWithConnection> => {
        try {
            const { connection, channel }: any = await this.connect();
            channel.prefetch(prefetch);
            return { connection, channel };
        } catch (ex: any) {
            logger.error(ex.message);
            throw ex;
        }
    };

    //#region Publish / Subscribe

    public publishMessageToExchange = async (
        exchnage: RabbitExchange,
        action: RabbitActions,
        content: RabbitContent,
        callback?: (err: any, ok: amqp.Replies.Empty) => void
    ) => {
        try {
            const { connection, channel } = await this.createChannel(1);

            await channel.assertExchange(exchnage, 'direct', {
                durable: true,
            });

            channel.publish(
                exchnage,
                action,
                Buffer.from(JSON.stringify(content)),
                {
                    persistent: true,
                },
                callback
            );

            await this.closeConnection(connection);
        } catch (ex: any) {
            console.log('Exception in Publish', ex);
            logger.error(ex.message);
            throw ex;
        }
    };

    public subscribeMessageFromExchange = async (
        exchnage: RabbitExchange,
        action: RabbitActions,
        options: amqp.Options.Consume = { noAck: false },
        allUpTo: boolean = false,
        requeue: boolean = false,
        onMessage: (msg: RabbitContent | null, action: RabbitActions) => boolean
    ) => {
        try {
            const { channel } = await this.createChannel();

            await channel.assertExchange(exchnage, 'direct', { durable: true });
            const q = await channel.assertQueue('', { durable: true });
            await channel.bindQueue(q.queue, exchnage, action, {});

            await channel.consume(
                q.queue,
                (msg: amqp.ConsumeMessage | null) => {
                    if (!msg) {
                        throw new Error('Message failed to receive');
                    }
                    const data: RabbitContent = msg
                        ? JSON.parse(msg.content.toString())
                        : null;

                    const success = onMessage(
                        data,
                        msg.fields.routingKey as RabbitActions
                    );

                    this.onMessageConsumed(
                        channel,
                        msg,
                        success,
                        allUpTo,
                        requeue
                    );
                },
                options
            );
        } catch (ex: any) {
            console.log('Error in Consume', ex);
            logger.error(ex.message);
            throw ex;
        }
    };

    //#endregion

    //#region  Worker Queues

    public sendMessageToQueue = async (
        queue: string,
        content: RabbitContent,
        callback?: (err: any, ok: amqp.Replies.Empty) => void
    ) => {
        try {
            const { connection, channel } = await this.createChannel();
            await channel.assertQueue(queue, { durable: true });

            channel.sendToQueue(
                queue,
                Buffer.from(JSON.stringify(content)),
                {
                    persistent: true,
                },
                callback
            );

            // await this.closeConnection(connection);
        } catch (ex: any) {
            console.log('Error in Send', ex);
            logger.error(ex.message);
            throw ex;
        }
    };

    public consumeMessageFromQueue = async (
        queue: string,
        options: amqp.Options.Consume = { noAck: false },
        allUpTo: boolean = false,
        requeue: boolean = false,
        onMessage: (msg: RabbitContent | null) => Promise<boolean>
    ) => {
        try {
            const { channel } = await this.createChannel();
            await channel.assertQueue(queue, { durable: true });
            await channel.consume(
                queue,
                async (msg: amqp.ConsumeMessage | null) => {
                    if (!msg) {
                        throw new Error('Message failed to receive');
                    }
                    const data: RabbitContent = msg
                        ? JSON.parse(msg.content.toString())
                        : null;

                    const success = await onMessage(data);
                    this.onMessageConsumed(
                        channel,
                        msg,
                        success,
                        allUpTo,
                        requeue
                    );
                },
                options
            );
        } catch (ex: any) {
            console.log('Error in Consume', ex);
            logger.error(ex.message);
            throw ex;
        }
    };

    //#endregion

    private snooze = (ms: number) => {
        new Promise((resolve) => setTimeout(resolve, ms));
    };

    private closeConnection = async (
        connection: amqp.Connection
    ): Promise<void> => {
        await this.snooze(1000);
        return await connection.close();
    };

    private onMessageConsumed = (
        channel: amqp.Channel,
        msg: amqp.ConsumeMessage,
        success: boolean = true,
        allUpTo: boolean = false,
        requeue: boolean = false
    ) => {
        try {
            if (success) {
                channel.ack(msg, allUpTo);
            } else {
                channel.nack(msg, allUpTo, requeue);
            }
        } catch (ex: any) {
            logger.error(ex.message);
            throw ex;
        }
    };
}

const rabbitmqEventBus = new RabbitMQEventBus();
rabbitmqEventBus.connect();
export default rabbitmqEventBus;
