import {
    AgentRoleIdEnums,
    InternalReviewStatusSlugEnum,
    InternalTeamReviewUserType,
    PostPropertyStatus,
    PropertyErrorCodes,
} from '../util/enums';
import PropertyRepo from '../v1/repositories/property.repository';
import logger from '../util/logger';
import PostPropertyRepo from '../v1/repositories/postProperty.repository';
import { setErrorMessageForGrpc } from '../util/general';
import identityClient from './identityService';
import { propertyTransformer } from '../util/transformers';
import i18next from 'i18next';
import PropertyOperationsRepo from '../v1/repositories/propertyOperations.repository';
import { utilityGrpcService } from '../util/UtilityGrpcService';
import { redisCache } from '../util/RedisCache';
import { TYPE_MASTERS_REDIS_KEY } from '../util/redisConstant';

export class PropertyOperationsService {
    private responseData: any;

    /**
     * @description : For set response format
     */
    setResponseData() {
        this.responseData = {
            error: null,
            property: null,
        };
    }
    setUserPropertyResponseData() {
        this.responseData = {
            error: null,
            data: null,
        };
    }
    setPostedPropertyResponseData() {
        this.responseData = {
            error: null,
            data: null,
        };
    }

    // submit a property for QC verification
    assignPropertyToQC = async (arg: any, callback?: any) => {
        this.setPostedPropertyResponseData();
        try {
            const payload = arg.request;
            const property = await PropertyRepo.getPropertyWithLocationById({
                id: payload.id,
            }); //get the property with its location details by property id
            if (!property) {
                throw new Error(PropertyErrorCodes.PROPERTY_NOT_FOUND);
            }

            let review: Record<string, any> = {};
            const lastReview: Record<string, any> =
                await PropertyOperationsRepo.getLastPropertyReview({
                    propertyId: property.id,
                }); // get the last review of the property for reviewer details
            if (
                lastReview &&
                lastReview.TypeMaster.slug ===
                    InternalReviewStatusSlugEnum.RE_ASSIGNED
            ) {
                if (
                    lastReview.resolverRoleId !== payload.roleId ||
                    lastReview.resolverId !== payload.userId
                ) {
                    throw new Error(PropertyErrorCodes.PROPERTY_NOT_FOUND);
                }
                review = await PropertyOperationsRepo.assignPropertyToLastQC(
                    lastReview
                ); // if there exists a review, then assigning the property to same reviwer.
            } else if (
                lastReview?.TypeMaster.slug !==
                InternalReviewStatusSlugEnum.IN_PROGRESS
            ) {
                const user =
                    await identityClient.getReviewerWithRoleIdForLocation({
                        zoneId: property?.PropertyLocation?.zoneId,
                        roleId: AgentRoleIdEnums.WASALT_QUALITY_CHECK_TEAM,
                        type: InternalTeamReviewUserType.REVIEWER,
                    }); // Find the QC in same zone for property review assignemnt.
                if (!user.userId) {
                    throw new Error(PropertyErrorCodes.QC_AGENT_NOT_FOUND);
                }
                review = await PropertyOperationsRepo.createPropertyReview({
                    propertyId: property.id,
                    reviewerId: user.userId,
                }); // Assign property to new reviewer.
            }
            const propertyRepoResult =
                await PostPropertyRepo.getAssigneeDetails({
                    ...payload,
                    userId: property.userId,
                });

            propertyRepoResult.data['assigneeId'] = review['reviewerId'];

            this.responseData.data = propertyRepoResult.data;
            this.responseData.status = propertyRepoResult.status;
            this.responseData.message = propertyRepoResult.message;
        } catch (e: any) {
            this.responseData = setErrorMessageForGrpc(e);
            logger.error(
                `PropertyService :: assignPropertyToQC → ${e.message}`
            );
        }
        callback(null, this.responseData);
    };

    /**
     * Get list of properties re-assigned by reviewer to current user
     * @param arg
     * @param callback
     */
    getReassignedProperties = async (args: any, callback?: any) => {
        this.setPostedPropertyResponseData();
        try {
            const reqBody = args.request;
            let properties =
                await PropertyOperationsRepo.getReassignedProperties(reqBody); // get properties re-assigned to current user.
            const response =
                propertyTransformer.transformPropertyBrief(properties); // transform the db data in required format having only brief info of properties.
            this.responseData.data = response;
        } catch (err: any) {
            this.responseData = setErrorMessageForGrpc(err);
            logger.error(
                `postPropertycontroller::getReassignedProperties : ${err.message}`
            );
        }
        callback(null, this.responseData);
    };

