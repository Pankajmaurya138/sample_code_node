import { User } from '../models/user.model';
import { PropertyErrorCodes } from '../util/enums';
import { userRepository } from '../v1/repositories/user.repository';

class UserService {
    /**
     * Get id  parent id of user.
     * @param userId user id
     * @returns user or throws error if user not found.
     */
    public async checkUser(userId: number): Promise<User> {
        const checkUser = await userRepository.checkUser(userId);
        if (!checkUser) {
            throw new Error(
                `${PropertyErrorCodes.USER_NOT_FOUND}||${PropertyErrorCodes.PROPERTY_DEFINE_INTERNAL_ERROR}`
            );
        }
        return checkUser;
    }
}
export const userService = new UserService();
