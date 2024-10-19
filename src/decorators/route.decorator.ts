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
        
        routes.forEach(({ method, path: routePath, handler, swagger }) => {
            const fullPath = `${path}${routePath}`;
            const routeMiddlewares = getMiddlewares(controller, handler.name);
            // Ensure method is a valid Fastify method
            const fastifyMethod = method.toLowerCase() as 'get' | 'post' | 'put' | 'delete' | 'patch';
            const middlewares = [...controllerMiddlewares, ...routeMiddlewares];

            const routeSchema = {
                // Adding prehandler to execute middlewares sequentially
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
                // Main route handler
                handler: async (req: FastifyRequest, reply: FastifyReply) => {
                    // Get controller instance from DI container
                    const controllerInstance = DependencyInjectionContainer.get(controller);
                    if (!controllerInstance) {
                        throw new Error(`Failed to create instance of controller: ${controller}`);
                    }

                    const params: any = [req]; // Start with request

                    // Define metadata types for body, params, and query
                    const metadataTypes = [
                        { key: MetadataKeys.BODY_METADATA_KEY, value: req.body },
                        { key: MetadataKeys.PARAM_METADATA_KEY, value: req.params },
                        { key: MetadataKeys.QUERY_METADATA_KEY, value: req.query }
                    ];

                    // Validate and add parameters based on metadata
                    for (const { key, value } of metadataTypes) {
                        const contract = Reflect.getMetadata(key, controller, handler.name);
                        console.log(contract, 'contract');
                        if (contract) {
                            // Validate contract and return if validation fails
                            if (!await validateContract(value, contract, reply)) {
                                return; // Validation failed, response sent already
                            }
                            params.push(value);
                        }
                    }

                    params.push(reply);
                    // Call the handler with the relevant parameters
                    return handler.apply(controllerInstance, params);
                }
            }
            // Register the route with Fastify
            app[fastifyMethod](fullPath, routeSchema);

            // Register Swagger schema if metadata is provided
            if (swagger) {
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
        });
    });
}