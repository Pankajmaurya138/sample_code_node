import { PropertyFile } from '../../models/propertyFile.model';
import { Property } from '../../models/property.model';
import { literal, Sequelize } from 'sequelize';
import {
    PropertyErrorCodes,
    InternalReviewStatusSlugEnum,
    AgentRoleIdEnums,
    MessageEntityTypes,
    InternalReviewEntityTypes,
} from '../../util/enums';
import { TypeMaster } from '../../models/typeMaster.model';
import { InternalTeamReview } from '../../models/internalTeamReviews.model';
import { SellerProperties } from '../../models/sellerProperties.model';
import { Message } from '../../models/messages.model';
import { propertyAttributes } from '../../util/static';
import i18next from 'i18next';
import { PropertyStatusLog } from '../../models/propertyStatusLog.model';
import rabbitMQService from '../../util/rabbitmqcon';
import logger from '../../util/logger';
import { Op } from 'sequelize';
import { PropertyFileUser } from '../../models/propertyFileUser.model';
import { sequelize } from '../../models/sequelize';
import { PostProperty } from '../../models/postProperty.model';

class PropertyOperationsRepository {
    private enAttr: any = [
        'id',
        ['en_title', 'title'],
        'slug',
        ['en_property_status_type', 'propertyStatusType'],
        ['en_property_source_type', 'sourceType'],
        ['en_description', 'description'],
        ['en_address', 'address'],
        ['en_property_main_type', 'propertyMainType'], //change source column name
        ['en_property_type', 'propertyType'], //newly added
        // ["en_property_type_option", "propertyMainTypeOption"],
        'publishedAt',
        'createdAt',
        ['no_of_bedrooms', 'noOfBedrooms'],
        ['no_of_bathrooms', 'noOfBathrooms'],
        ['owner_phone_number', 'phoneNumber'],
        ['phone_number_country_code', 'phoneNumberCountryCode'],
        ['en_unit_type', 'unitType'],
        ['built_up_area', 'builtUpArea'],
        ['carpet_area', 'carpetArea'],
        ['en_currency_type', 'currencyType'],
        ['sale_price', 'salePrice'],
        ['expected_rent', 'expectedRent'],
        ['yearly_charges', 'yearlyCharges'],
        ['user_id', 'userId'],
        ['owner_full_name', 'fullName'],
        ['external_360_link', 'external360Link'],
        ['external_video_link', 'externalVideoUrl'],
        [<any>literal(`published_at + INTERVAL '30d'`), 'expiryDate'],
        ['en_user_role', 'role'],
        ['en_property_region_type', 'propertyRegionType'],
        'sourceTypeId',
        'isRecommended',
        'isSold',
        'isHotDeal',
        'isExclusive',
        'isFeatured',
        'isInspected',
        'isWhatsappLater',
        'propertyRegionId',
        'mainTypeId',
        'listingTypeId',
        'statusTypeId',
        'darReference',
        'updatedAt',
        'postPropertyId',
    ];
    private arAttr: any = [
        'id',
        ['ar_title', 'title'],
        'slug',
        ['ar_property_status_type', 'propertyStatusType'],
        ['ar_description', 'description'],
        ['ar_address', 'address'],
        ['ar_property_source_type', 'source'],
        ['ar_property_main_type', 'propertyMainType'],
        ['ar_property_type', 'propertyType'],
        // ["ar_property_type_option", "propertyMainTypeOption"],
        'publishedAt',
        'createdAt',
        ['no_of_bedrooms', 'noOfBedrooms'],
        ['no_of_bathrooms', 'noOfBathrooms'],
        ['ar_unit_type', 'unitType'],
        ['built_up_area', 'builtUpArea'],
        ['carpet_area', 'carpetArea'],
        ['ar_currency_type', 'currencyType'],
        ['sale_price', 'salePrice'],
        ['expected_rent', 'expectedRent'],
        ['yearly_charges', 'yearlyCharges'],
        ['user_id', 'userId'],
        ['owner_full_name', 'fullName'],
        ['external_360_link', 'external360Link'],
        ['external_video_link', 'externalVideoUrl'],
        [<any>literal(`published_at + INTERVAL '30d'`), 'expiryDate'],
        ['ar_user_role', 'role'],
        ['ar_property_region_type', 'propertyRegionType'],
        ['owner_phone_number', 'phoneNumber'],
        ['phone_number_country_code', 'phoneNumberCountryCode'],
        'sourceTypeId',
        'isRecommended',
        'isSold',
        'isHotDeal',
        'isExclusive',
        'isFeatured',
        'isInspected',
        'isWhatsappLater',
        'propertyRegionId',
        'mainTypeId',
        'listingTypeId',
        'statusTypeId',
        'darReference',
        'updatedAt',
        'postPropertyId',
    ];

