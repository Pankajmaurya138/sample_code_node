const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

var packageDefinition = protoLoader.loadSync('proto/assets.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true,
});
const AssetsService =
    grpc.loadPackageDefinition(packageDefinition).AssetsService;
const getConnection = () => {
    return process.env.GRPC_URL;
};
const metadata = new grpc.Metadata();
metadata.set('x-service', process.env.ASSETS_GRPC_SERVICE);
const client = new AssetsService(
    getConnection(),
    grpc.credentials.createInsecure()
);

enum AssetsMethod {
    UPLOADIMAGES = 'uploadImages',
}
class AssetsGRPCClient {
    private handleClientMethod = (
        request: any,
        method: string
    ): Promise<any> => {
        return new Promise((resolve, reject) => {
            client[method](request, metadata, (err: any, data: any) => {
                if (err || data.error) {
                    reject(err ?? data.error);
                }
                resolve(data);
            });
        });
    };
    uploadImages = (request: any): Promise<any> => {
        return this.handleClientMethod(request, AssetsMethod.UPLOADIMAGES);
    };
}

const assetsGRPCClient = new AssetsGRPCClient();
export default assetsGRPCClient;
