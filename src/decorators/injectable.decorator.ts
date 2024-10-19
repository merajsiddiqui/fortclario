import 'reflect-metadata';

const INJECTABLE_METADATA_KEY = Symbol('injectable');


class DependencyInjectionContainer {

    private services = new Map();

    // Register a service class with the container
    public register<T>(serviceIdentifier: string, serviceClass: new () => T): void {
        this.services.set(serviceIdentifier, new serviceClass());
    }

    // Resolve a service by its identifier
    public resolve<T>(serviceIdentifier: string): T {
        const serviceInstance = this.services.get(serviceIdentifier);
        if (!serviceInstance) {
            throw new Error(`Service not found: ${serviceIdentifier}`);
        }
        return serviceInstance;
    }
}

// Create a singleton instance of DependencyInjectionContainer
export const container = new DependencyInjectionContainer();

export function Injectable(): ClassDecorator {
    return (target: any) => {
        // Register the service class with the container
        container.register(target.name, target);
        // Mark the class as injectable
        Reflect.defineMetadata(INJECTABLE_METADATA_KEY, true, target);
    };
}

export function Inject(serviceIdentifier: any): PropertyDecorator {
    return (target: any, propertyKey: string | symbol) => {
        // Resolve the instance from the container and assign it to the property
        Object.defineProperty(target, propertyKey, {
            get: () => container.resolve(serviceIdentifier.name),
            enumerable: true,
            configurable: true,
        });
    };
}

