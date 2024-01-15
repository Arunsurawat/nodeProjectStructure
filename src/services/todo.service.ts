
import { CreateTodo } from '@interfaces/create-todo.interface';
import { TodoModel } from '@models/index';

export class TodoService {
    public createTodo = async (createTodoDto: CreateTodo) => {
        const { name, description } = createTodoDto;
        const todo = new TodoModel({ name, description });
        return await todo.save();
    }
}

export default TodoService;