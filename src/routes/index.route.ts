import { Router  } from 'express';
import { Routes } from '@interfaces/route.interface';
import { logger } from '@/utils/logger';
import IndexController from '@controllers/index.controller';



class IndexRoute implements Routes {
    public path = '';
    public router = Router();
    public _index_controller = new IndexController();
    constructor() {
        logger.info(`/Index/`)
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`/`, this._index_controller.index);
    }
}

export default IndexRoute;