    // set the property attributes for API response with their corresponding unit types and icon class
    setPropertyAttributeResponse = (data: any = {}, locale: string) => {
        let attributes: any = [];
        propertyAttributes.forEach((attribute) => {
            // check if studio apartment then bedroom should display in attributes even value 0 otherwise do not display.
            const isStudioApartmentBedRoom =
                data.propertyType === 'Apartment' &&
                attribute.key == 'noOfBedrooms' &&
                data[attribute.key] == 0;
            if (isStudioApartmentBedRoom || data[attribute.key]) {
                let newData = {
                    key: attribute.key,
                    name: i18next.t(attribute.key, { lng: locale }),
                    value: data[attribute.key],
                    image: attribute.image,
                    unit: data[attribute.unitKey] || '',
                    iconClass: attribute.iconClass,
                };
                if (attribute.key == 'completionYear' && data[attribute.key]) {
                    newData.value =
                        new Date().getFullYear() - data[attribute.key];
                    if (
                        !newData.value ||
                        newData.value == NaN ||
                        newData.value < 0
                    )
                        newData.value = 0;
                    newData.unit = i18next.t(attribute.unitKey, {
                        lng: locale,
                    });
                }
                attributes.push(newData);
            } else {
                let newData = {
                    key: attribute.key || '',
                    name: i18next.t(attribute.key, { lng: locale }) || '',
                    value: data[attribute.key] || '',
                    image: attribute.image || '',
                    unit: data[attribute.unitKey] || '',
                    iconClass: attribute.iconClass,
                };
                attributes.push(newData);
            }
        });
        return attributes;
    };

    // get the last property review by property id
    getLastPropertyReview = async (reqBody: Record<string, any>) => {
        return InternalTeamReview.findOne({
            where: { entityId: reqBody.propertyId },
            include: [
                {
                    model: TypeMaster,
                },
            ],
            order: [['updatedAt', 'DESC']],
        });
    };

    // add internal property review table entry with the reviewer same as the last reviewer
    assignPropertyToLastQC = async (reqBody: Record<string, any>) => {
        const resolvedStatusType = await TypeMaster.findOne({
            where: { slug: InternalReviewStatusSlugEnum.RESOLVED },
        });
        const inProgressStatusType = await TypeMaster.findOne({
            where: { slug: InternalReviewStatusSlugEnum.IN_PROGRESS },
        });
        await InternalTeamReview.update(
            {
                statusId: resolvedStatusType.id,
            },
            {
                where: {
                    id: reqBody.id,
                },
            }
        );

        const review = await InternalTeamReview.create({
            reviewerRoleId: reqBody.reviewerRoleId,
            reviewerId: reqBody.reviewerId,
            entityType: reqBody.entityType,
            entityId: reqBody.entityId,
            statusId: inProgressStatusType.id,
        });

        // Rabbit MQ event trigger on property submission for verification.
        await rabbitMQService.propertySubmittedForReview({
            reviewerId: reqBody.reviewerId,
            propertyId: reqBody.entityId,
            reviewerRoleId: reqBody.reviewerRoleId,
        });

        return review;
    };

    // add internal property review table entry when the property is submitted for qc verification
    createPropertyReview = async (reqBody: Record<string, any>) => {
        const inProgressStatusType = await TypeMaster.findOne({
            where: { slug: InternalReviewStatusSlugEnum.IN_PROGRESS },
        });

        const review = await InternalTeamReview.create({
            reviewerRoleId: AgentRoleIdEnums.WASALT_QUALITY_CHECK_TEAM,
            reviewerId: reqBody.reviewerId,
            entityType: 'property',
            entityId: reqBody.propertyId,
            statusId: inProgressStatusType.id,
        });

        // Rabbit MQ event trigger on property submission for verification.
        await rabbitMQService.propertySubmittedForReview({
            reviewerId: reqBody.reviewerId,
            propertyId: reqBody.propertyId,
            reviewerRoleId: AgentRoleIdEnums.WASALT_QUALITY_CHECK_TEAM,
        });
        return review;
    };

