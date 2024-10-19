import 'reflect-metadata';

/**
 * Symbol key for storing metadata about injectable classes
 */
const INJECTABLE_METADATA_KEY = Symbol('injectable');

/**
 * Container for managing dependency injection
 */
export class DependencyInjectionContainer {
    /**
     * Resolves a service (not implemented)
     * @param serviceIdentifier - The service class to resolve
     */
    static resolve(serviceIdentifier: new (...args: any[]) => any): any {
        throw new Error('Method not implemented.');
    }

    /**
     * Registry to store service instances
     */
    public static registry = new Map<Function, any>();

    /**
     * Registers a service class in the container
     * @param serviceClass - The service class to register
     */
    static register(serviceClass: Function, instanceOrClass?: any) {
        // Only register if it hasn't been registered yet
        if (!this.registry.has(serviceClass)) {
            
            if (typeof serviceClass !== 'function' || !serviceClass.prototype) {
                throw new Error(`Invalid service class: ${serviceClass}`);
            }

            let instance;
            if (instanceOrClass !== undefined) {
                if (Array.isArray(instanceOrClass) && instanceOrClass.length === 1) {
                    // Handle case like [[EntityManager<1>]]
                    instance = instanceOrClass[0];
                } else if (typeof instanceOrClass === 'function') {
                    // If it's a class (constructor), create an instance
                    instance = new instanceOrClass();
                } else if (typeof instanceOrClass === 'object') {
                    // If it's an instance, use it directly
                    instance = instanceOrClass;
                } else {
                    throw new Error(`Invalid service class: ${instanceOrClass}`);
                }

                if (instance) {
                    this.registry.set(serviceClass, instance);
                    console.log(`Registered service with provided instance: ${serviceClass.name}`);
                    return;
                }
            }
            // If instanceOrClass is undefined, continue with the existing logic

            // Get the parameter types from the 'design:paramtypes' metadata
            const paramTypes = Reflect.getMetadata('design:paramtypes', serviceClass) || [];
            const resolvedDependencies = paramTypes.map((dependency: any) => {
                const resolvedDependency = this.registry.get(dependency);
                if (!resolvedDependency) {
                    // If not already registered, register the dependency first
                    this.register(dependency);
                    return this.registry.get(dependency);
                }
                return resolvedDependency;
            });

            // Create a new instance with resolved dependencies
            instance = new (serviceClass as new (...args: any[]) => any)(...resolvedDependencies);
            this.registry.set(serviceClass, instance);
            console.log(`Registered service: ${serviceClass.name}`);
        } else {
            console.warn(`Service already registered: ${serviceClass.name}`);
        }
    }


    /**
     * Retrieves an instance of a registered service
     * @param serviceClass - The service class to retrieve
     * @returns The instance of the requested service
     * @throws Error if the service is not found
     */
    static get<T>(serviceClass: new (...args: any[]) => T): T {
        const instance = this.registry.get(serviceClass);
        if (!instance) {
            throw new Error(`Service not found: ${serviceClass.name}`);
        }
        return instance;
    }
}

/**
 * Decorator to mark a class as injectable
 * @returns A class decorator
 */
export function Injectable(): ClassDecorator {
    return (target: any) => {
        console.log("trying to register", target);
        // Register the service class with the container
        if (!DependencyInjectionContainer.registry.has(target)) {
            DependencyInjectionContainer.register(target); // Register only if not already registered
            console.log('setting', target);
        }
        // Mark the class as injectable
        Reflect.defineMetadata(INJECTABLE_METADATA_KEY, true, target);
    };
}

/**
 * Decorator to inject a dependency into a class constructor
 * @param serviceIdentifier - The service class to inject
 * @returns A parameter decorator
 */
export function Inject(serviceIdentifier: new (...args: any[]) => any): ParameterDecorator {
    return (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
        const existingParameters = Reflect.getMetadata('design:paramtypes', target) || [];
        const resolvedService = DependencyInjectionContainer.get(serviceIdentifier);
        
        if (!resolvedService) {
            throw new Error(`${serviceIdentifier.name} could not be resolved from the container`);
        }
        // Update the parameters array
        existingParameters[parameterIndex] = resolvedService;
        const updatedParams = Reflect.getMetadata('design:paramtypes', target);
        console.log(updatedParams);
    };
}
