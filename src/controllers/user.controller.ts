import { FastifyRequest, FastifyReply } from 'fastify';
import { Controller } from "../decorators/controller.decorator";
import { Get, Post, Put, Delete } from "../decorators/route.decorator";
import { Middleware } from '../decorators/middleware.decorator';
import { UserResponseContract } from '../contracts/reply/user-resonse.contract';
import { UserCreateRequestContract } from '../contracts/request/user-create.contract';
import UserService from '../services/user.service';
import { authenticate } from '../middlewares/auth.middleware';
import { Inject, Injectable } from '../decorators/injectable.decorator';

/**
 * Controller for handling user-related operations.
 */
@Injectable()
@Controller('/users')
export class UserController {

    /**
     * 
     * @param userService 
     */
    constructor(@Inject(UserService) private userService: UserService) {
        console.log('UserController initialized with userService:', userService)
    }

    /**
     * Retrieves all users.
     * @param {FastifyRequest} req - The request object.
     * @param {FastifyReply} reply - The reply object.
     * @returns {Promise<UserResponseContract[]>} A promise that resolves to an array of user response contracts.
     */
    @Middleware(authenticate)
    @Get('/')
    async getUsers(req: FastifyRequest, reply: FastifyReply): Promise<UserResponseContract[]> {
        return this.userService.getAllUsers()
    }

    /**
     * Retrieves a specific user by ID.
     * @param {FastifyRequest} req - The request object.
     * @param {FastifyReply} reply - The reply object.
     * @returns {Promise<UserResponseContract | null>} A promise that resolves to a user response contract or null if not found.
     */
    @Get('/:id')
    async getUser(req: FastifyRequest, reply: FastifyReply): Promise<UserResponseContract | null> {
        const { id } = req.params as { id: string };
        const user = await this.userService.getUserById(parseInt(id));
        if (!user) {
            reply.code(404); // Set HTTP status code to 404 Not Found
            return null;
        }
        return user;
    }

    /**
     * Creates a new user.
     * @param {FastifyRequest} req - The request object.
     * @param {FastifyReply} reply - The reply object.
     * @returns {Promise<UserResponseContract>} A promise that resolves to the created user response contract.
     */
    @Post('/')
    async createUser(req: FastifyRequest, reply: FastifyReply): Promise<UserResponseContract> {
        const userData = req.body as UserCreateRequestContract;
        return this.userService.createUser(userData);
    }

    /**
     * Updates an existing user.
     * @param {FastifyRequest} req - The request object.
     * @param {FastifyReply} reply - The reply object.
     * @returns {Promise<UserResponseContract | null>} A promise that resolves to the updated user response contract or null if not found.
     */
    @Put('/:id')
    async updateUser(req: FastifyRequest, reply: FastifyReply): Promise<UserResponseContract | null> {
        const { id } = req.params as { id: string };
        const userData = req.body as Partial<UserCreateRequestContract>;
        const updatedUser = await this.userService.updateUser(parseInt(id), userData);
        if (!updatedUser) {
            reply.code(404); // Set HTTP status code to 404 Not Found
            return null;
        }
        return updatedUser;
    }

    /**
     * Deletes a user.
     * @param {FastifyRequest} req - The request object.
     * @param {FastifyReply} reply - The reply object.
     * @returns {Promise<void>} A promise that resolves when the delete operation is complete.
     */
    @Delete('/:id')
    async deleteUser(req: FastifyRequest, reply: FastifyReply): Promise<void> {
        const { id } = req.params as { id: string };
        const deleted = await this.userService.deleteUser(parseInt(id));
        if (!deleted) {
            reply.code(404); // Set HTTP status code to 404 Not Found
        } else {
            reply.code(204); // Set HTTP status code to 204 No Content
        }
    }
}