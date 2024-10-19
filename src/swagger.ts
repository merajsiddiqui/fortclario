import {FastifyDynamicSwaggerOptions} from '@fastify/swagger';
import {FastifySwaggerUiOptions} from '@fastify/swagger-ui';
import {FastifyRegisterOptions} from 'fastify';

export const OpenAPIV3Option: FastifyRegisterOptions<FastifyDynamicSwaggerOptions> = {
    openapi: {
        info: {
            title: 'Auth Service',
            description: 'Auth Micro service to handle auth functionalities',
            version: '1.0.0',
            contact: {
                name: 'Meraj Ahmad Siddiqui',
                url: '',
                email: 'merajs@prosperix.com'
            },
            termsOfService: '',
            license: {
                name: '',
                url: ''
            }
        },
        components: {
            securitySchemes: {
                'authorization': {
                    type: 'http',
                    scheme: 'bearer',
                    description: 'User Authorization token',
                    bearerFormat: 'jwt'
                },
                'clientId': {
                    type: 'apiKey',
                    in: 'header',
                    description: 'Client Id',
                    name: 'client-Id'
                },
                'clientSecret': {
                    type: 'apiKey',
                    in: 'header',
                    description: 'Client Secret',
                    name: 'client-secret'
                }
            }
        },
        servers: [
            {
                url: 'http://localhost',
                description: 'LocalServer',
            },
        ],
    },
    stripBasePath: true
};

export const SwaggerUiConfig: FastifyRegisterOptions<FastifySwaggerUiOptions> = {
    routePrefix: '/public/docs',
    uiConfig: {
        docExpansion: 'list',
        deepLinking: false,
    },
    staticCSP: true,
};