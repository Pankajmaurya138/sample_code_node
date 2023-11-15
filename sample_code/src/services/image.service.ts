const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { promisify } = require('util');

var packageDefinition = protoLoader.loadSync('proto/image.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true,
});
const ImageService = grpc.loadPackageDefinition(packageDefinition).ImageService;

const client = new ImageService(
    'localhost:4008',
    grpc.credentials.createInsecure()
);

class ImageClient {
    uploadImages = (request: any): Promise<any> => {
        return new Promise((resolve, reject) => {
            client.uploadImages(request, (err: any, data: any) => {
                if (err || data.error) {
                    reject(err ?? data.error);
                }
                resolve(data);
            });
        });
    };
}

const imageClient = new ImageClient();
export default imageClient;
