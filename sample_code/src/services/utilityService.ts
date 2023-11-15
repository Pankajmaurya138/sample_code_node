const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

var packageDefinition = protoLoader.loadSync('proto/utility.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true,
});

enum UtilityMethod {
    GET_TYPE_MASTER_DATA_BY_TYPE = 'getTypeMasterDataByType',
}

const UtilityService =
    grpc.loadPackageDefinition(packageDefinition).UtilityService;

const getConnection = () => {
    switch (process.env.NODE_ENV) {
        case 'local':
            return 'localhost:8000';
    }

    return process.env.GRPC_URL;
};

const metadata = new grpc.Metadata();
metadata.set('x-service', process.env.UTILITY_GRPC_SERVICE);

const client = new UtilityService(
    getConnection(),
    grpc.credentials.createInsecure()
);

class UtilityClient {
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

    getTypeMasterDataByType = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            UtilityMethod.GET_TYPE_MASTER_DATA_BY_TYPE
        );
    };
}

const utilityClient = new UtilityClient();
export default utilityClient;