    /**
     * @description Get list of properties assigned to reviewer.
     * @param arg
     * @param callback
     */
    getAssignedProperties = async (args: any, callback?: any) => {
        this.setPostedPropertyResponseData();
        try {
            const reqBody = args.request;

            let properties = await PropertyOperationsRepo.getAssignedProperties(
                reqBody
            ); // get properties assigned to current user.
            const response =
                propertyTransformer.transformPropertyBrief(properties); // transform the db data in required format having only brief info of properties.
            this.responseData.data = response;
        } catch (err: any) {
            logger.error(
                `postPropertycontroller::getAssignedProperties : ${err.message}`
            );
            this.responseData = setErrorMessageForGrpc(err);
        }

        callback(null, this.responseData);
    };

    /**
     * Re-assign property for modifications to other agent.
     * @param arg
     * @param callback
     */
    reAssignPropertyToTeam = async (args: any, callback?: any) => {
        this.setPostedPropertyResponseData();
        try {
            const reqBody = args.request;
            const property: any =
                await PropertyRepo.getPropertyDataByIdAndAddedById(reqBody); // get the property info with given id and added_by field
            if (
                reqBody.resolverRoleId == AgentRoleIdEnums.WASALT_LISTING_TEAM
            ) {
                // if the resolverRoleId is of listing agent, then assign the agent who added the property as resolver of reveiw.
                await PropertyOperationsRepo.reAssignPropertyToUser({
                    message: reqBody.message,
                    id: reqBody.propertyId,
                    stagesMeta: reqBody.stagesMeta,
                    resolverRoleId: reqBody.resolverRoleId,
                    resolverId: property.addedBy,
                    reviewerId: reqBody.userId,
                    reviewId: property.reviews[0].id,
                    propertyId: reqBody.propertyId,
                });
            } else if (
                reqBody.resolverRoleId ==
                AgentRoleIdEnums.WASALT_PHOTOGRAPHER_TEAM
            ) {
                // if the resolverRoleId is of photographer team, then find the photographer in the property district for assignment as resolver.
                const user =
                    await identityClient.getReviewerWithRoleIdForLocation({
                        zoneId: property?.PropertyLocation?.zoneId,
                        roleId: reqBody.resolverRoleId,
                        type: InternalTeamReviewUserType.RESOLVER,
                    }); //find the photographer in same district as of property from identity MS.
                if (!user.userId) {
                    throw new Error('PHOTOGRAPHER_NOT_FOUND');
                }
                await PropertyOperationsRepo.reAssignPropertyToUser({
                    message: reqBody.message,
                    id: reqBody.propertyId,
                    stagesMeta: reqBody.stagesMeta,
                    resolverRoleId: reqBody.resolverRoleId,
                    resolverId: user.userId,
                    reviewerId: reqBody.userId,
                    reviewId: property.reviews[0].id,
                    propertyId: reqBody.propertyId,
                });
            }

            this.responseData.data = {};
        } catch (err: any) {
            logger.error(
                `postPropertycontroller::reAssignPropertyToTeam : ${err.message}`
            );
            this.responseData = setErrorMessageForGrpc(err);
        }
        callback(null, this.responseData);
    };

    /**
     * Get reviews of a property by property Id associated to current user.
     * @param arg
     * @param callback
     */
    getTeamReviews = async (args: any, callback?: any) => {
        this.setResponseData();
        try {
            const reqBody = args.request;
            let reviews: any = [];
            if (reqBody.roleId === AgentRoleIdEnums.WASALT_QUALITY_CHECK_TEAM) {
                // if roleId of current user is of QC agent, then filter reviews on basis of reviewer id.
                reviews =
                    await PropertyOperationsRepo.getPropertyReviewsForReviewer(
                        reqBody
                    );
            } else {
                reviews =
                    await PropertyOperationsRepo.getPropertyReviewsForResolver(
                        reqBody
                    ); // if roleId of current user is not of QC agent, then filter reviews on basis of resolverId.
            }
            this.responseData.data = reviews.map((review: any) => ({
                ...review.dataValues,
            }));
        } catch (err: any) {
            logger.error(
                `postPropertycontroller::getTeamReviews : ${err.message}`
            );
            this.responseData = setErrorMessageForGrpc(err);
        }
        callback(null, this.responseData);
    };

