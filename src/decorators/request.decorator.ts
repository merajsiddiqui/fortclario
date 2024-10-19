import 'reflect-metadata';

/**
 * Symbol keys for storing metadata about request parameters
 */
const BODY_METADATA_KEY = Symbol('body');
const PARAM_METADATA_KEY = Symbol('params');
const QUERY_METADATA_KEY = Symbol('query');

/**
 * Decorator for marking a parameter as the request body
 * @returns {Function} Decorator function
 */
export function Body() {
    return function (target: any, propertyKey: string, parameterIndex: number) {
        const existingMetadata = Reflect.getMetadata(BODY_METADATA_KEY, target, propertyKey) || [];
        existingMetadata.push(parameterIndex);
        Reflect.defineMetadata(BODY_METADATA_KEY, existingMetadata, target, propertyKey);
    };
}

/**
 * Decorator for marking a parameter as a query parameter
 * @returns {Function} Decorator function
 */
export function Query() {
    return function (target: any, propertyKey: string, parameterIndex: number) {
        const existingMetadata = Reflect.getMetadata(QUERY_METADATA_KEY, target, propertyKey) || [];
        existingMetadata.push(parameterIndex);
        Reflect.defineMetadata(QUERY_METADATA_KEY, existingMetadata, target, propertyKey);
    };
}

/**
 * Decorator for marking a parameter as a route parameter
 * @returns {Function} Decorator function
 */
export function Param() {
    return function (target: any, propertyKey: string, parameterIndex: number) {
        const existingMetadata = Reflect.getMetadata(PARAM_METADATA_KEY, target, propertyKey) || [];
        existingMetadata.push(parameterIndex);
        Reflect.defineMetadata(PARAM_METADATA_KEY, existingMetadata, target, propertyKey);
    };
}

/**
 * Object containing metadata keys for easy access
 */
export const MetadataKeys = {
    BODY_METADATA_KEY,
    PARAM_METADATA_KEY,
    QUERY_METADATA_KEY,
};