    /**
     * @description Add a resolver_id with message and meta for a review of property
     * @param reqBody
     */
    reAssignPropertyToUser = async (reqBody: Record<string, any>) => {
        const statusType = await TypeMaster.findOne({
            where: { slug: InternalReviewStatusSlugEnum.RE_ASSIGNED },
        });
        await InternalTeamReview.update(
            {
                stagesMeta: reqBody.stagesMeta,
                resolverRoleId: reqBody.resolverRoleId,
                resolverId: reqBody.resolverId,
                statusId: statusType.id,
                reassignedAt: new Date(),
            },
            {
                where: {
                    id: reqBody.reviewId,
                },
            }
        );

        if (reqBody.message) {
            await Message.create({
                entityId: reqBody.reviewId,
                message: reqBody.message,
                entityType: MessageEntityTypes.INTERNAL_TEAM_REVIEWS,
                userId: reqBody.reviewerId,
            });
        }

        // Rabbit MQ event trigger on property reassigned to a resolver.
        await rabbitMQService.propertyReassignedToResolver({
            resolverRoleId: reqBody.resolverRoleId,
            resolverId: reqBody.resolverId,
            propertyId: reqBody.propertyId,
        });
        return;
    };

    /**
     * @description Get list of properties re-assigned by reviewer to current user.
     * @param reqBody
     */
    getReassignedProperties = async (reqBody: Record<string, any>) => {
        const statusType = await TypeMaster.findOne({
            where: { slug: InternalReviewStatusSlugEnum.RE_ASSIGNED },
        });
        const reAssignedReviews = await InternalTeamReview.findAll({
            where: {
                entityType: InternalReviewEntityTypes.PROPERTY,
                resolverId: reqBody.userId,
                resolverRoleId: reqBody.roleId,
                statusId: statusType.id,
            },
        });
        if (reAssignedReviews.length) {
            const ids = reAssignedReviews.map((review: any) => review.entityId);
            const additionalAttributes = [
                ['owner_phone_number', 'phoneNumber'],
                ['phone_number_country_code', 'phoneNumberCountryCode'],
                [
                    literal(
                        `(SELECT COUNT(*) FROM internal_team_reviews WHERE internal_team_reviews.entity_id = id and internal_team_reviews.entity_type='${InternalReviewEntityTypes.PROPERTY}' and internal_team_reviews.resolver_id=${reqBody.userId} and internal_team_reviews.resolver_role_id='${reqBody.roleId}')`
                    ),
                    'reviewsCount',
                ],
            ];
            const properties: any = await this.getSellerPropertiesByPropertyIds(
                ids,
                reqBody.locale,
                additionalAttributes
            );

            return properties.map((property: Record<string, any>) => ({
                ...property,
                attributes: this.setPropertyAttributeResponse(
                    property.dataValues,
                    reqBody.locale
                ),
            }));
        }
        return [];
    };

    /**
     * @description Get list of properties assigned for review to current user.
     * @param reqBody
     */
    getAssignedProperties = async (reqBody: any) => {
        const inProgressStatusType = await TypeMaster.findOne({
            where: { slug: InternalReviewStatusSlugEnum.IN_PROGRESS },
        });
        const pendingReviews = await InternalTeamReview.findAll({
            where: {
                entityType: InternalReviewEntityTypes.PROPERTY,
                reviewerId: reqBody.userId,
                statusId: inProgressStatusType.id,
            },
        });
        if (pendingReviews.length) {
            const ids = pendingReviews.map((review: any) => review.entityId);
            const additionalAttributes = [
                [
                    literal(
                        `(SELECT COUNT(*) FROM internal_team_reviews WHERE internal_team_reviews.entity_id = id and internal_team_reviews.entity_type='${InternalReviewEntityTypes.PROPERTY}' and  internal_team_reviews.reviewer_id=${reqBody.userId})`
                    ),
                    'reviewsCount',
                ],
            ];
            const properties: any = await this.getSellerPropertiesByPropertyIds(
                ids,
                reqBody.locale,
                additionalAttributes
            );
            return properties.map((property: Record<string, any>) => ({
                ...property,
                attributes: this.setPropertyAttributeResponse(
                    property.dataValues,
                    reqBody.locale
                ),
            }));
        }
        return [];
    };

    /**
     * @description Get data from seler_properties view from given array of property ids.
     * @param ids array of property ids
     * @param locale locale for language translation
     */
    getSellerPropertiesByPropertyIds = async (
        ids: number[],
        locale: string,
        additionalAttributes: Array<any> = []
    ) => {
        return SellerProperties.findAll({
            where: {
                id: ids,
            },
            attributes: [
                ...(locale === 'en' ? this.enAttr : this.arAttr),
                ...additionalAttributes,
            ],
            include: [
                {
                    model: PropertyFile,
                },
            ],
        });
    };

