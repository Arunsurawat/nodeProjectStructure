import { IUser, IUserLogin } from '@interfaces/user.interface';
import Joi from 'joi';


export const validateUserCreate = (user: IUser) => {
    const createUserSchema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().required().email(),
        password: Joi.string().required().min(3)
    })
    return createUserSchema.validate(user)
}


export const validateLogin = (user: IUserLogin) => {
    const loginUserSchema = Joi.object({
        email: Joi.string().required().email(),
        password: Joi.string().required().min(3)
    })
    return loginUserSchema.validate(user)
}