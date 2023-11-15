const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const packageDefinition = protoLoader.loadSync('proto/utility.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true,
});
const UtilityService =
    grpc.loadPackageDefinition(packageDefinition).UtilityService;

const metadata = new grpc.Metadata();
metadata.set('x-service', process.env.UTILITY_GRPC_SERVICE);

const client = new UtilityService(
    process.env.GRPC_URL,
    grpc.credentials.createInsecure()
);

enum UtilityGrpcMethods {
    GET_TYPE_MASTER_DATA_BY_TYPE = 'getTypeMasterDataByType',
    GET_FEATURE_ENTITY_DATA = 'getFeatureEntityData',
    GET_ALL_FEATURE_ENTITY_DATA = 'getAllFeatureEntityData',
}
class UtilityGrpcService {
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
            UtilityGrpcMethods.GET_TYPE_MASTER_DATA_BY_TYPE
        );
    };

    // get one feature entity data from utility service by whereCondition
    getFeatureEntityData = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            UtilityGrpcMethods.GET_FEATURE_ENTITY_DATA
        );
    };

    // get all feature entity data from utility service by whereCondition
    getAllFeatureEntityData = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            UtilityGrpcMethods.GET_ALL_FEATURE_ENTITY_DATA
        );
    };
}

const utilityGrpcService = new UtilityGrpcService();
export { utilityGrpcService };