    /**
     * @description Get list of reviews of a property filtered by resolver_id.
     * @param reqBody
     */
    getPropertyReviewsForResolver = async (reqBody: any) => {
        return InternalTeamReview.findAll({
            attributes: [
                'id',
                'status_id',
                'stagesMeta',
                'createdAt',
                'entityId',
                [
                    literal(
                        `(SELECT name FROM type_master_translations WHERE type_master_translations.type_master_id = status_id  and type_master_translations.locale='${reqBody.locale}')`
                    ),
                    'statusName',
                ],
                [
                    literal(
                        `(SELECT full_name FROM user_infos WHERE user_infos.user_id = resolver_id)`
                    ),
                    'resolverName',
                ],
                [
                    literal(
                        `(SELECT full_name FROM user_infos WHERE user_infos.user_id = reviewer_id)`
                    ),
                    'reviewerName',
                ],
                [
                    literal(
                        `(SELECT title FROM property_translations WHERE property_translations.property_id = entity_id and property_translations.locale='${reqBody.locale}' limit 1)`
                    ),
                    'propertyTitle',
                ],
                [
                    literal(
                        `(SELECT message FROM messages WHERE messages.entity_id = "InternalTeamReview"."id" and messages.entity_type='internal_team_reviews')`
                    ),
                    'message',
                ],
            ],
            where: {
                entityId: reqBody.propertyId,
                resolverId: reqBody.userId,
                resolverRoleId: reqBody.roleId,
            },
        });
    };

    /**
     * @description Get list of reviews of a property filtered by reviewer_id.
     * @param reqBody
     */
    getPropertyReviewsForReviewer = async (reqBody: any) => {
        return InternalTeamReview.findAll({
            attributes: [
                'id',
                'status_id',
                'stagesMeta',
                'createdAt',
                'entityId',
                [
                    literal(
                        `(SELECT name FROM type_master_translations WHERE type_master_translations.type_master_id = status_id  and type_master_translations.locale='${reqBody.locale}')`
                    ),
                    'statusName',
                ],
                [
                    literal(
                        `(SELECT full_name FROM user_infos WHERE user_infos.user_id = resolver_id)`
                    ),
                    'resolverName',
                ],
                [
                    literal(
                        `(SELECT full_name FROM user_infos WHERE user_infos.user_id = reviewer_id)`
                    ),
                    'reviewerName',
                ],
                [
                    literal(
                        `(SELECT title FROM property_translations WHERE property_translations.property_id = entity_id and property_translations.locale='${reqBody.locale}' limit 1)`
                    ),
                    'propertyTitle',
                ],
                [
                    literal(
                        `(SELECT message FROM messages WHERE messages.entity_id = "InternalTeamReview"."id" and messages.entity_type='internal_team_reviews')`
                    ),
                    'message',
                ],
            ],
            where: {
                entityId: reqBody.propertyId,
                reviewerId: reqBody.userId,
            },
        });
    };

    /**
     * @description Change the status of review and property to approved.
     * @param reqBody
     */
    approveProperty = async (reqBody: any) => {
        const approvedStatus = await TypeMaster.findOne({
            where: { slug: InternalReviewStatusSlugEnum.APPROVED },
        });

        await InternalTeamReview.update(
            { statusId: approvedStatus.id },
            { where: { id: reqBody.reviewId } }
        );
        await Property.update(
            {
                statusTypeId: PropertyErrorCodes.APPROVED,
                publishedAt: new Date(),
            },
            { where: { id: reqBody.propertyId } }
        );
        const savedLog: any = await PropertyStatusLog.create({
            status_type_id: PropertyErrorCodes.APPROVED,
            user_id: reqBody.userId,
            property_id: reqBody.propertyId,
        });
        const property = await Property.findByPk(reqBody.propertyId);
        await rabbitMQService.propertyApproved({
            propertyId: reqBody.propertyId,
            PropertyStatusLogId: savedLog.id,
        });
        let metaData = [
            {
                id: reqBody.propertyId,
                onTop: property.is_show_on_top,
                insert: true,
            },
        ];
        if (property.is_show_on_top) {
            let updatedShowOnTopPropertyId = await this.updateShowOnTopProperty(
                reqBody.propertyId
            );
            if (updatedShowOnTopPropertyId && updatedShowOnTopPropertyId.id) {
                metaData.push({
                    id: updatedShowOnTopPropertyId.id,
                    onTop: false,
                    insert: false,
                });
            }
        }
        rabbitMQService.publishToAddProperty({
            environment: process.env.NODE_ENV,
            metaData: metaData,
        });

        rabbitMQService.postPropertyStatusChange({
            lang: <string>reqBody.locale,
            propertyId: reqBody.propertyId,
        });
    };

