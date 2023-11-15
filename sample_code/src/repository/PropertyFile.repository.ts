import { Op } from 'sequelize';
import { PropertyFile } from '../models/propertyFile.model';

export class PropertyFileRepo {
    /**
     * Get Property files name by property id.
     * @param ids property ids
     * @returns
     */
    GetPropertyFilesByPropertyIds(ids: number[]) {
        return PropertyFile.findAll({
            where: {
                property_id: { [Op.in]: ids },
                type: {
                    [Op.in]: ['main', 'interior', 'exterior'],
                },
            },
            raw: true,
            attributes: ['property_id', 'name'],
            order: [['type', 'DESC']],
        });
    }
}
const propertyFileRepo = new PropertyFileRepo();
export default propertyFileRepo;
