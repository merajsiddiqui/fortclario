import { FastifyRequest, FastifyReply } from 'fastify';
import { Controller } from "../decorators/controller.decorator";
import { Get, Post, Put, Delete } from "../decorators/route.decorator";
import { Middleware } from '../decorators/middleware.decorator';
import { UserResponseContract } from '../contracts/reply/user-resonse.contract';
import { UserCreateRequestContract } from '../contracts/request/user-create.contract';
import UserService from '../services/user.service';
import { authenticate } from '../middlewares/auth.middleware';
import { Inject, Injectable } from '../decorators/injectable.decorator';
import  { Body, Param } from '../decorators/request.decorator';
import { GetUserDetailRequestContract } from '../contracts/request/user-id.contract';
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
    constructor( private userService: UserService) {}

    /**
     * Retrieves all users.
     * @param {FastifyRequest} req - The request object.
     * @param {FastifyReply} reply - The reply object.
     * @returns {Promise<UserResponseContract[]>} A promise that resolves to an array of user response contracts.
     */
    @Middleware(authenticate)
    @Get('/')
    async getUsers( reply: FastifyReply): Promise<UserResponseContract[]> {
        return this.userService.getAllUsers()
    }

    /**
     * Retrieves a specific user by ID.
     * @param {FastifyRequest} req - The request object.
     * @param {FastifyReply} reply - The reply object.
     * @returns {Promise<UserResponseContract | null>} A promise that resolves to a user response contract or null if not found.
     */
    @Get('/:id')
    async getUser( @Param() userRequest: GetUserDetailRequestContract, reply: FastifyReply): Promise<UserResponseContract | null> {
        const user = await this.userService.getUserById(userRequest.id);
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
    async createUser(@Body() userData: UserCreateRequestContract, reply: FastifyReply): Promise<UserResponseContract> {
        const createdUser = await this.userService.createUser(userData);
        reply.code(201); // Set HTTP status code to 201 Created
        return createdUser;
    }

}