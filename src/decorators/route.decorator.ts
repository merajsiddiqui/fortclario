import 'reflect-metadata';

import { FastifyInstance, FastifyReply, FastifyRequest, HTTPMethods } from 'fastify';
import { getControllers } from './controller.decorator';
import { ApiSwaggerData } from '../interfaces/swagger.interface';
import { getMiddlewares } from './middleware.decorator';
import { DependencyInjectionContainer } from './injectable.decorator';

// Symbol to store route metadata
const ROUTE_METADATA_KEY = Symbol('routes');

/**
 * Interface representing the metadata for a route
 */
interface RouteMetadata {
    method: HTTPMethods;
    path: string;
    handler: (req: FastifyRequest, reply: FastifyReply) => Promise<any> | void;
    swagger?: ApiSwaggerData
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
 * @param app - The Fastify instance
 */
export function registerRoutes(app: FastifyInstance) {
    const controllers = getControllers(); // Get all controllers

    controllers.forEach(({ controller, path }) => {
        const routes: RouteMetadata[] = Reflect.getMetadata(ROUTE_METADATA_KEY, controller) || [];
        const controllerMiddlewares = getMiddlewares(controller);
        routes.forEach(({ method, path: routePath, handler, swagger }) => {
            const fullPath = `${path}${routePath}`;
            const routeMiddlewares = getMiddlewares(controller, handler.name);
            // Ensure method is a valid Fastify method
            const fastifyMethod = method.toLowerCase() as 'get' | 'post' | 'put' | 'delete' | 'patch';
            const middlewares = [...controllerMiddlewares, ...routeMiddlewares];
            const routSchema = {
                preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
                    for (const middleware of middlewares) {
                        await new Promise<void>((resolve, reject) => {
                            middleware(request, reply, (err?: Error) => {
                                if (err) reject(err);
                                else resolve();
                            });
                        });
                    }
                },
                handler: async (req: FastifyRequest, reply: FastifyReply) => {
                    // Bind the handler to the controller instance
                    const controllerInstance = DependencyInjectionContainer.get(controller); // Get the controller instance
                    return handler.bind(controllerInstance)(req, reply); // Bind the handler to the instance
                }
            }
            
            // Register the route with Fastify
            app[fastifyMethod](fullPath, routSchema);

            // If Swagger metadata is provided, register the route with Swagger schema
            if (swagger) {
                app.route({
                    method,
                    url: fullPath,
                    ...routSchema,
                    schema: {
                        summary: swagger.summary,
                        description: swagger.description,
                        tags: swagger.tags,
                    },
                });
            }
        });
    });
}