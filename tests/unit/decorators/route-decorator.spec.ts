import 'reflect-metadata';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { Get, Post, Put, Delete, Patch, registerRoutes } from '../../../src/decorators/route.decorator';
import { Controller } from '../../../src/decorators/controller.decorator';

describe('Route Decorators', () => {

  let mockApp: Partial<FastifyInstance>;
  
  beforeEach(() => {
    mockApp = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn(),
      route: jest.fn()
    };
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should register routes with correct HTTP methods', () => {
    
    @Controller('/test')
    class TestController {
      @Get('/get')
      getMethod() {}

      @Post('/post')
      postMethod() {}

      @Put('/put')
      putMethod() {}

      @Delete('/delete')
      deleteMethod() {}

      @Patch('/patch')
      patchMethod() {}
    }

    registerRoutes(mockApp as FastifyInstance);

    expect(mockApp.get).toHaveBeenCalledWith('/test/get', expect.any(Function));
    expect(mockApp.post).toHaveBeenCalledWith('/test/post', expect.any(Function));
    expect(mockApp.put).toHaveBeenCalledWith('/test/put', expect.any(Function));
    expect(mockApp.delete).toHaveBeenCalledWith('/test/delete', expect.any(Function));
    expect(mockApp.patch).toHaveBeenCalledWith('/test/patch', expect.any(Function));
  });

  it('should register routes with Swagger metadata when provided', () => {

    @Controller('/api')
    class ApiController {
      @Get('/users', { summary: 'Get all users', tags: ['users'] })
      getUsers() {}
    }

    registerRoutes(mockApp as FastifyInstance);

    expect(mockApp.route).toHaveBeenCalledWith({
      method: 'GET',
      url: '/api/users',
      handler: expect.any(Function),
      schema: {
        summary: 'Get all users',
        tags: ['users'],
      },
    });
  });

  it('should call the handler function when route is invoked', async () => {
    const mockHandler = jest.fn();
    
    @Controller('/api')
    class ApiController {
      @Get('/test')
      testMethod() {
        return mockHandler();
      }
    }

    registerRoutes(mockApp as FastifyInstance);

    // Get the registered handler
    const registeredHandler = (mockApp.get as jest.Mock).mock.calls[0][1];

    // Create mock request and reply objects
    const mockReq = {} as FastifyRequest;
    const mockReply = {} as FastifyReply;

    // Call the registered handler
    await registeredHandler(mockReq, mockReply);

    // Verify that our mock handler was called
    expect(mockHandler).toHaveBeenCalled();
  });
});
