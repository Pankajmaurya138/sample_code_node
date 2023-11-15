var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
import { PropertyService } from '../services/property.service';
import { DocumentService } from '../services/document.service';
import { PropertyPreviewService } from '../services/propertyPreview.service';
import { PropertyOperationsService } from '../services/propertyOperations.service';

export const startGRPServer = async () => {
    var propertyLoader = protoLoader.loadSync('proto/property.proto', {
        keepCase: true,
        longs: String,
        enums: String,
        arrays: true,
    });
    var userPropertyLoader = protoLoader.loadSync('proto/userProperty.proto', {
        keepCase: true,
        longs: String,
        enums: String,
        arrays: true,
    });
    var documentLoader = protoLoader.loadSync('proto/document.proto', {
        keepCase: true,
        longs: String,
        enums: String,
        arrays: true,
    });
    var propertyProto: any = grpc.loadPackageDefinition(propertyLoader);
    var userPropertyProto: any = grpc.loadPackageDefinition(userPropertyLoader);
    var documentProto: any = grpc.loadPackageDefinition(documentLoader);
    const server = new grpc.Server();

    server.addService(propertyProto.PropertyService.service, {
        ping: async (node: any, callback: any) => {
            callback(null, { message: 'done' });
        },
        addPropertyForInternational: new PropertyService()
            .addPropertyForInternational,
        addPropertyForKsa: new PropertyService().addPropertyForKsa,
        editProperty: new PropertyService().editProperty,
        updateProperty: new PropertyService().updateProperty,
        getPropertyById: new PropertyService().getPropertyById,
        getPropertyIdByUnitReference: new PropertyService()
            .getPropertyIdByUnitReference,
        getShortJourney: new PropertyService().getShortJourney,
        postShortJourney: new PropertyService().postShortJourney,
        getLongJourneyPropertyById: new PropertyService()
            .getLongJourneyPropertyById,
        getFeaturePropertyById: new PropertyService().getFeaturePropertyById,
        postFeatureProperty: new PropertyService().postFeatureProperty,
        addLongJourneyProperty: new PropertyService().addLongJourneyProperty,
        getPropertyByPostPropertyId: new PropertyService()
            .getPropertyByPostPropertyId,
        getUserPropertiesByUserId: new PropertyService()
            .getUserPropertiesByUserId,
        getUserPostPropertyStatusCount: new PropertyService()
            .getUserPostPropertyStatusCount,
        updatePostPropertyStatus: new PropertyService()
            .updatePostPropertyStatus,
        postBulkPropertiesCreateByXML: new PropertyService()
            .postBulkPropertiesCreateByXML,
        postBulkProperties: new PropertyService().postBulkProperties,
        PostBulkPropertiesSummary: new PropertyService()
            .postBulkPropertiesSummary,
        assignPropertyToUser: new PropertyService().assignPropertyToUser,
        addPropertyPhotosAndVideo: new PropertyService()
            .addPropertyPhotosAndVideo,
        getPropertyPhotosAndVideo: new PropertyService()
            .getPropertyPhotosAndVideo,
        savePropertyBasicDetails: new PropertyService()
            .savePropertyBasicDetails,
        getPropertyBasicDetails: new PropertyService().getPropertyBasicDetails,
        getAmenities: new PropertyService().getAmenities,
        propertyHolderVerification: new PropertyService()
            .propertyHolderVerification,
        getPropertyHolderVerification: new PropertyService()
            .getPropertyHolderVerification,
        getPropertyHolderVerificationV3: new PropertyService()
            .getPropertyHolderVerificationV3,
        addAmenities: new PropertyService().addAmenities,
        getAssigneeDetails: new PropertyService().getAssigneeDetails,
        savePropertyLocation: new PropertyService().savePropertyLocation,
        getPropertyLocation: new PropertyService().getPropertyLocation,
        removeSubUserFromProperties: new PropertyService()
            .removeSubUserFromProperties,
        editAssigneeDetails: new PropertyService().editAssigneeDetails,
        getPropertyStepData: new PropertyService().getPropertyStepData,
        getPropertyBasicDetailsById: new PropertyService()
            .getPropertyBasicDetailsById,
        getPropertyApprovedDate: new PropertyService().getPropertyApprovedDate,
        getCompanyNameDetails: new PropertyService().getCompanyNameDetails,
        saveCompanyNameDetail: new PropertyService().saveCompanyNameDetail,
        getListingUserVerification: new PropertyService()
            .getListingUserVerification,
        listingUserVerification: new PropertyService().listingUserVerification,
        saveRegaAuthDetails: new PropertyService().saveRegaAuthDetails,
        wathqCrDetails: new PropertyService().wathqCrDetails,
        postPropertyAuthorizationUpload: new PropertyService()
            .postPropertyAuthorizationUpload,
        postPropertyAuthorizationTypeUpdate: new PropertyService()
            .postPropertyAuthorizationTypeUpdate,
        getPostPropertyAuthorization: new PropertyService()
            .getPostPropertyAuthorization,
        getPropertyId: new PropertyService().getPropertyId,
        getPropertyFilesByPropertyIds: new PropertyService()
            .getPropertyFilesByPropertyIds,
        wathqDeedVerification: new PropertyService().wathqDeedVerification,
        regaAdVerification: new PropertyService().regaAdVerification,
        addLongJourneyPropertyV3: new PropertyService()
            .addLongJourneyPropertyV3,
        getLongJourneyPropertyByIdV3: new PropertyService()
            .getLongJourneyPropertyByIdV3,
        postFeaturePropertyV3: new PropertyService().postFeaturePropertyV3,
        getFeaturePropertyByIdV3: new PropertyService()
            .getFeaturePropertyByIdV3,
        addAmenitiesV3: new PropertyService().addAmenitiesV3,
        getAmenitiesV3: new PropertyService().getAmenitiesV3,
        assignPropertyToQC: new PropertyOperationsService().assignPropertyToQC,
        getUserPropertiesByUserIdV3: new PropertyService()
            .getUserPropertiesByUserIdV3,
        // getUserPostPropertyStatusCountV3 : new PropertyService().getUserPostPropertyStatusCountV3,
        getActivePropertyCountByPropertyIds: new PropertyService()
            .getActivePropertyCountByPropertyIds,
        getPropertyDescription: new PropertyService().getPropertyDescription,
        getTitle: new PropertyService().getTitle,
        markPropertyOccupied: new PropertyService().markPropertyOccupied,
        getSubuserPropertiesCount: new PropertyService().getUserPropertiesCount,
        // getUserPostPropertyStatusCountV3 : new PropertyService().getUserPostPropertyStatusCountV3,
        // getPropertyDetailCompletedOrNot: new PropertyService().getPropertyDetailCompletedOrNot,
        getAssignedProperties: new PropertyOperationsService()
            .getAssignedProperties,
        getReassignedProperties: new PropertyOperationsService()
            .getReassignedProperties,
        reAssignPropertyToTeam: new PropertyOperationsService()
            .reAssignPropertyToTeam,
        getTeamReviews: new PropertyOperationsService().getTeamReviews,
        getPropertyPreviewData: new PropertyPreviewService()
            .getPropertyPreviewData,
        rejectProperty: new PropertyOperationsService().rejectProperty,
        pushPropertyToLive: new PropertyOperationsService().pushPropertyToLive,
        getPropertyForAmbassadorById: new PropertyOperationsService()
            .getPropertyForAmbassadorById,
        getPropertyStreetInfoByPropertyId: new PropertyService()
            .getPropertyStreetInfoByPropertyId,
        getPropertyAmenitiesById: new PropertyService()
            .getPropertyAmenitiesById,
        listingUserPropertyBifurcation: new PropertyService()
            .listingUserPropertyBifurcation,
        // getPostPropertyUserForAmbassador: new PropertyOperationsService().getPostPropertyUserForAmbassador,
        getPropertiesUnderReview: new PropertyOperationsService()
            .getPropertiesUnderReview,
        getAmbassadorPerformance: new PropertyOperationsService()
            .getAmbassadorPerformance,
        getAmbassadorDashboardData: new PropertyOperationsService()
            .getAmbassadorDashboardData,
    });
    server.addService(userPropertyProto.PropertyService.service, {
        archiveProperty: new PropertyService().archiveProperty,
        deleteProperty: new PropertyService().deleteProperty,
        renewProperty: new PropertyService().renewProperty,
        unpublishedProperty: new PropertyService().unpublishedProperty,
        updatePropertyStatus: new PropertyService().updatePropertyStatus,
        getUserPropertyStatusCount: new PropertyService()
            .getUserPropertyStatusCount,
        getUserProperty: new PropertyService().getUserProperty,
        transferProperty: new PropertyService().transferProperty,
        searchUserProperty: new PropertyService().searchUserProperty,
        getUserCities: new PropertyService().getUserCities,
    });
    server.addService(documentProto.DocumentService.service, {
        ping: async (node: any, callback: any) => {
            callback(null, { message: 'done' });
        },
        uploadDocuments: new DocumentService().uploadDocuments,
        userDocuments: new DocumentService().userDocuments,
        deleteDocument: new DocumentService().deleteDocument,
    });
    await server.bindAsync(
        `0.0.0.0:${process.env.GRPC_PORT}`,
        grpc.ServerCredentials.createInsecure(),
        (error: any, port: number) => {
            console.log('error', error);
            console.log('port', port);
            server.start();
        }
    );
};
