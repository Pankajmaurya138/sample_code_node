import { PostPropertyRepository } from './postProperty.repository';
//import { GroupStatusCodes, PropertyErrorCodes } from '../util/enums'
const ppRepo = new PostPropertyRepository();

describe('postProperty.repository.ts', () => {
    it('Method -> getPropertyBasicDetails', async () => {
        const result = await ppRepo.getPropertyBasicDetails({
            id: 4862,
            userId: 3594,
        });

        expect(result.toJSON()).toEqual(
            expect.objectContaining({
                cityId: '273',
                currentStep: null,
                id: '4862',
                idType: null,
                isDifferentOwner: null,
                isWathqVerified: null,
                licenseNumber: null,
                listingTypeId: '3',
                managedById: null,
                nationalIdNumber: null,
                ownerMobileCountryCode: null,
                ownerMobileNo: null,
                ownerName: null,
                realestateDeedId: null,
                regaAdNumber: null,
                regaAuthorizationId: null,
                status: null,
                subUserId: '3598',
                titleDeedNo: null,
                userId: '3594',
                userTypeId: '47',
            })
        );
    });

    it('Method -> get-post-property-details-by-id', async () => {
        const propertyDetailsResult: any = await ppRepo.getPropertyInfobyId({
            propertyId: 4915,
            userId: 3636,
            locale: 'en',
        });
        expect(propertyDetailsResult).toEqual(
            expect.objectContaining({
                status: true,
                message: '',
                property: {
                    regionId: undefined,
                    cityId: undefined,
                    mainTypeId: '1',
                    listingTypeId: '4',
                    districtId: undefined,
                    landArea: { unit: '23', carpetArea: 144, builtUpArea: 345 },
                    facingId: '75',
                    facingTypeId: '75',
                    possessionTypeId: '3',
                    street: {
                        noOfStreets: null,
                        street1Width: null,
                        street2Width: null,
                        street3Width: null,
                        street4Width: null,
                    },
                    salePrice: '',
                    rentalPrice: null,
                    currencyTypeId: '44',
                    purposeId: '4',
                    propertyType: '1',
                    residential: '49',
                    propertyTypeId: '49',
                    propertyStatus: '3',
                    buildYear: '7',
                    propertyFiles: undefined,
                    location: {
                        latitude: undefined,
                        longitude: undefined,
                        address: 'Saudi',
                    },
                },
            })
        );
    });

    it('Method -> get-feature-property-by-id', async () => {
        const propertyDetailsResult: any =
            await ppRepo.getFeaturePropertyInfobyId({
                propertyId: 4915,
                userId: 3636,
                locale: 'en',
            });
        expect(propertyDetailsResult).toEqual(
            expect.objectContaining({
                status: true,
                message: '',
                property: {
                    furnishingTypeId: '1',
                    propertyArea: {
                        builtUpArea: 345,
                        carpetArea: 144,
                        unitTypeId: '23',
                    },
                    Bedroom: 44,
                    Bathroom: 77,
                    LivingRoom: 2,
                    GuestRoom: 2,
                    TotalCarParking: 7,
                    PropertyFloor: 2,
                    ApartmentTotalFloor: 22,
                    description: null,
                    mainTypeId: '1',
                    propertyTypeId: '49',
                },
            })
        );
    });

    it('Method -> savePropertyBasicDetails', async () => {
        const result = await ppRepo.savePropertyBasicDetails({
            id: 4862,
            userId: 3594,
            cityId: 273,
            listingTypeId: 3,
            userTypeId: 47,
            source: 'mobile',
        });
        expect(result).toBe('4862');
    });

    it('Method -> propertyHolderVerification', async () => {
        const result = await ppRepo.propertyHolderVerification({
            id: 4862,
            userId: 3594,
            idType: 'nid',
            idNumber: '1095459580',
            deedNumber: '310106064405',
            regaAuthNumber: '423423423',
            isWathqVerified: true,
        });
        expect(result).toBe('4862');
    });

    it('Method -> getPropertyHolderVerification', async () => {
        const result = await ppRepo.getPropertyHolderVerification({
            id: 4862,
            userId: 3594,
        });
        expect(result.get({ plain: true })).toEqual(
            expect.objectContaining({
                PostProperty: { id: '4862' },
                deedNumber: '310106064405',
                identity: 'nid',
                identityNumber: '1095459580',
                isVerified: true,
                regaAuthNumber: '423423423',
            })
        );
    });

    it('Method -> savePropertyLocation', async () => {
        const result = await ppRepo.savePropertyLocation({
            id: 4862,
            userId: 3594,
            address: 'abc',
            districtId: 123,
            lat: 39204,
            long: 43893,
        });
        expect(result).toBe('4862');
    });

    it('Method -> getPropertyLocation', async () => {
        const result = await ppRepo.getPropertyLocation({
            id: 4862,
            userId: 3594,
        });
        expect(result).toEqual(
            expect.objectContaining({
                id: '4862',
                address: 'abc',
                districtId: 123,
                lat: '39204',
                long: '43893',
            })
        );
    });

    it('Method -> savePostFeaturyPropertyDetail', async () => {
        jest.setTimeout(55000);
        const result = await ppRepo.updateFeatureLongJourneyProperty(
            {
                furnishingTypeId: 1,
                builtUpArea: 345,
                Bedroom: 67,
                Bathroom: 77,
                LivingRoom: 2,
                GuestRoom: 2,
                TotalCarParking: 7,
                PropertyFloor: 2,
                ApartmentTotalFloor: 22,
                id: 4915,
                locale: 'en',
                carpetArea: 144,
            },
            4915
        );
        expect(result).toEqual(
            expect.objectContaining({
                status: false,
                message: '',
                property: 4915,
            })
        );
    });

    it('Method -> savePostPropertyDetail', async () => {
        jest.setTimeout(55000);
        const result = await ppRepo.saveLongJourneyProperty({
            id: '5307',
            userId: '1944',
            listingTypeId: '4',
            facingTypeId: '12',
            salePrice: '',
            mainTypeId: '2',
            propertyTypeId: '614',
            possessionTypeId: '35',
            buildYear: '12',
            locale: 'en',
            rentalPrice: '656',
            propertyOwnerId: '167',
            titleDeedNo: null,
            postedAs: '47',
            rega_authorization_id: '148',
            realestateDeedId: null,
            cityId: '273',
            zoneId: '',
            stateId: '',
            latitude: null,
            longitude: null,
            countryId: '',
            address: '',
            propertyVerificationInfoId: '122',
        });
        expect(result).toEqual(
            expect.objectContaining({
                status: false,
                message: '',
                property: 5307,
            })
        );
    });
    it('Method -> updatePostPropertyDetail', async () => {
        jest.setTimeout(55000);
        const result = await ppRepo.updateFeatureLongJourneyProperty(
            {
                id: '5307',
                userId: '1944',
                listingTypeId: '4',
                facingTypeId: '12',
                salePrice: '',
                mainTypeId: '2',
                propertyTypeId: '614',
                possessionTypeId: '35',
                buildYear: '12',
                locale: 'en',
                rentalPrice: '656',
                propertyOwnerId: '167',
                titleDeedNo: null,
                postedAs: '47',
                rega_authorization_id: '148',
                realestateDeedId: null,
                cityId: '273',
                zoneId: '',
                stateId: '',
                latitude: null,
                longitude: null,
                countryId: '',
                address: '',
                propertyVerificationInfoId: '122',
            },
            5307
        );
        expect(result).toEqual(
            expect.objectContaining({
                status: false,
                message: '',
                property: 5307,
            })
        );
    });
});
