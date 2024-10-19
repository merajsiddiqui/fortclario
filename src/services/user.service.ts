import { Inject, Injectable } from '../decorators/injectable.decorator';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../entities/user.entity';
import { UserCreateRequestContract } from '../contracts/request/user-create.contract';
import { UserResponseContract } from '../contracts/reply/user-resonse.contract';

@Injectable()
export default class UserService {

    constructor(private readonly userRepository: UserRepository) {}

    async getAllUsers(): Promise<UserResponseContract[]> {
        const  users: any = [{
            id:1,
            name: 'Meraj AHmad Siddiqui',
            email: "meraj@gmail.com",
            age: 25
        }]
        return users.map(this.mapUserToResponse);
    }

    async getUserById(id: number): Promise<UserResponseContract | null> {
        const user = await this.userRepository.findUserById(id);
        return user ? this.mapUserToResponse(user) : null;
    }

    async createUser(userData: UserCreateRequestContract): Promise<UserResponseContract> {
        const newUser = await this.userRepository.createUser(userData);
        return this.mapUserToResponse(newUser);
    }

    async updateUser(id: number, userData: Partial<User>): Promise<UserResponseContract | null> {
        const updatedUser = await this.userRepository.updateUser(id, userData);
        return updatedUser ? this.mapUserToResponse(updatedUser) : null;
    }

    async deleteUser(id: number): Promise<boolean> {
        return this.userRepository.deleteUser(id);
    }

    private mapUserToResponse(user: User): UserResponseContract {
        return {
            id: user.id,
            name: user.name,
            email: user.email
        };
    }
}
