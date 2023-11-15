import slugify from 'slugify';
import { sequelize } from '../../models/sequelize';
import { Sequelize, Op, fn, literal, col } from 'sequelize';
import logger from '../../util/logger';
import { UserUploadItem } from '../../models/userUploadItem.model';
import { PropertyErrorCodes } from '../../util/enums';
import { TypeMaster } from '../../models/typeMaster.model';
import { TypeMasterTranslation } from '../../models/typeMasterTranslation.model';
import { User } from '../../models/user.model';

class DocumentRepository {
    /**
     * Save the documents in the Database
     *
     */
    saveDocuments = async (postData: any) => {
        let responseData: {
            status: boolean;
            message: string;
        } = {
            status: false,
            message: '',
        };
        try {
            let documentValues = [];
            if (postData.document && postData.document.length > 0) {
                for (let i = 0; i < postData.document.length; i++) {
                    documentValues.push({
                        user_id: postData.userId,
                        name: postData.document[i].file,
                        status_type_id: PropertyErrorCodes.STATUS_TYPE_ID,
                    });
                }
            }

            let savedDocument = await UserUploadItem.bulkCreate(documentValues);
            if (savedDocument) {
                responseData.status = true;
            }
        } catch (err) {
            responseData.message = err.message;
            logger.error(`DocumentRepository::saveDocument → ${err.message}`);
        }
        return responseData;
    };

    /**
     *
     * @param requestData
     */
    getUserDocuments = async (requestData: any) => {
        try {
            let order: any = ['updatedAt', 'DESC'];
            if (requestData.sort && requestData.sort != '') {
                console.log('v dc');
                order = [requestData.sort, requestData.order];
            }

            let userIds: any = [];

            userIds = await User.findAll({
                where: { parent_id: requestData.userId },
                attributes: ['id'],
            }).then((users) =>
                users.map((userData: any) => parseInt(userData.id))
            );
            userIds.push(requestData.userId);
            const propertyData = await UserUploadItem.findAndCountAll({
                raw: true,
                attributes: [
                    'id',
                    ['user_id', 'userId'],
                    'name',
                    [
                        <any>(
                            col('documentStatus.TypeMasterTranslationOne.name')
                        ),
                        'status',
                    ],

                    'createdAt',
                    ['status_type_id', 'statusTypeId'],
                ],
                where: {
                    user_id: userIds,
                },
                include: [
                    {
                        model: TypeMaster,
                        as: 'documentStatus',
                        attributes: [],
                        include: [
                            {
                                model: TypeMasterTranslation,
                                as: 'TypeMasterTranslationOne',
                                attributes: [],
                                where: { locale: requestData.locale },
                            },
                        ],
                    },
                ],
                limit: requestData.limit,
                offset: requestData.offset,
                order: [order],
            });
            console.log('propertyData', propertyData);
            return propertyData;
        } catch (err) {
            logger.error(
                `analyticsRepository::getPropertyMissingInfo : ${err.message}`
            );
            throw err;
        }
    };
}

const documentRepo = new DocumentRepository();
export default documentRepo;
