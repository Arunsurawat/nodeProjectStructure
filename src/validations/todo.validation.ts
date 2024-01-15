import Joi from 'joi';

export const validateTodoCreate = (todo: { name: string, description: string }) => {
    const createTodoSchema = Joi.object({
        name: Joi.string().required(),
        description: Joi.string().required()
    })
    return createTodoSchema.validate(todo)
}