import { Router } from 'express';
import { setLang } from '../../util/setlang';
import { checkJwt } from '../../util/checkjwt';

import { PropertyController } from '../controllers/property.controller';
import { PostPropertyController } from '../controllers/postProperty.controller';
const router = Router();

const propertyInstance = new PropertyController();
const postPropertyInstance = new PostPropertyController();

router.post('/testApiFunction', [setLang], propertyInstance.testApiFunction);

// router.post("/createProperty", [setLang], propertyInstance.addPropertyForKSA);
// router.post(
//   "/attachPropertyDescription",
//   [setLang],
//   propertyInstance.attachPropertyDescription
// );
// router.post(
//   "/attachPropertyAmenities",
//   [setLang],
//   propertyInstance.attachPropertyAmenities
// );
// router.post(
//   "/attachPropertyFiles",
//   [setLang],
//   propertyInstance.attachPropertyFiles
// );
router.get(
    '/getPropertyById/:id',
    [setLang, checkJwt],
    propertyInstance.getPropertyById
);
router.get(
    '/getUserProperty/:id/:page',
    [setLang],
    propertyInstance.getUserProperty
);
router.get('/deleteProperty/:id', [setLang], propertyInstance.deleteProperty);

router.get('/assignProperty', [setLang], propertyInstance.assignProperty);

router.get(
    '/testPostProperty',
    [setLang],
    postPropertyInstance.getPostedPropertyById
);
router.post(
    '/testPostProperty',
    [setLang],
    postPropertyInstance.savePostProperty
);
router.get(
    '/getFeatureProperty/:propertyId',
    [setLang],
    postPropertyInstance.getFeaturePropertyById
);
router.post(
    '/postFeatureProperty',
    [setLang],
    postPropertyInstance.postFeatureProperty
);
router.get(
    '/getProperty/:propertyId',
    [setLang],
    postPropertyInstance.getLongJourneyPropertyById
);
router.post(
    '/addProperty',
    [setLang],
    postPropertyInstance.addLongJourneyProperty
);
router.get(
    '/getUserPropertyStatusCount/:userId',
    [setLang],
    postPropertyInstance.getUserPropertyStatusCount
);
router.post(
    '/getPostPropertybyUserId',
    [setLang],
    postPropertyInstance.getAllPostPropertiesByUserId
);
router.post(
    '/post-property-status',
    [setLang],
    postPropertyInstance.changePostPropertyStatus
);
router.get(
    '/getTitle/:propertyId',
    [setLang],
    postPropertyInstance.createTitle
);
//local testing purpose only
router.post(
    '/assign-property-user',
    [setLang],
    postPropertyInstance.assignPropertyUser
);
router.post(
    '/add-property-media',
    [setLang],
    postPropertyInstance.addPropertyPhotosAndVideo
);
router.post(
    '/getPropertyFilesByPropertyIds',
    [setLang],
    postPropertyInstance.getPropertyFilesByPropertyIds
);

export default router;
