import { NextFunction, Request, Response } from "express";
import { TodoService } from '@services/todo.service';
import { validateTodoCreate } from "@validations/todo.validation";
import { createCustomError } from "@utils/customeError";

class TodosController {
    private _todoService = new TodoService();
    public createTodo = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const valid = validateTodoCreate(req.body);
            if (valid.error) { return next(createCustomError("Invalid todo data", 400)); }
            const todo = await this._todoService.createTodo(req.body);
            res.json(todo)
        } catch (error) {
            next(error);
        }
    }
}

export default TodosController;