    /**
     * Make property live by marking it approved
     * @param arg
     * @param callback
     */
    pushPropertyToLive = async (args: any, callback?: any) => {
        this.setResponseData();
        try {
            const reqBody = args.request;
            const property: any =
                await PropertyRepo.getPropertyDataByIdAndAddedById(reqBody);
            await PropertyOperationsRepo.approveProperty({
                reviewId: property.reviews[0].id,
                propertyId: reqBody.propertyId,
            }); // Change the status of review and property to approved.
            this.responseData.message = i18next.t('SUCCESS');
            this.responseData.status = true;
        } catch (err: any) {
            logger.error(
                `postPropertycontroller::pushPropertyToLive : ${err.message}`
            );
            this.responseData = setErrorMessageForGrpc(err);
        }
        callback(null, this.responseData);
    };

    /**
     * Reject a property
     * @param arg
     * @param callback
     */
    rejectProperty = async (args: any, callback?: any) => {
        this.setResponseData();
        try {
            const reqBody = args.request;
            const property: any =
                await PropertyRepo.getPropertyDataByIdAndAddedById(reqBody);
            await PropertyOperationsRepo.rejectProperty({
                reviewId: property.reviews[0].id,
                propertyId: reqBody.propertyId,
            }); // Change the status of review and property to rejected.
            this.responseData.message = i18next.t('SUCCESS');
            this.responseData.status = true;
        } catch (err: any) {
            logger.error(
                `postPropertycontroller::rejectProperty : ${err.message}`
            );
            this.responseData = setErrorMessageForGrpc(err);
        }
        callback(null, this.responseData);
    };

    /**
     * Get Property Details by property id
     * @param arg
     * @param callback
     */
    getPropertyForAmbassadorById = async (args: any, callback: any) => {
        const reqBody = args.request;
        this.setResponseData();
        try {
            const lastReview =
                await PropertyOperationsRepo.getLastPropertyReview(reqBody);
            if (
                !lastReview ||
                !(
                    lastReview.resolverId == reqBody.userId ||
                    lastReview.reviewerId == reqBody.userId
                )
            ) {
                //if the current user is not a resolver or reviewer of the property then throw error.
                throw new Error('NO_REVIEW_FOUND');
            }
            const property = await PropertyRepo.getPropertyDetailsById(reqBody); // get the details of property.
            const transformedProperty =
                propertyTransformer.transformPropertyDetails(property); // transform the property details from database to required format.
            this.responseData.data = transformedProperty;
        } catch (e: any) {
            this.responseData = setErrorMessageForGrpc(e);
        }
        callback(null, this.responseData);
    };

