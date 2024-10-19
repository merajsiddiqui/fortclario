import 'reflect-metadata';

import { FastifyInstance, FastifyReply, FastifyRequest, HTTPMethods } from 'fastify';
import { getControllers } from './controller.decorator';
import { ApiSwaggerData } from '../interfaces/swagger.interface';
import { getMiddlewares } from './middleware.decorator';
import { MetadataKeys } from './request.decorator';
import { DependencyInjectionContainer } from './injectable.decorator';
import { validateContract } from '../validators';

// Symbol to store route metadata
const ROUTE_METADATA_KEY = Symbol('routes');


type HandlerFn<Params extends any[] = any[]> = (...args: [FastifyRequest, ...Params ,FastifyReply]) => Promise<any> | void;

/**
 * Interface representing the metadata for a route
 */
interface RouteMetadata {
    method: HTTPMethods;
    path: string;
    handler: HandlerFn;
    swagger?: ApiSwaggerData;
}

/**
 * Decorator factory for HTTP methods
 * @param method - The HTTP method
 * @param path - The route path
 * @param swaggerMetaData - Optional Swagger metadata for the route
 */
function HttpMethod(method: HTTPMethods, path: string, swaggerMetaData?: ApiSwaggerData) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const routes: RouteMetadata[] = Reflect.getMetadata(ROUTE_METADATA_KEY, target.constructor) || [];
        routes.push({ method, path, handler: descriptor.value, swagger: swaggerMetaData });
        Reflect.defineMetadata(ROUTE_METADATA_KEY, routes, target.constructor);
    };
}

/**
 * GET route decorator
 * @param path - The route path
 * @param swaggerMetaData - Optional Swagger metadata for the route
 */
export function Get(path: string, swaggerMetaData?: ApiSwaggerData) {
    return HttpMethod('GET', path, swaggerMetaData);
}

/**
 * POST route decorator
 * @param path - The route path
 * @param swaggerMetaData - Optional Swagger metadata for the route
 */
export function Post(path: string, swaggerMetaData?: ApiSwaggerData) {
    return HttpMethod('POST', path, swaggerMetaData);
}

/**
 * PUT route decorator
 * @param path - The route path
 * @param swaggerMetaData - Optional Swagger metadata for the route
 */
export function Put(path: string, swaggerMetaData?: ApiSwaggerData) {
    return HttpMethod('PUT', path, swaggerMetaData);
}

/**
 * DELETE route decorator
 * @param path - The route path
 * @param swaggerMetaData - Optional Swagger metadata for the route
 */
export function Delete(path: string, swaggerMetaData?: ApiSwaggerData) {
    return HttpMethod('DELETE', path, swaggerMetaData);
}

/**
 * PATCH route decorator
 * @param path - The route path
 * @param swaggerMetaData - Optional Swagger metadata for the route
 */
export function Patch(path: string, swaggerMetaData?: ApiSwaggerData) {
    return HttpMethod('PATCH', path, swaggerMetaData);
}

/**
 * Registers all routes defined in controllers to the Fastify instance
 * This function iterates through all controllers, their routes, and middlewares,
 * and sets up the appropriate Fastify routes with proper request handling and validation.
 * 
 * @param app - The Fastify instance to register routes on
 */
export function registerRoutes(app: FastifyInstance) {
    const controllers = getControllers(); // Get all controllers
    controllers.forEach(({ controller, path }) => {
        const routes: RouteMetadata[] = Reflect.getMetadata(ROUTE_METADATA_KEY, controller) || [];
        const controllerMiddlewares = getMiddlewares(controller);
        routes.forEach((route) => registerRoute(app, controller, path, route, controllerMiddlewares));
    });
}

/**
 * Registers a single route for a controller
 * @param app - The Fastify instance
 * @param controller - The controller class
 * @param controllerPath - The base path for the controller
 * @param route - The route metadata
 * @param controllerMiddlewares - Middlewares for the controller
 */
function registerRoute(app: FastifyInstance, controller: any, controllerPath: string, route: RouteMetadata, controllerMiddlewares: any[]) {
    const { method, path: routePath, handler, swagger } = route;
    const fullPath = `${controllerPath}${routePath}`;
    const routeMiddlewares = getMiddlewares(controller, handler.name);
    const fastifyMethod = method.toLowerCase() as 'get' | 'post' | 'put' | 'delete' | 'patch';
    const middlewares = [...controllerMiddlewares, ...routeMiddlewares];

    const routeSchema = {
        preHandler: createPreHandler(middlewares),
        handler: createRouteHandler(controller, handler, middlewares)
    };

    // Register the route with Fastify
    app[fastifyMethod](fullPath, routeSchema);

    // Register Swagger schema if metadata is provided
    if (swagger) {
        registerSwaggerSchema(app, method, fullPath, routeSchema, swagger);
    }
}

/**
 * Creates a preHandler function to execute middlewares sequentially
 * @param middlewares - Array of middleware functions
 */
function createPreHandler(middlewares: any[]) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        for (const middleware of middlewares) {
            await new Promise<void>((resolve, reject) => {
                middleware(request, reply, (err?: Error) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        }
    };
}

/**
 * Creates the main route handler function
 * @param controller - The controller class
 * @param handler - The route handler method
 * @param middlewares - Array of middleware functions
 */
function createRouteHandler(controller: any, handler: Function, middlewares: any[]) {
    return async (req: FastifyRequest, reply: FastifyReply) => {
        const controllerInstance = DependencyInjectionContainer.get(controller);
        if (!controllerInstance) {
            throw new Error(`Failed to create instance of controller: ${controller}`);
        }
        const params = await buildHandlerParams(req, reply, controller, handler);
        return handler.apply(controllerInstance, params);
    };
}

/**
 * Builds the parameters for the route handler
 * @param req - The Fastify request object
 * @param reply - The Fastify reply object
 * @param controller - The controller class
 * @param handler - The route handler method
 */
async function buildHandlerParams(req: FastifyRequest, reply: FastifyReply, controller: any, handler: Function) {
    const params: any = [req];
    const metadataTypes = [
        { key: MetadataKeys.BODY_METADATA_KEY, value: req.body },
        { key: MetadataKeys.PARAM_METADATA_KEY, value: req.params },
        { key: MetadataKeys.QUERY_METADATA_KEY, value: req.query }
    ];

    for (const { key, value } of metadataTypes) {
        const paramTypes = Reflect.getMetadata('design:paramtypes', controller.prototype);
        const paramIndexes = Reflect.getMetadata(key, controller, handler.name);
        
        for (const index of paramIndexes) {
            const paramType = paramTypes[index];
            if (paramType) {
                if (!await validateContract(value, paramType, reply)) {
                    return; // Validation failed, response sent already
                }
                params.push(value);
            }
        }
    }

    params.push(reply);
    return params;
}

/**
 * Registers Swagger schema for a route
 * @param app - The Fastify instance
 * @param method - The HTTP method
 * @param fullPath - The full path of the route
 * @param routeSchema - The route schema
 * @param swagger - The Swagger metadata
 */
function registerSwaggerSchema(app: FastifyInstance, method: string, fullPath: string, routeSchema: any, swagger: ApiSwaggerData) {
    app.route({
        method,
        url: fullPath,
        ...routeSchema,
        schema: {
            summary: swagger.summary,
            description: swagger.description,
            tags: swagger.tags,
        },
    });
}