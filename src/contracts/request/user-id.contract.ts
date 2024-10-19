interface UserIdRequestContract {
    id: number
}

export interface GetUserDetailRequestContract extends UserIdRequestContract {};

export interface DeleteUserRequestContract extends UserIdRequestContract {};