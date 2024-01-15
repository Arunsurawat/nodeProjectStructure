
export interface IUser {
    name: string;
    email: string;
    password: string;
}

export interface IUserLogin {
    email: string;
    password: string;
}

export interface IGetUserByEmail {
    email: string;
    isDeleted: boolean;
}
