import { NextFunction, Request, Response } from "express";
import { UserService } from '@services/user.service';
import { validateLogin, validateUserCreate } from "@validations/user.validation";
import { createCustomError } from "@utils/customeError";
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import { apiResp } from "@utils/common";
const SECRET_TOKEN = process.env.SECRET_TOKEN;

class UserController {
    private _userService = new UserService();
    public createUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const valid = validateUserCreate(req.body);
            if (valid.error) { return next(createCustomError("Invalid user data", 400)); }
            req.body.password = await bcrypt.hash(req.body.password, 10);
            const user = await this._userService.createUser(req.body);
            return apiResp({ res, status: true, statusCode: 201, message: "user register successfully", data: user });
        } catch (error) {
            next(error);
        }
    }

    public loginUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const valid = validateLogin(req.body);
            if (valid.error) { return next(createCustomError("Invalid login data", 400)); }

            const userDetails = await this._userService.getUserByEmail({ email: req.body.email, isDeleted: false })
            if (!userDetails) { return next(createCustomError("Record not found with your current credentials!", 404)) };

            const isPasswordCorrect = await bcrypt.compare(req.body.password, userDetails.password);
            if (!isPasswordCorrect) { return next(createCustomError("Record not found with your current credentials!", 404)) };

            const { _id, name, email } = userDetails;

            // Send JWT Token
            const token = jwt.sign({ _id, name, email }, SECRET_TOKEN, { expiresIn: '1d' });
            return apiResp({ res, status: true, statusCode: 200, message: "Login successfully", data: { _id, name, email, token } });

        } catch (error) {
            next(error);
        }
    }
}

export default UserController;