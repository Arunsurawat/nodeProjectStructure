import { Router } from 'express';
import { Routes } from '@interfaces/route.interface';
import UserController from '@controllers/user.controller';
import { logger } from '@utils/logger';

class UserRoute implements Routes {
    public path = '/user/';
    public router = Router();
    public _user_controller = new UserController();
    constructor() {
        logger.info(`/user/`)
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}create`, this._user_controller.createUser);
        this.router.post(`${this.path}login`, this._user_controller.loginUser);
    }
}

export default UserRoute;