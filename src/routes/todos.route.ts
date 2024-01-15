import { Router } from 'express';
import { Routes } from '@interfaces/route.interface';
import TodoController from '@controllers/todos.controller';
import { logger } from '@/utils/logger';



class TodoRoute implements Routes {
    public path = '/todos/';
    public router = Router();
    public _todo_controller = new TodoController();
    constructor() {
        logger.info(`/todos/`)
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}create`, this._todo_controller.createTodo);
    }
}

export default TodoRoute;