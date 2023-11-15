import { utilityGrpcService } from '../util/UtilityGrpcService';

class UtilityService {
    /**
     * Get Type master translation data by type.
     * @param type type name
     * @returns
     */
    async getTypeMasterDataByType(type: string) {
        return utilityGrpcService.getTypeMasterDataByType({
            request: { type },
        });
    }

    // get one feature entity data from utility service by whereCondition
    async getFeatureEntityData(whereCondition: any) {
        return utilityGrpcService.getFeatureEntityData({ whereCondition });
    }

    // get all feature entity data from utility service by whereCondition
    async getAllFeatureEntityData(whereCondition: any) {
        return utilityGrpcService.getAllFeatureEntityData({ whereCondition });
    }
}
const utilityService = new UtilityService();
export { utilityService };