    updateShowOnTopProperty = async (propertyId: number) => {
        try {
            let propertyShowOnTop: any = await Property.findAll({
                where: {
                    is_show_on_top: true,
                    id: {
                        [Op.not]: propertyId,
                    },
                },
                order: [['published_at', 'ASC']],
            });
            if (propertyShowOnTop.length >= 2) {
                propertyShowOnTop[0].update({ is_show_on_top: false });
                return propertyShowOnTop[0];
            }
            return true;
        } catch (err: any) {
            logger.error(
                `PropertyModel::updateLastShowOnTopProperty : ${err.message}`
            );
            throw err;
        }
    };

    /**
     * @description Change the status of review and property to rejected.
     * @param reqBody
     */
    rejectProperty = async (reqBody: any) => {
        const rejectedStatus = await TypeMaster.findOne({
            where: { slug: InternalReviewStatusSlugEnum.REJECTED },
        });

        await InternalTeamReview.update(
            { statusId: rejectedStatus.id },
            { where: { id: reqBody.reviewId } }
        );
        await Property.update(
            { statusTypeId: PropertyErrorCodes.REJECTED },
            { where: { id: reqBody.propertyId } }
        );
        const savedLog: any = await PropertyStatusLog.create({
            status_type_id: PropertyErrorCodes.REJECTED,
            user_id: reqBody.userId,
            property_id: reqBody.propertyId,
        });
        rabbitMQService.propertyRejected({
            propertyId: reqBody.propertyId,
            PropertyStatusLogId: savedLog.id,
        });
        rabbitMQService.publishToDeleteProperty({
            environment: process.env.NODE_ENV,
            propertyId: reqBody.propertyId,
        });

        rabbitMQService.postPropertyStatusChange({
            lang: <string>reqBody.locale,
            propertyId: reqBody.propertyId,
        });
    };

    /**
     * @description Get counts of reassigned listings
     * @param reqBody
     */
    getListingsPendingByOtherTeamCount = async (reqBody: any) => {
        const whereCond: any = {
            statusId: reqBody.statusId,
        };
        if (reqBody.teamRoleId == AgentRoleIdEnums.WASALT_QUALITY_CHECK_TEAM) {
            whereCond.reviewerRoleId = reqBody.teamRoleId;
        } else if (
            reqBody.teamRoleId == AgentRoleIdEnums.WASALT_PHOTOGRAPHER_TEAM
        ) {
            whereCond.resolverRoleId = reqBody.teamRoleId;
        }
        const count = await InternalTeamReview.count({
            where: {
                ...whereCond,
                entityId: {
                    [Op.in]: Sequelize.literal(
                        `(SELECT id from properties where properties.added_by='${reqBody.userId}')`
                    ),
                },
            },
        });
        console.log('count is', count);
        return count;
    };

    /**
     * @description Get counts of reassigned listings
     * @param reqBody
     */
    getPhotographerAssignedListingsCount = async (reqBody: any) => {
        const count = await InternalTeamReview.count({
            where: {
                resolverRoleId: reqBody.resolverRoleId,
                resolverId: reqBody.resolverId,
                statusId: reqBody.statusId,
            },
        });
        console.log('count is', count);
        return count;
    };

    /**
     * @description Get counts of reassigned listings
     * @param reqBody
     */
    getQCAssignedListingsCount = async (reqBody: any) => {
        return InternalTeamReview.count({
            where: {
                reviewerRoleId: reqBody.reviewerRoleId,
                reviewerId: reqBody.reviewerId,
                statusId: reqBody.statusId,
            },
        });
    };

    /**
     * @description Get counts of reassigned listings
     * @param reqBody
     */
    getPhotographerListingsPendingByQcCount = async (reqBody: any) => {
        return InternalTeamReview.count({
            where: {
                resolverId: reqBody.resolverId,
                resolverRoleId: reqBody.resolverRoleId,
                statusId: reqBody.statusId,
                [Op.and]: Sequelize.literal(
                    `exists (select id from internal_team_reviews where reviewer_role_id = ${AgentRoleIdEnums.WASALT_QUALITY_CHECK_TEAM} and status_id = ${reqBody.inProgressStatusId} )`
                ),
            },
        });
    };
    // get the list of properties which are under review and whose issue is resolved by current user.
    getPropertiesUnderReviewForResolver = async (reqBody: any) => {
        const inProgressStatusType = await TypeMaster.findOne({
            where: { slug: InternalReviewStatusSlugEnum.IN_PROGRESS },
        });
        const resolvedStatusType = await TypeMaster.findOne({
            where: { slug: InternalReviewStatusSlugEnum.RESOLVED },
        });
        const pendingReviews = await InternalTeamReview.findAll({
            where: {
                entityType: InternalReviewEntityTypes.PROPERTY,
                resolverId: reqBody.userId,
                resolverRoleId: reqBody.roleId,
                statusId: resolvedStatusType.id,
                entityId: {
                    [Op.in]: Sequelize.literal(
                        `(SELECT entity_id from internal_team_reviews where internal_team_reviews.entity_type='${InternalReviewEntityTypes.PROPERTY}' and internal_team_reviews.entity_id="InternalTeamReview"."entity_id" and internal_team_reviews.status_id='${inProgressStatusType.id}')`
                    ),
                },
            },
        });
        if (pendingReviews.length) {
            const ids = pendingReviews.map((review: any) => review.entityId);
            const properties: any = await this.getSellerPropertiesByPropertyIds(
                ids,
                reqBody.locale
            );
            return properties.map((property: Record<string, any>) => ({
                ...property,
                attributes: this.setPropertyAttributeResponse(
                    property.dataValues,
                    reqBody.locale
                ),
            }));
        }
        return [];
    };

