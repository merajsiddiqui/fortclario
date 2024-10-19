import { FastifyRequest, FastifyReply } from 'fastify';
import { UserController } from '../../../src/controllers/user.controller';
import { UserService } from '../../../src/services/user.service';
import { UserResponseContract } from '../../../src/contracts/reply/user-resonse.contract';
import { UserCreateRequestContract } from '../../../src/contracts/request/user-create.contract';

describe('UserController', () => {
  let userController: UserController;
  let userServiceMock: jest.Mocked<UserService>;

  beforeEach(() => {
    userServiceMock = {
      getAllUsers: jest.fn(),
      getUserById: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
    } as any;

    userController = new UserController(userServiceMock);
  });

  describe('getUsers', () => {
    it('should return all users', async () => {
      const mockUsers: UserResponseContract[] = [
        { id: 1, name: 'User 1', email: 'user1@example.com' },
        { id: 2, name: 'User 2', email: 'user2@example.com' },
      ];
      userServiceMock.getAllUsers.mockResolvedValue(mockUsers);

      const result = await userController.getUsers({} as FastifyRequest, {} as FastifyReply);

      expect(result).toEqual(mockUsers);
      expect(userServiceMock.getAllUsers).toHaveBeenCalled();
    });
  });

  describe('getUser', () => {
    it('should return a user when found', async () => {
      const mockUser: UserResponseContract = { id: 1, name: 'User 1', email: 'user1@example.com' };
      userServiceMock.getUserById.mockResolvedValue(mockUser);

      const mockRequest = { params: { id: '1' } } as any;
      const mockReply = { code: jest.fn() } as any;

      const result = await userController.getUser(mockRequest, mockReply);

      expect(result).toEqual(mockUser);
      expect(userServiceMock.getUserById).toHaveBeenCalledWith(1);
      expect(mockReply.code).not.toHaveBeenCalled();
    });

    it('should return null and set 404 status when user not found', async () => {
      userServiceMock.getUserById.mockResolvedValue(null);

      const mockRequest = { params: { id: '1' } } as any;
      const mockReply = { code: jest.fn() } as any;

      const result = await userController.getUser(mockRequest, mockReply);

      expect(result).toBeNull();
      expect(userServiceMock.getUserById).toHaveBeenCalledWith(1);
      expect(mockReply.code).toHaveBeenCalledWith(404);
    });
  });

  describe('createUser', () => {
    it('should create and return a new user', async () => {
      const mockUserData: UserCreateRequestContract = { name: 'New User', email: 'newuser@example.com', password: 'password' };
      const mockCreatedUser: UserResponseContract = { id: 1, name: 'New User', email: 'newuser@example.com' };
      userServiceMock.createUser.mockResolvedValue(mockCreatedUser);

      const mockRequest = { body: mockUserData } as any;
      const mockReply = {} as FastifyReply;

      const result = await userController.createUser(mockRequest, mockReply);

      expect(result).toEqual(mockCreatedUser);
      expect(userServiceMock.createUser).toHaveBeenCalledWith(mockUserData);
    });
  });

  describe('updateUser', () => {
    it('should update and return the user when found', async () => {
      const mockUserData: Partial<UserCreateRequestContract> = { name: 'Updated User' };
      const mockUpdatedUser: UserResponseContract = { id: 1, name: 'Updated User', email: 'user@example.com' };
      userServiceMock.updateUser.mockResolvedValue(mockUpdatedUser);

      const mockRequest = { params: { id: '1' }, body: mockUserData } as any;
      const mockReply = { code: jest.fn() } as any;

      const result = await userController.updateUser(mockRequest, mockReply);

      expect(result).toEqual(mockUpdatedUser);
      expect(userServiceMock.updateUser).toHaveBeenCalledWith(1, mockUserData);
      expect(mockReply.code).not.toHaveBeenCalled();
    });

    it('should return null and set 404 status when user not found for update', async () => {
      userServiceMock.updateUser.mockResolvedValue(null);

      const mockRequest = { params: { id: '1' }, body: {} } as any;
      const mockReply = { code: jest.fn() } as any;

      const result = await userController.updateUser(mockRequest, mockReply);

      expect(result).toBeNull();
      expect(userServiceMock.updateUser).toHaveBeenCalledWith(1, {});
      expect(mockReply.code).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteUser', () => {
    it('should delete the user and set 204 status when successful', async () => {
      userServiceMock.deleteUser.mockResolvedValue(true);

      const mockRequest = { params: { id: '1' } } as any;
      const mockReply = { code: jest.fn() } as any;

      await userController.deleteUser(mockRequest, mockReply);

      expect(userServiceMock.deleteUser).toHaveBeenCalledWith(1);
      expect(mockReply.code).toHaveBeenCalledWith(204);
    });

    it('should set 404 status when user not found for deletion', async () => {
      userServiceMock.deleteUser.mockResolvedValue(false);

      const mockRequest = { params: { id: '1' } } as any;
      const mockReply = { code: jest.fn() } as any;

      await userController.deleteUser(mockRequest, mockReply);

      expect(userServiceMock.deleteUser).toHaveBeenCalledWith(1);
      expect(mockReply.code).toHaveBeenCalledWith(404);
    });
  });
});
