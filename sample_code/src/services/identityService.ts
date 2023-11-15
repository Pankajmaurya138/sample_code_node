const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

var packageDefinition = protoLoader.loadSync('proto/identity.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true,
});

const IdentityService =
    grpc.loadPackageDefinition(packageDefinition).IdentityService;

const getConnection = () => {
    return process.env.GRPC_URL;
};

const metadata = new grpc.Metadata();
metadata.set('x-service', process.env.IDENTITY_GRPC_SERVICE);

const client = new IdentityService(
    getConnection(),
    grpc.credentials.createInsecure()
);

enum IdentityMethod {
    CHK_CONTACT_EXIS = 'checkContactExistence',
    LOGIN = 'login',
    REGISTER = 'register',
    RESEND_VERIFICATION_CODE = 'resendVerficationCode',
    SET_USER_IQMA_ABSHER = 'setUserIqmaByAbsher',
    RESEND_WHATS_APP_VERIFICATION_CODE = 'resendWhatsAppVerificationCode',
    UPDATE_PHONE = 'updatePhoneNumber',
    UPDATE_PROFILE_PHONE = 'updateProfilePhoneNumber',
    SEND_OTP_TO_PHONE = 'sendOtpToPhone',
    SEND_OTP_TO_WHATS_APP = 'sendOtpToWhatsApp',
    VERIFY_WHATS_APP = 'updateProfileWhatsAppNumber',
    VERIFY_PHONE = 'verifyPhoneNumber',
    VERIFY_EMAIL = 'verifyEmailNumber',
    LOGIN_OTP = 'loginWithOtp',
    VERIFY_LOGIN_OTP = 'verifyLoginOtp',
    FORGET_PASSWORD = 'forgotPassword',
    RESET_PASSWORD = 'resetPassword',
    UPDATE_PROFILE = 'updateProfile',
    GET_PROFILE_BY_ID = 'getProfileById',
    CHANGE_PASSWORD = 'changePassword',
    UPLOAD_USER_CONTRACT = 'uploadUserContract',
    ADD_AGENT = 'addAgent',
    AGENT_REGISTER = 'agentRegister',
    GET_ALL_AGENTS = 'getAllAgents',
    GET_AGENTS = 'getAgents',
    GET_AGENT_FOR_REGISTER = 'getAgentForRegister',
    GET_ALL_AGENT_PERMISSIONS = 'getAllAgentPermissions',
    AGENT_CHANGE_STATUS = 'agentChangeStatus',
    AGENT_TRANSFER_PROPERTY = 'agentTransferProperty',
    SEND_MESSAGE_TO_AGENT = 'sendMessageToAgent',
    UPDATE_AGENT_PERMISSION = 'updateAgentPermission',
    GET_AGENT_DETAIL = 'getAgentDetail',
    RESEND_INVITATION_PENDING_STATUS_AGENT = 'resendInvitationPendingStatusAgent',
    DELETE_PENDING_STATUS_AGENT = 'deletePendingStatusAgent',
    CHECK_USER_PERMISSION = 'checkUserPermission',
    VERIFY_EMAIL_BY_PROFILE = 'verifyEmail',
    PROFILE_IMAGE_UPLOAD = 'updateProfileImage',
    CHECK_USER_ACTIVE = 'checkUserActive',
    SAVE_DEVICE_TOKEN = 'saveDeviceToken',
    GET_USER_NOTIFICATION = 'getNotificationsUser',
    READ_NOTIFICATION = 'readNotification',
    PROFILE_EMAIL_VERIFICATION = 'updateProfileEmail',
    UPDATE_USER_BASICINFO = 'updateUserBasicInfo',
    RESEND_EMAIL_VERIFICATION = 'resendEmailVerificationCode',
    GET_MESSAGE_SUBJECT = 'getMessageSubject',
    GET_CONVERSATION = 'getConversation',
    CHANGE_STATUS_CONVERSATION = 'changeStatusConversation',
    REPLY_TO_CONVERSATION = 'replyToConversation',
    UPDATE_VERIFIED_USER_EMAIL_BY_ID = 'updateVerifiedUserEmailById',
    GET_VERIFIED_USER_BY_ID = 'getVerifiedUserById',
    GET_USER_PERSONAL_INFO = 'getUserPersonalInfo',
    GET_ALL_SUBUSERS = 'getAllSubusers',
    GET_LISTING_USER_DETAILS = 'getListingUserDetails',
    GET_PARENT_USER_ROLE = 'getParentUserRole',
    IS_USER_ROLE_VALID = 'isUserRoleValid',
    DELETE_SUB_USER = 'deleteSubUser',
    SAVE_OWNER_ROLE = 'saveOwnerRole',
    MANAGE_SUB_USER = 'manageSubUser',
    GET_USER_POST_INFO = 'getUserPostInfo',
    PING = 'ping',
    CHECK_PHONE_NUMBER = 'checkPhoneNumber',
    CHK_USER_CONTACT_EXIS = 'checkUserIdentity',
    SAVE_BROKER_DEVELOPER_ROLE = 'saveBrokerDeveloperRole',
    SAVE_USER_POST_INFO = 'saveUserPostInfo',
    UPDATE_VERIFIED_BROKER = 'updateVerifiedBroker',
    USER_POST_INFO_DETAILS_BY_USER_ID = 'userPostInfoDetailsbyUserId',
    GET_USER_WITH_ROLE_ID_FOR_SAME_ZONE = 'getReviewerWithRoleIdForLocation',
}

