import 'reflect-metadata';
import {join} from 'path';
import { readdirSync } from 'fs';
import Fastify, {FastifyInstance, FastifyError, FastifyReply, FastifyRequest} from 'fastify';
import { rollbarInstance } from './utils/rollbar';
import { OpenAPIV3Option, SwaggerUiConfig } from './swagger';
import { EntityManager, MikroORM } from '@mikro-orm/core';
import mikroOrmConfig from './config/mikro-orm.config';
import logger from './utils/logger';
import { registerRoutes } from './decorators/route.decorator';
import { DependencyInjectionContainer } from './decorators/injectable.decorator';


/**
 * @package App
 * @description This class is the main Source of Application Entery
 */
export class App {

    /**
     * @var app FastifyInstance
     */
    public app: FastifyInstance;

    /**
     * @var enableMonitoring bool
     */
    public enableMonitoring: boolean = false;

    /**
     * @var orm MikroORM
     */
    private orm!: MikroORM;

    /**
     * 
     * @param logLevel 
     */
    constructor(logLevel: string = 'info') {
        this.app = Fastify.default({logger: {level: logLevel || process.env.LOG}});
        this.enableErrorHandler();
        this.app.register(require('@fastify/cors'), {origin: '*'});
        this.app.register(require('@fastify/swagger'), OpenAPIV3Option);
        this.app.register(require('@fastify/swagger-ui'), SwaggerUiConfig);
    }

    /**
     * Initialize the database connection using MikroORM
     * @public initializeDatabase
     */
    public async initializeDatabase(): Promise<void> {
        try {
            this.orm = await MikroORM.init(mikroOrmConfig);
            DependencyInjectionContainer.register(EntityManager, this.orm.em.fork());
            console.log('Database connection established');
        } catch (error) {
            console.error('Failed to connect to the database:', error);
            throw error;
        }
    }

    /**
     * Register all routes in application
     *  @private enableRoutes
     **/
    public enableRoutes() {
        this.loadAllControllers();
        // Removing content type in case content not available
        this.app.addHook('onRequest', (req, reply, next) => {
            if (!req.headers['content-length'] || req.headers['content-length'] == '0') {
                delete req.headers['content-type'];
            }
            next();
        });
        /**
         * Add code coverage
         */
        if (process.env.NODE_ENV === 'development') {
            this.app.register(require('@fastify/static'), {
                root: join(__dirname, '../coverage'),
                prefix: '/public/coverage',
                prefixAvoidTrailingSlash: true,
            });
        }
    }

    /**
     * This method will load all controllers
     * @private loadAllControllers
     */
    private async loadAllControllers(): Promise<void> {
        const controllersDir = join(__dirname, 'controllers');
        const files = readdirSync(controllersDir);
    
        for (const file of files) {
            if (file.endsWith('.ts') || file.endsWith('.js')) {
                const controllerPath = join(controllersDir, file);
                try {
                    // Use dynamic import
                    const { default: ControllerClass } = await import(controllerPath);
                    // Check and register the controller
                    if (typeof ControllerClass === 'function') {
                        DependencyInjectionContainer.register(ControllerClass); // This will handle duplicates
                        logger.info(`Loading ${controllerPath}`);
                    }
                } catch (error) {
                    console.error(`Error loading controller from ${controllerPath}:`, error);
                }
            }
        }
        registerRoutes(this.app);
    }

    /**
     * Enable error handling for routes
     * @private enableErrorHandler
     **/
    private enableErrorHandler(): void {
        this.app.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
            if (error.validation) {
                if (rollbarInstance) {
                    // @ts-ignore
                    request.routeOptions?.url?.indexOf('internal') > 0
                        ? rollbarInstance.error(error.message, error, request)
                        : rollbarInstance.log(error.message, error, request);
                }

                reply.status(400).send(error.validation);
            } else {
                if (rollbarInstance) {
                    rollbarInstance.critical(error.message, error, request);
                }
                console.error(error.message);
                reply.status(500).send({error: error.message});
            }
        });
    }

    
}