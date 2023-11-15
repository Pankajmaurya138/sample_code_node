export interface getPropertyMediaRes {
    status: boolean;
    data: {
        id: number | string;
        PropertyFiles: Array<string>;
        videoURL: string | null;
    } | null;
    message: string;
}

export interface addPropertyMediaRes {
    status: boolean;
    data: {
        id: number;
        PropertyFiles: any[] | null;
    } | null;
    message: string | null;
}
export interface addPropertyAmenitiesRes {
    status: boolean;
    data: {
        id: number | string;
        referenceNo: string;
        propertyId?: string;
    } | null;
    message: string;
}

export interface amenitiesMappedArray {
    amenityId: number;
    propertyId: number;
}

export interface addPropertyDataRes {
    id: number;
    name: string;
    property_id: number;
    type: string;
}
export interface getAssigneeDetailsRes {
    status: boolean;
    data: {
        propertyId: number;
        assigneeId: number;
        phoneNumber: number;
        phoneNumberCountryCode: string;
        name: string;
        referenceNo: string;
    } | null;
    message: string;
}