    // get the list of properties which are under review and are posted by current user.
    getPropertiesUnderReviewForListingAgent = async (reqBody: any) => {
        const inProgressStatusType = await TypeMaster.findOne({
            where: { slug: InternalReviewStatusSlugEnum.IN_PROGRESS },
        });
        const reAssignedStatusType = await TypeMaster.findOne({
            where: { slug: InternalReviewStatusSlugEnum.RE_ASSIGNED },
        });
        const where: any = {
            entityType: InternalReviewEntityTypes.PROPERTY,
        };
        if (
            reqBody.assignedRole === AgentRoleIdEnums.WASALT_PHOTOGRAPHER_TEAM
        ) {
            where['resolverRoleId'] = reqBody.assignedRole;
            where['statusId'] = reAssignedStatusType.id;
        } else {
            where['reviewerRoleId'] = reqBody.assignedRole;
            where['statusId'] = inProgressStatusType.id;
        }
        const pendingReviews = await InternalTeamReview.findAll({
            where,
        });
        if (pendingReviews.length) {
            const ids = pendingReviews.map((review: any) => review.entityId);
            const properties: any = await SellerProperties.findAll({
                where: {
                    id: ids,
                    addedBy: reqBody.userId,
                    statusTypeId: PropertyErrorCodes.BRE_VERIFICATION,
                },
                attributes: reqBody.locale === 'en' ? this.enAttr : this.arAttr,

                include: [
                    {
                        model: PropertyFile,
                    },
                ],
            });
            return properties.map((property: Record<string, any>) => ({
                ...property,
                attributes: this.setPropertyAttributeResponse(
                    property.dataValues,
                    reqBody.locale
                ),
            }));
        }
        return [];
    };

    // Get performance details for a qc agent.
    getQCPerformance = async (reqBody: any) => {
        // get the ids of approved properties which were approved between two dates.
        const ids = await this.getApprovedPropertyIdsBetweenDates(
            reqBody.startDate,
            reqBody.endDate
        );
        // get the count of reviews in which current user was a reviewer and the entity_id is among the array of ids passed.
        const reviewCounts: any = await InternalTeamReview.count({
            attributes: ['reviewerId'],
            where: {
                reviewerId: reqBody.userId,
                reviewerRoleId: reqBody.roleId,
                entityType: InternalReviewEntityTypes.PROPERTY,
                entityId: {
                    [Op.in]: ids,
                },
            },
            group: ['reviewerId'],
            distinct: true,
            col: 'entityId',
        });
        let liveListings = 0;
        if (reviewCounts.length) {
            liveListings = reviewCounts[0].count;
        }
        // get the count of reviews in which current user was a reviewer and they were reassigned to someone between two dates.
        const reAssignedCount: any = await InternalTeamReview.count({
            attributes: ['reviewerId'],
            where: {
                reviewerId: reqBody.userId,
                reviewerRoleId: reqBody.roleId,
                entityType: InternalReviewEntityTypes.PROPERTY,
                reassignedAt: {
                    [Op.lte]: reqBody.endDate,
                    [Op.gt]: reqBody.startDate,
                },
            },
            group: ['reviewerId'],
        });
        let reassignedListings = 0;
        if (reAssignedCount.length) {
            reassignedListings = reAssignedCount[0].count;
        }
        // get the average difference of timestamps reassigned_at and created_at of reviews in which userId was a reviewer.
        const sqlResponse: any = await sequelize.query(
            `SELECT AVG((case when reassigned_at is not null then reassigned_at else updated_at end)-created_at) from internal_team_reviews where reviewer_role_id='${reqBody.roleId}' and reviewer_id='${reqBody.userId}' and entity_type='${InternalReviewEntityTypes.PROPERTY}' and  entity_id in (${ids})`
        );
        let avgTATinHours = 0;
        if (sqlResponse[0][0].avg) {
            const interval = sqlResponse[0][0].avg;
            avgTATinHours = +this.parsePostgresIntervalToHours(interval);
            return { liveListings, avgTATinHours };
        }

        return { liveListings, reassignedListings, avgTATinHours };
    };

