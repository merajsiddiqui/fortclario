import 'reflect-metadata';

/**
 * Symbol used as a key for storing controller metadata.
 */
const CONTROLLER_METADATA_KEY = Symbol('controllers');

/**
 * Decorator function to mark a class as a controller and specify its base path.
 * @param {string} prefix - The base path for all routes in this controller.
 * @returns {Function} A decorator function to be applied to a controller class.
 */
export function Controller(prefix: string) {
    return function (target: Function) {
        // Register the prefix metadata to the controller class
        Reflect.defineMetadata(CONTROLLER_METADATA_KEY, prefix, target);

        // Add the controller to the global controller list
        const controllers = Reflect.getMetadata(CONTROLLER_METADATA_KEY, Reflect) || [];
        controllers.push(target);
        Reflect.defineMetadata(CONTROLLER_METADATA_KEY, controllers, Reflect);
    };
}

/**
 * Retrieves all registered controllers and their associated base paths.
 * @returns {Array<{controller: any, path: string}>} An array of objects containing controller classes and their base paths.
 */
export function getControllers(): { controller: any; path: string }[] {
    const controllers: { controller: any; path: string }[] = [];
    const allControllers = Reflect.getMetadata(CONTROLLER_METADATA_KEY, Reflect) || [];

    // Iterate through all registered controllers
    for (const controller of allControllers) {
        // Retrieve the base path for each controller
        const basePath = Reflect.getMetadata(CONTROLLER_METADATA_KEY, controller);
        controllers.push({ controller, path: basePath });
    }

    return controllers;
}
