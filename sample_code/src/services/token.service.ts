import { Realestate_token } from '../models/realestate_token.model';
import { userCredential, POSTPROPERTY, auth_header } from '../util/static';
import axios from 'axios';

export default class TokenService {
    loginPayload = userCredential;
    // access token save in table
    getAccessToken = async () => {
        let refreshToken: any = await Realestate_token.findOne({
            where: { username: this.loginPayload.UserName },
            order: [['id', 'DESC']],
        });
        return refreshToken?.token;
    };

    createToken = async (data: any) => {
        return Realestate_token.create({
            ...data,
            username: this.loginPayload.UserName,
        });
    };
    requestBearerToken = async () => {
        return axios.post(POSTPROPERTY.CHECK_USER_VALIDITY, this.loginPayload, {
            headers: {
                Authorization: `Bearer ${auth_header.bearer_token}`,
            },
        });
    };
    generateToken = async () => {
        let token = await this.requestBearerToken();
        if (token?.data) await this.createToken(token?.data);
    };
}
