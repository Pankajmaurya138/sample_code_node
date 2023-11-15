import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import Axios from 'axios';
import logger from '../util/logger';
import assetsGRPCClient from '../services/assetsGRPC.service';
import { ENUMS, FilePath } from '../util/enums';
import { startDeleteingFiles } from '../util/general';

export const downloadFile = async (
    fileUrl: string,
    outputLocationPath: string
): Promise<boolean> => {
    try {
        const data: any = await Axios.head(fileUrl);
        if (data || data.status == 200) {
            if (
                data.headers['content-length'] <=
                ENUMS.MAX_FILE_SIZE * 1048576
            ) {
                const response = await Axios({
                    method: 'get',
                    url: fileUrl,
                    responseType: 'stream',
                });

                return new Promise((resolve, reject) => {
                    try {
                        const writer = fs.createWriteStream(outputLocationPath);
                        writer.on('error', (err) => {
                            console.log(
                                'downloadFileFn writer error called → ',
                                err
                            );
                            error = err;
                            writer.close();
                            resolve(false);
                        });
                        writer.on('close', () => {
                            if (!error) {
                                resolve(true);
                            }
                        });
                        response.data.pipe(writer);
                        let error: any = null;
                        setTimeout(() => {
                            resolve(false);
                        }, 5000);
                    } catch (err) {
                        reject(err);
                    }
                });
            }
        }
        return false;
    } catch (err: any) {
        console.log(
            '************ Error in Image Processing: downloadFileFn ************',
            err?.message
        );
        logger.error(`PropertyRepository::downloadFileFn : ${err.message}`);
        throw err;
    }
};

export const setImageFiles = async (files: any, userId: any) => {
    try {
        if (!files) return;
        let filePath: string = FilePath.TEMP_PATH; //   TEMP_PATH = "./assets/temp/properties/",
        let fileName: any;
        let isFileUpload: any;
        let fileData: any = [];
        for (let i = 0; i < files.length; i++) {
            if (i >= ENUMS.MAX_FILE_DOWNLOAD) break;
            fileName = `image-XML-${uuidv4()}.jpg`;
            const fileImagePath = path.resolve(filePath, fileName);
            isFileUpload = await downloadFile(files[i], fileImagePath);
            if (isFileUpload) {
                fileData.push(fileName);
            }
        }
        return fileData;
    } catch (err: any) {
        logger.error(`PropertyRepository::setImageFiles : ${err.message}`);
        throw err;
    }
};

export const moveFilesToPermanentLocation = async (
    postData: any,
    savedProperty: any
) => {
    const { file } = postData;
    const {
        property: { id: propertyId },
    } = savedProperty;
    let imageData = {
        id: propertyId,
        file: file,
    };
    // startDeleteingFiles(file?.images || []); // Should be deleted
    assetsGRPCClient
        .uploadImages(imageData)
        .then((data: any) => {
            // startDeleteingFiles(file?.images || []);
        })
        .catch((err: any) => {
            console.log(
                '\n\n ******** moveFilesToPermanentLocationFn Error:',
                err?.message
            );
        });
};

export const setImageFilesForProperty = async (files: any, userId: any) => {
    try {
        if (!files) return;
        let filePath: string = FilePath.TEMP_PATH; //   TEMP_PATH = "./assets/temp/properties/",
        let fileName: any;
        let isFileUpload: any;
        let fileData: any = '';
        fileName = `image-${uuidv4()}.jpg`;
        const fileImagePath = path.resolve(filePath, fileName);
        isFileUpload = await downloadFile(files, fileImagePath);
        if (isFileUpload) {
            fileData = fileName;
        }
        return fileData;
    } catch (err: any) {
        logger.error(`PropertyRepository::setImageFiles : ${err.message}`);
        throw err;
    }
};
