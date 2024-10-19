import 'reflect-metadata';

const INJECTABLE_METADATA_KEY = Symbol('injectable');

export class DependencyInjectionContainer {
    static resolve(serviceIdentifier: new (...args: any[]) => any): any {
        throw new Error('Method not implemented.');
    }
    public static registry = new Map<Function, any>();

    static register(serviceClass: Function) {
        // Only register if it hasn't been registered yet
        if (!this.registry.has(serviceClass)) {
            if (typeof serviceClass !== 'function' || !serviceClass.prototype) {
                throw new Error(`Invalid service class: ${serviceClass}`);
            }
            const instance = new (serviceClass as new () => any)(); // Instantiate the service class
            this.registry.set(serviceClass, instance);
            console.log(`Registered service: ${serviceClass.name}`);
        } else {
            console.warn(`Service already registered: ${serviceClass.name}`);
        }
        
    }

    static get<T>(serviceClass: new (...args: any[]) => T): T {
        const instance = this.registry.get(serviceClass);
        if (!instance) {
            throw new Error(`Service not found: ${serviceClass.name}`);
        }
        return instance;
    }
}

export function Injectable(): ClassDecorator {
    return (target: any) => {
        // Register the service class with the container
        if (!DependencyInjectionContainer.registry.has(target)) {
            DependencyInjectionContainer.register(target); // Register only if not already registered
        }
        // Mark the class as injectable
        Reflect.defineMetadata(INJECTABLE_METADATA_KEY, true, target);
    };
}

export function Inject(serviceIdentifier: new (...args: any[]) => any): ParameterDecorator {
    return (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
        const existingParameters = Reflect.getMetadata('design:paramtypes', target) || [];
        const resolvedService = DependencyInjectionContainer.get(serviceIdentifier);
        existingParameters[parameterIndex] = resolvedService;
        Reflect.defineMetadata('design:paramtypes', existingParameters, target);
    };
}

