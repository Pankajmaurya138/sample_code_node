import { User } from '../../models/user.model';
import { UserStatus } from '../../util/enums';
import logger from '../../util/logger';

class UserRepository {
    checkUser = async (userId: number) => {
        try {
            return User.findOne({
                where: { id: userId, status: UserStatus.ACTIVE },
                attributes: ['id', 'parent_id', 'is_active'],
            });
        } catch (e: any) {
            logger.error(`PropertyRepository::checkUser : ${e.message}`);
            throw e;
        }
    };
}
export const userRepository = new UserRepository();
