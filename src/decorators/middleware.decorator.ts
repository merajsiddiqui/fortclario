import 'reflect-metadata';

const MIDDLEWARE_METADATA_KEY = Symbol('middlewares');

type MiddlewareFunction = (req: any, res: any, next: () => void) => void;

/**
 * @Middleware decorator to associate middleware with a method or a class.
 */
export function Middleware(...middlewares: MiddlewareFunction[]): MethodDecorator & ClassDecorator {
    return function (target: any, propertyKey?: string | symbol) {
        const existingMiddlewares: MiddlewareFunction[] = Reflect.getMetadata(MIDDLEWARE_METADATA_KEY, target, propertyKey!) || [];
        Reflect.defineMetadata(MIDDLEWARE_METADATA_KEY, [...existingMiddlewares, ...middlewares], target, propertyKey!);
    };
}

/**
 * Utility function to retrieve the middleware functions.
 */
export function getMiddlewares(target: any, propertyKey?: string | symbol): MiddlewareFunction[] {
    return Reflect.getMetadata(MIDDLEWARE_METADATA_KEY, target, propertyKey!) || [];
}
