
import { IGetUserByEmail, IUser } from '@interfaces/user.interface';
import { UserModel } from '@models/index';

export class UserService {
    public createUser = async (createUser: IUser) => {
        const { name, email, password } = createUser;
        const user = new UserModel({ name, email, password });
        return await user.save();
    }

    public getUserByEmail = async (getUserByEmail: IGetUserByEmail) => {
        const {email, isDeleted } = getUserByEmail;
        const userData = await UserModel.findOne({  email, isDeleted });
        return userData;
    }
}

export default UserService;