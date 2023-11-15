import {
    getCurrency,
    getListingFor,
    getPropertyType,
    getAreaUnit,
    getAmenitiesName,
    getFixturesName,
    getLocation,
} from './propertyContent.service';
import data from './dummyData.json';
import { Locale } from '../util/enums';

describe('propertyContent -> ', () => {
    it('Method -> getListingFor ', async () => {
        let result = getListingFor(data.pData, Locale.ENGLISH);
        expect(result).toBe('Sale');
        result = getListingFor(undefined, Locale.ENGLISH);
        expect(result).toBe(undefined);
    });

    it('Method -> getPropertyType ', async () => {
        let result = getPropertyType(data.pData, Locale.ENGLISH);
        expect(result).toBe('Apartment');
        result = getPropertyType(undefined, Locale.ENGLISH);
        expect(result).toBe(undefined);
    });

    it('Method -> getCurrency ', async () => {
        let result = getCurrency(data.pData.PropertyAttribute, Locale.ENGLISH);
        expect(result).toBe('SAR');
        result = getCurrency(undefined, Locale.ENGLISH);
        expect(result).toBe(undefined);
    });

    it('Method -> getAreaUnit ', async () => {
        let result = getAreaUnit(data.pData.PropertyAttribute, Locale.ENGLISH);
        expect(result).toBe('SQM');
        result = getAreaUnit(undefined, Locale.ENGLISH);
        expect(result).toBe(undefined);
    });

    it('Method -> getAmenitiesName ', async () => {
        let result = getAmenitiesName(data.pData.Amenities, Locale.ENGLISH);
        expect(result.join(',')).toBe(
            ['Walk-in Closet', 'External Annex', 'Yard'].join(',')
        );
        result = getAmenitiesName([], Locale.ENGLISH);
        expect(result.join(',')).toBe([].join(','));
    });

    it('Method -> getFixturesName ', async () => {
        let result = getFixturesName(data.pData.Amenities, Locale.ENGLISH);
        expect(result.join(',')).toBe(['Built in Wardrobes'].join(','));
        result = getFixturesName([], Locale.ENGLISH);
        expect(result.join(',')).toBe([].join(','));
    });

    it('Method -> getLocation ', async () => {
        let result = getLocation(data.pData, Locale.ENGLISH);
        expect(result).toBe('2Nd Industrial City, Riyadh');
        result = getLocation(undefined, Locale.ENGLISH);
        expect(result).toBe(undefined);
        data.pData.PropertyLocation.Zone = null;
        result = getLocation(data.pData, Locale.ENGLISH);
        expect(result).toBe('Riyadh');
    });
});