class IdentityClient {
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

    register = (request: any): Promise<any> => {
        return this.handleClientMethod(request, IdentityMethod.REGISTER);
    };

    login = (request: any): Promise<any> => {
        return this.handleClientMethod(request, IdentityMethod.LOGIN);
    };

    checkContactExistence = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.CHK_CONTACT_EXIS
        );
    };

    resendVerficationCode = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.RESEND_VERIFICATION_CODE
        );
    };
    setUserIqmaByAbsher = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.SET_USER_IQMA_ABSHER
        );
    };
    resendWhatsAppVerificationCode = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.RESEND_WHATS_APP_VERIFICATION_CODE
        );
    };
    updatePhoneNumber = (request: any): Promise<any> => {
        return this.handleClientMethod(request, IdentityMethod.UPDATE_PHONE);
    };
    updateProfilePhoneNumber = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.UPDATE_PROFILE_PHONE
        );
    };
    sendOtpToPhone = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.SEND_OTP_TO_PHONE
        );
    };
    verifyPhoneNumber = (request: any): Promise<any> => {
        return this.handleClientMethod(request, IdentityMethod.VERIFY_PHONE);
    };
    sendOtpToWhatsApp = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.SEND_OTP_TO_WHATS_APP
        );
    };
    updateProfileWhatsAppNumber = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.VERIFY_WHATS_APP
        );
    };
    verifyEmailNumber = (request: any): Promise<any> => {
        return this.handleClientMethod(request, IdentityMethod.VERIFY_EMAIL);
    };

    loginWithOtp = (request: any): Promise<any> => {
        return this.handleClientMethod(request, IdentityMethod.LOGIN_OTP);
    };

    verifyLoginOtp = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.VERIFY_LOGIN_OTP
        );
    };

    forgotPassword = (request: any): Promise<any> => {
        return this.handleClientMethod(request, IdentityMethod.FORGET_PASSWORD);
    };

    resetPassword = (request: any): Promise<any> => {
        return this.handleClientMethod(request, IdentityMethod.RESET_PASSWORD);
    };

    updateProfile = (request: any): Promise<any> => {
        return this.handleClientMethod(request, IdentityMethod.UPDATE_PROFILE);
    };

    getProfileById = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.GET_PROFILE_BY_ID
        );
    };

    changePassword = (request: any): Promise<any> => {
        return this.handleClientMethod(request, IdentityMethod.CHANGE_PASSWORD);
    };

    uploadUserContract = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.UPLOAD_USER_CONTRACT
        );
    };

    addAgent = (request: any): Promise<any> => {
        return this.handleClientMethod(request, IdentityMethod.ADD_AGENT);
    };

    getAgentForRegister = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.GET_AGENT_FOR_REGISTER
        );
    };

    agentRegister = (request: any): Promise<any> => {
        return this.handleClientMethod(request, IdentityMethod.AGENT_REGISTER);
    };

    getAllAgents = (request: any): Promise<any> => {
        return this.handleClientMethod(request, IdentityMethod.GET_ALL_AGENTS);
    };

    getAgents = (request: any): Promise<any> => {
        return this.handleClientMethod(request, IdentityMethod.GET_AGENTS);
    };

    getAllAgentPermissions = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.GET_ALL_AGENT_PERMISSIONS
        );
    };

    agentChangeStatus = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.AGENT_CHANGE_STATUS
        );
    };

    agentTransferProperty = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.AGENT_TRANSFER_PROPERTY
        );
    };

    sendMessageToAgent = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.SEND_MESSAGE_TO_AGENT
        );
    };

    updateAgentPermission = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.UPDATE_AGENT_PERMISSION
        );
    };

    getAgentDetail = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.GET_AGENT_DETAIL
        );
    };

    resendInvitationPendingStatusAgent = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.RESEND_INVITATION_PENDING_STATUS_AGENT
        );
    };

    deletePendingStatusAgent = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.DELETE_PENDING_STATUS_AGENT
        );
    };
    checkUserPermission = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.CHECK_USER_PERMISSION
        );
    };
    verifyEmail = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.VERIFY_EMAIL_BY_PROFILE
        );
    };
    updateProfileImage = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.PROFILE_IMAGE_UPLOAD
        );
    };

    checkUserActive = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.CHECK_USER_ACTIVE
        );
    };

    saveDeviceToken = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.SAVE_DEVICE_TOKEN
        );
    };

    getNotificationsUser = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.GET_USER_NOTIFICATION
        );
    };

    readNotification = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.READ_NOTIFICATION
        );
    };

    updateProfileEmail = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.PROFILE_EMAIL_VERIFICATION
        );
    };

    updateVerifiedUserEmailById = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.UPDATE_VERIFIED_USER_EMAIL_BY_ID
        );
    };

    getVerifiedUserById = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.GET_VERIFIED_USER_BY_ID
        );
    };

    updateUserBasicInfo = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.UPDATE_USER_BASICINFO
        );
    };

    resendEmailVerificationCode = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.RESEND_EMAIL_VERIFICATION
        );
    };
    getMessageSubject = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.GET_MESSAGE_SUBJECT
        );
    };
    getConversation = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.GET_CONVERSATION
        );
    };
    changeStatusConversation = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.CHANGE_STATUS_CONVERSATION
        );
    };

    replyToConversation = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.REPLY_TO_CONVERSATION
        );
    };

    getUserPersonalInfo = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.GET_USER_PERSONAL_INFO
        );
    };

    getAllSubusers = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.GET_ALL_SUBUSERS
        );
    };

    getListingUserDetails = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.GET_LISTING_USER_DETAILS
        );
    };
    getParentUserRole = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.GET_PARENT_USER_ROLE
        );
    };

    isUserRoleValid = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.IS_USER_ROLE_VALID
        );
    };

    saveOwnerRole = (request: any): Promise<any> => {
        return this.handleClientMethod(request, IdentityMethod.SAVE_OWNER_ROLE);
    };

    manageSubUser = (request: any): Promise<any> => {
        return this.handleClientMethod(request, IdentityMethod.MANAGE_SUB_USER);
    };

    deleteSubUser = (request: any): Promise<any> => {
        return this.handleClientMethod(request, IdentityMethod.DELETE_SUB_USER);
    };

    getUserPostInfo = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.GET_USER_POST_INFO
        );
    };

    checkPhoneNumber = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.CHECK_PHONE_NUMBER
        );
    };

    ping = (request: any): Promise<any> => {
        return this.handleClientMethod(request, IdentityMethod.PING);
    };

    checkUserIdentity = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.CHK_USER_CONTACT_EXIS
        );
    };

    saveBrokerDeveloperRole = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.SAVE_BROKER_DEVELOPER_ROLE
        );
    };

    saveUserPostInfo = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.SAVE_USER_POST_INFO
        );
    };

    userPostInfoDetailsbyUserId = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.USER_POST_INFO_DETAILS_BY_USER_ID
        );
    };

    updateVerifiedBroker = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.UPDATE_VERIFIED_BROKER
        );
    };

    getReviewerWithRoleIdForLocation = (request: any): Promise<any> => {
        return this.handleClientMethod(
            request,
            IdentityMethod.GET_USER_WITH_ROLE_ID_FOR_SAME_ZONE
        );
    };
}

const identityClient = new IdentityClient();
export default identityClient;
