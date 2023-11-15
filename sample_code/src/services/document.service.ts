import { PropertyErrorCodes } from '../util/enums';
import DocumentRepo from '../v1/repositories/document.repository';
import logger from '../util/logger';
import { UserUploadItem } from '../models/userUploadItem.model';

export class DocumentService {
    private responseData: any;

    /**
     * @description : For set response format
     */
    setResponseData() {
        this.responseData = {
            error: null,
        };
    }

    /**
     * @description Method for save documents into db
     * @param metaData
     * @param callback
     */
    uploadDocuments = async (metaData: any, callback: any) => {
        this.setResponseData();
        try {
            let savedDocument = await DocumentRepo.saveDocuments(
                metaData.request
            );
            if (!savedDocument.status) {
                throw new Error(
                    `${savedDocument.message}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                );
            }
            this.responseData = savedDocument;
        } catch (e) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(`DocumentService::uploadDocuments → ${e.message}`);
        }
        callback(null, this.responseData);
    };
    /**
     * @description : For get user documents
     * @param req
     * @param res
     * @returns : Response
     */
    userDocuments = async (node: any, callback: any) => {
        this.setResponseData();
        try {
            const requestData = node.request;
            const responseData = await DocumentRepo.getUserDocuments(
                requestData
            );
            this.responseData.data = responseData;
        } catch (e) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(`DocumentService::getUserDocuments → ${e.message}`);
        }
        callback(null, this.responseData);
    };
    /**
     * @description For soft delete by user own Document
     * @param req
     * @param res
     * @returns Response
     */
    deleteDocument = async (requestData: any, callback: any) => {
        this.setResponseData();
        try {
            var documentData = await UserUploadItem.findByPk(
                requestData.request.id
            );

            if (!documentData) {
                throw new Error(
                    `${PropertyErrorCodes.DOCUMENT_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
                );
            }
            if (documentData) {
                await documentData.destroy();
            }
        } catch (e) {
            let exception = e.message.split('||');
            this.responseData.error = {
                code: exception[0],
                message: exception[0],
            };
            this.responseData.error.code = exception[0];
            if (exception.length == 1) {
                this.responseData.error.code =
                    PropertyErrorCodes.DATABASE_ERROR;
                this.responseData.error.message = exception[0];
            }
            logger.error(`DocumentService::deleteDocument → ${e.message}`);
        }
        callback(null, this.responseData);
    };
}
