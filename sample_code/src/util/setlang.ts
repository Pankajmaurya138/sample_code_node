import { Request, Response, NextFunction } from 'express';
import i18next from 'i18next';
export const setLang = (req: Request, res: Response, next: NextFunction) => {
    try {
        const lng = <string>req.headers.locale || 'ar';
        i18next.changeLanguage(lng);
        next();
    } catch (error) {
        res.send(error.message);
        return;
    }
};