    // Get performance details for a listing agent.
    getListingAgentPerformance = async (reqBody: any) => {
        // get the count of approved properties posted by current user and were approved between two dates.
        const listingCounts: any = await Property.count({
            attributes: ['statusTypeId'],
            where: {
                addedBy: reqBody.userId,
                updatedAt: {
                    [Op.lte]: reqBody.endDate,
                    [Op.gt]: reqBody.startDate,
                },
                statusTypeId: PropertyErrorCodes.APPROVED,
            },
            group: ['statusTypeId'],
        });
        let liveListings = 0;
        if (listingCounts.length) {
            liveListings = listingCounts[0]['count'];
        }
        // get the average difference of timestamps updated_at and created_at of approved properties which were posted by current user and they were approved between two dates.
        const sqlResponse: any = await sequelize.query(
            `SELECT AVG(updated_at-created_at) from properties where added_by='${
                reqBody.userId
            }' and status_type_id='${
                PropertyErrorCodes.APPROVED
            }' and updated_at between '${reqBody.startDate.toDateString()}' and '${reqBody.endDate.toDateString()}'`
        );
        let avgTATinHours = 0;
        if (sqlResponse[0][0].avg) {
            const interval = sqlResponse[0][0].avg;
            avgTATinHours = +this.parsePostgresIntervalToHours(interval);
        }
        // get the number of sellers onboarded by current user between two dates.
        const sellersCountResponse: any = await sequelize.query(
            `SELECT COUNT(id) from listing_agent_users where user_id='${
                reqBody.userId
            }' and created_at between '${reqBody.startDate.toDateString()}' and '${reqBody.endDate.toDateString()}'`
        );
        let sellersOnboarded = 0;
        if (sellersCountResponse[0][0].count) {
            sellersOnboarded = sellersCountResponse[0][0].count;
        }

        return {
            liveListings,
            avgTATinHours: avgTATinHours.toFixed(2),
            sellersOnboarded,
        };
    };

    // Get performance details for a photographer.
    getPhotographerPerformance = async (reqBody: any) => {
        const resolvedStatusType = await TypeMaster.findOne({
            where: { slug: InternalReviewStatusSlugEnum.RESOLVED },
        });
        // get the ids of approved properties which were approved between two dates.
        const ids = await this.getApprovedPropertyIdsBetweenDates(
            reqBody.startDate,
            reqBody.endDate
        );
        // get the count of reviews in which current user was a resolver and the entity_id is among the array of ids passed.
        const reviewCounts: any = await InternalTeamReview.count({
            attributes: ['resolverId'],
            where: {
                resolverId: reqBody.userId,
                resolverRoleId: reqBody.roleId,
                entityType: InternalReviewEntityTypes.PROPERTY,
                entityId: {
                    [Op.in]: ids,
                },
            },
            group: ['resolverId'],
            distinct: true,
            col: 'entityId',
        });
        let liveListings = 0;
        if (reviewCounts.length) {
            liveListings = reviewCounts[0].count;
        }
        // get the number of property files added by current user and the propertyId is among the array of ids passed.
        const fileCount: any = await PropertyFile.count({
            attributes: ['property_id'],
            where: {
                property_id: {
                    [Op.in]: ids,
                },
            },
            include: [
                {
                    model: PropertyFileUser,
                    where: {
                        userId: reqBody.userId,
                        roleId: reqBody.roleId,
                    },
                },
            ],
            group: ['property_id'],
        });
        let imagesUploaded = 0;
        if (fileCount.length) {
            imagesUploaded = reviewCounts[0].count;
        }
        // get the average difference of timestamps updated_at and reassigned_at of reviews in which current user was a resolver and the entity_id is among the array of ids passed.s.
        const sqlResponse: any = await sequelize.query(
            `SELECT AVG(updated_at-reassigned_at) from internal_team_reviews where resolver_role_id='${reqBody.roleId}' and resolver_id='${reqBody.userId}' and entity_type='${InternalReviewEntityTypes.PROPERTY}' and  entity_id in (${ids}) and status_id='${resolvedStatusType.id}'`
        );
        let avgTATinHours = 0;
        if (sqlResponse[0][0].avg) {
            const interval = sqlResponse[0][0].avg;
            avgTATinHours = +this.parsePostgresIntervalToHours(interval);
            return { liveListings, avgTATinHours };
        }
        return {
            liveListings,
            imagesUploaded,
            avgTATinHours: avgTATinHours.toFixed(2),
            avgImagesPerListing: imagesUploaded / liveListings || 0,
        };
    };

