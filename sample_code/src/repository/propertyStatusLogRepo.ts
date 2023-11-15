import { Op, Sequelize } from 'sequelize';
import { PropertyStatusLog } from '../models/propertyStatusLog.model';

class PropertyStatusLogRepository {
    /**
     * Get latest PropertyStatusLog from  of property by property ids.
     * @param propertyIds property ids array
     */
    public async GetLatestStatusLogsIdsByPropertyIds(propertyIds: number[]) {
        const statusLogs = await PropertyStatusLog.findAll({
            raw: true,
            where: {
                property_id: { [Op.in]: propertyIds },
            },
            attributes: [[Sequelize.fn('MAX', Sequelize.col('id')), 'id']],
            group: ['property_id'],
        });
        return await this.GetStatusLogByIds(
            statusLogs.map((item: any) => item.id)
        );
    }

    /**
     * Get PropertyStatusLog by ids.
     * @param ids PropertyStatusLog ids
     */
    public async GetStatusLogByIds(ids: number[]) {
        return PropertyStatusLog.findAll({
            attributes: ['property_id', 'reason', 'createdAt'],
            raw: true,
            where: {
                id: {
                    [Op.in]: ids,
                },
            },
        });
    }
}
const propertyStatusLogRepo = new PropertyStatusLogRepository();
export default propertyStatusLogRepo;
