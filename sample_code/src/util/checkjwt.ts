import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import config from '../util/jwtconfig';

export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
    //Get the jwt token from the head
    const token = <string>req.headers['authorization'];
    let jwtPayload;

    //Try to validate the token and get data
    try {
        jwtPayload = <any>(
            jwt.verify(token, config.JWT_SECRET, config.JWT_OPTIONS)
        );
        res.locals.auth = jwtPayload;
        next();
    } catch (error) {
        //If token is not valid, respond with 401 (unauthorized)
        res.status(401).send();
        return;
    }
};