    // get the list of ids of properties which are approved between startdate and endDate.
    getApprovedPropertyIdsBetweenDates = async (
        startDate: Date,
        endDate: Date
    ) => {
        const properties = await Property.findAll({
            attributes: ['id'],
            where: {
                updatedAt: {
                    [Op.lte]: endDate,
                    [Op.gt]: startDate,
                },
                statusTypeId: PropertyErrorCodes.APPROVED,
            },
        });
        return properties.map((property: Record<string, any>) => property.id);
    };

    // convert postgres interval object to hours count.
    parsePostgresIntervalToHours = (interval: Record<string, any>) => {
        let hours = 0;
        if (interval?.days) {
            hours += interval['days'] * 24;
        }
        if (interval?.hours) {
            hours += interval['hours'];
        }

        if (interval?.minutes) {
            hours += interval['minutes'] / 60;
        }
        return hours.toFixed(2);
    };

    /**
     * @description Get Post Property count based on status and userId etc.
     * @param reqBody
     */
    getPostPropertyCount = async (reqBody: any) => {
        return PostProperty.count({
            where: {
                addedBy: reqBody.userId,
                status: reqBody.status,
            },
        });
    };

    /**
     * @description Get Listings counts birfurcation for Listing agent dashboard
     * @param reqBody
     */
    getListingAgentDashboardData = async (reqBody: any) => {
        const { userId, reviewInProgressStatus, reviewReassignedStatus } =
            reqBody;
        return sequelize.query(`select
    sum ( case when status_id = ${reviewInProgressStatus} and reviewer_role_id = ${AgentRoleIdEnums.WASALT_QUALITY_CHECK_TEAM} and resolver_role_id is null and entity_id in 
       ( SELECT id from properties where properties.added_by=${userId})
       then 1 else 0 end) as pendingByQCCount,
    sum ( case when status_id = ${reviewReassignedStatus} and resolver_role_id = ${AgentRoleIdEnums.WASALT_PHOTOGRAPHER_TEAM} and entity_id in 
        ( SELECT id from properties where properties.added_by=${userId})
        then 1 else 0 end) as pendingByPhotographerCount,
    sum ( case when status_id = ${reviewReassignedStatus} and resolver_role_id = ${AgentRoleIdEnums.WASALT_LISTING_TEAM} and resolver_id = ${userId} 
        then 1 else 0 end) as reAssignedCount
    from internal_team_reviews`);
    };

    /**
     * @description Get Listings counts birfurcation for Photographer dashboard
     * @param reqBody
     */
    getPhotographerDashboardData = async (reqBody: any) => {
        const {
            userId,
            reviewInProgressStatus,
            reviewResolvedStatus,
            reviewReassignedStatus,
        } = reqBody;
        return sequelize.query(`select
    sum ( case when status_id = ${reviewReassignedStatus} and reviewer_role_id = ${AgentRoleIdEnums.WASALT_QUALITY_CHECK_TEAM} and resolver_role_id = ${AgentRoleIdEnums.WASALT_PHOTOGRAPHER_TEAM} and resolver_id = ${userId} 
       then 1 else 0 end) as assignedlistingscount,
    sum ( case when status_id = ${reviewResolvedStatus} and resolver_role_id = ${AgentRoleIdEnums.WASALT_PHOTOGRAPHER_TEAM} and resolver_id = ${userId} and
     exists (select id from internal_team_reviews where reviewer_role_id = ${AgentRoleIdEnums.WASALT_QUALITY_CHECK_TEAM} and status_id = ${reviewInProgressStatus} )
        then 1 else 0 end) as pendingByQcCount
    from internal_team_reviews`);
    };

    /**
     * @description Get Listings counts birfurcation for QC dashboard
     */
    getQCDashboardData = async (reqBody: any) => {
        const { userId, reviewInProgressStatus } = reqBody;
        return sequelize.query(` select
    sum (case when status_id = ${reviewInProgressStatus} and reviewer_role_id = ${AgentRoleIdEnums.WASALT_QUALITY_CHECK_TEAM} and reviewer_id = ${userId}
       then 1 else 0 end) as assignedListingsCount
    from internal_team_reviews`);
    };

    getCount = async (reqBody: any) => {
        const count = await Property.count({
            where: {
                addedBy: reqBody.userId,
                statusTypeId: reqBody.status,
            },
        });
        return count;
    };
}

const PropertyOperationsRepo = new PropertyOperationsRepository();
export default PropertyOperationsRepo;