    /**
     * Get PostProperty user by postPropertyId for current user
     * @param args
     * @param callback
     */
    getPostPropertyUserForAmbassador = async (args: any, callback: any) => {
        const reqBody = args.request;
        this.setResponseData();
        try {
            const property: any = await PostPropertyRepo.getPropertyByPostedId({
                id: reqBody.postPropertyId,
            });
            if (!property) {
                const postProperty = await PostPropertyRepo.getPostedProperty({
                    id: reqBody.postPropertyId,
                });
                if (
                    !postProperty ||
                    !(
                        postProperty.userId == reqBody.userId ||
                        postProperty.addedBy == reqBody.userId
                    )
                ) {
                    // check if the current user is listing user or listing agent who added property.
                    throw new Error(PropertyErrorCodes.PROPERTY_NOT_FOUND);
                }
                this.responseData = { userId: postProperty.userId };
            } else {
                const lastReview =
                    await PropertyOperationsRepo.getLastPropertyReview({
                        propertyId: property.id,
                    }); // get the current review of property.
                if (
                    !(
                        property.userId == reqBody.userId ||
                        property.addedBy == reqBody.userId
                    )
                ) {
                    if (
                        !lastReview ||
                        !(
                            lastReview.resolverId == reqBody.userId ||
                            lastReview.reviewerId == reqBody.userId
                        )
                    ) {
                        //if the current user is not a resolver or reviewer of the property then throw error.
                        throw new Error(PropertyErrorCodes.PROPERTY_NOT_FOUND);
                    }
                }

                this.responseData = { userId: property.userId };
            }
        } catch (e: any) {
            this.responseData = setErrorMessageForGrpc(e);
        }
        callback(null, this.responseData);
    };
    /**
     * Get Property Under review for the current user (Ambassador)
     * @param arg
     * @param callback
     */
    getPropertiesUnderReview = async (args: any, callback?: any) => {
        this.setPostedPropertyResponseData();
        try {
            const reqBody = args.request;
            let properties: any = [];
            if (reqBody.roleId === AgentRoleIdEnums.WASALT_PHOTOGRAPHER_TEAM) {
                properties =
                    await PropertyOperationsRepo.getPropertiesUnderReviewForResolver(
                        reqBody
                    );
            } else if (
                reqBody.roleId === AgentRoleIdEnums.WASALT_LISTING_TEAM
            ) {
                properties =
                    await PropertyOperationsRepo.getPropertiesUnderReviewForListingAgent(
                        reqBody
                    );
            }
            const response =
                propertyTransformer.transformPropertyBrief(properties); // transform the db data in required format having only brief info of properties.
            this.responseData.data = response;
        } catch (err: any) {
            logger.error(
                `postPropertycontroller::getAssignedProperties : ${err.message}`
            );
            this.responseData = setErrorMessageForGrpc(err);
        }

        callback(null, this.responseData);
    };

    /**
     * Get performance details for the current user (Ambassador).
     * @param arg
     * @param callback
     */
    getAmbassadorPerformance = async (args: any, callback?: any) => {
        this.setPostedPropertyResponseData();
        try {
            const reqBody = args.request;
            let result: any = {};
            const { startDate, endDate } = this.calculateInterval(
                reqBody.period
            );
            reqBody['startDate'] = startDate;
            reqBody['endDate'] = endDate;
            if (reqBody.roleId === AgentRoleIdEnums.WASALT_PHOTOGRAPHER_TEAM) {
                result =
                    await PropertyOperationsRepo.getPhotographerPerformance(
                        reqBody
                    );
            } else if (
                reqBody.roleId === AgentRoleIdEnums.WASALT_LISTING_TEAM
            ) {
                result =
                    await PropertyOperationsRepo.getListingAgentPerformance(
                        reqBody
                    );
            } else {
                result = await PropertyOperationsRepo.getQCPerformance(reqBody);
            }
            this.responseData.data = result;
        } catch (err: any) {
            logger.error(
                `postPropertycontroller::getAssignedProperties : ${err.message}`
            );
            this.responseData = setErrorMessageForGrpc(err);
        }

        callback(null, this.responseData);
    };

    /**
     * Get start and end dates for a period interval.
     * @param period
     */
    calculateInterval = (period: string) => {
        const startDate = new Date();
        const endDate = new Date();
        switch (period) {
            case 'week':
                startDate.setDate(endDate.getDate() - 7);
                break;
            case 'last_month':
                startDate.setMonth(endDate.getMonth() - 1);
                break;
            case 'current_month':
                startDate.setDate(1);
        }
        return { startDate, endDate };
    };

    /**
     * @desc return details to be rendered on dashboard based on different roles
     */
    getAmbassadorDashboardData = async (args: any, callback: any) => {
        const reqBody = args.request;
        this.setUserPropertyResponseData();
        let data: any;

        try {
            reqBody.reviewStatusMapping =
                await this.getInternalReviewStatusIdMapping();
            if (reqBody.roleId == AgentRoleIdEnums.WASALT_LISTING_TEAM) {
                data = await this.getListingTeamDashboardData(reqBody);
            } else if (
                reqBody.roleId == AgentRoleIdEnums.WASALT_PHOTOGRAPHER_TEAM
            ) {
                data = await this.getPhotographyTeamDashboardData(reqBody);
            } else if (
                reqBody.roleId == AgentRoleIdEnums.WASALT_QUALITY_CHECK_TEAM
            ) {
                data = await this.getQCTeamDashboardData(reqBody);
            }
            this.responseData.data = { listingsCount: data };
        } catch (e: any) {
            this.responseData = setErrorMessageForGrpc(e);
        }
        callback(null, this.responseData);
    };

    /**
     * @desc returns counts of drafts, reassigned listings etc for listing agent
     * to render on Listing Agent dashboard
     */
    getListingTeamDashboardData = async (data: any) => {
        const { reviewStatusMapping } = data;
        //get count of current user listings which are incomplete
        const draftCount = await PropertyOperationsRepo.getPostPropertyCount({
            userId: data.userId,
            status: PostPropertyStatus.DRAFT,
        });
        //get bifurcated count of current user listings for dashboard
        const dashboardData =
            await PropertyOperationsRepo.getListingAgentDashboardData({
                userId: data.userId,
                reviewInProgressStatus:
                    reviewStatusMapping[
                        InternalReviewStatusSlugEnum.IN_PROGRESS
                    ],
                reviewReassignedStatus:
                    reviewStatusMapping[
                        InternalReviewStatusSlugEnum.RE_ASSIGNED
                    ],
            });
        const {
            pendingbyqccount,
            pendingbyphotographercount,
            reassignedcount,
        } = dashboardData && (dashboardData[0][0] as any);
        return {
            drafts: draftCount,
            reAssigned: reassignedcount,
            pendingByPhotographyTeam: pendingbyphotographercount,
            pendingByQCTeam: pendingbyqccount,
        };
    };

    /**
     * @desc returns counts of assigned, pending listings etc for Photographer
     * to render on Photographer dashboard
     */
    getPhotographyTeamDashboardData = async (data: any) => {
        const { reviewStatusMapping } = data;
        const dashboardData =
            await PropertyOperationsRepo.getPhotographerDashboardData({
                userId: data.userId,
                reviewInProgressStatus:
                    reviewStatusMapping[
                        InternalReviewStatusSlugEnum.IN_PROGRESS
                    ],
                reviewReassignedStatus:
                    reviewStatusMapping[
                        InternalReviewStatusSlugEnum.RE_ASSIGNED
                    ],
                reviewResolvedStatus:
                    reviewStatusMapping[InternalReviewStatusSlugEnum.RESOLVED],
            });
        const { assignedlistingscount, pendingbyqccount } =
            dashboardData && (dashboardData[0][0] as any);
        return {
            assigned: assignedlistingscount,
            pendingByQCTeam: pendingbyqccount,
        };
    };

    /**
     * @desc returns counts of assigned listings etc for QC agent
     * to render on QC dashboard
     */
    getQCTeamDashboardData = async (data: any) => {
        const { reviewStatusMapping } = data;
        const dashboardData = await PropertyOperationsRepo.getQCDashboardData({
            userId: data.userId,
            reviewInProgressStatus:
                reviewStatusMapping[InternalReviewStatusSlugEnum.IN_PROGRESS],
        });
        const { assignedlistingscount } =
            dashboardData && (dashboardData[0][0] as any);
        return {
            assigned: assignedlistingscount,
        };
    };

    /**
     * @desc all status of reviews from type masters(in_progress, resolved etc)
     * and return a mapping with their slug and id
     */
    getInternalReviewStatusIdMapping = async () => {
        let internalReviewStatusIdMapping: any = {};
        let internalReviewStatusArr: any = [];

        let typeMasterResult = await redisCache.getValue(
            TYPE_MASTERS_REDIS_KEY
        );
        if (typeMasterResult) {
            typeMasterResult = JSON.parse(typeMasterResult);
            internalReviewStatusArr = typeMasterResult.filter(
                (item: any) =>
                    item.type == 'internal_property_review_status_type' &&
                    item.isActive
            );
        } else {
            //if not in cache, fetch type master data from utility service
            const typeMasterResponse =
                await utilityGrpcService.getTypeMasterDataByType({
                    types: ['internal_property_review_status_type'],
                });
            if (typeMasterResponse.error) {
                throw new Error(typeMasterResponse.error);
            }
            internalReviewStatusArr = typeMasterResponse?.data;
        }
        //create mapping
        internalReviewStatusArr.forEach((item: any) => {
            internalReviewStatusIdMapping[item.slug] = item.id;
        });
        return internalReviewStatusIdMapping;
    };
}
