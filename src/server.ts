import dotenv from 'dotenv';
dotenv.config();
import {App} from './app';
import {FastifyListenOptions, FastifyReply, FastifyRequest} from 'fastify';
const application = new App();
const app = application.app;
const PORT = process.env.APP_PORT || '3000';

/**
 * Handling unhandled Rejection or any unhandled error
 */

process.on('uncaughtException', err => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
/**
 * Starting the server
 */
const startServer = async () => {
    try {
        await application.initializeDatabase();
        await application.enableRoutes();
        const listenOptions: FastifyListenOptions = {
            port: parseInt(PORT),
            host: '0.0.0.0'
        };
        app.listen(listenOptions, (err, address) => {
            if (err) throw new Error(err.message);
            console.log(`Server running at ${address}`);
        });
    } catch (error) {
        app.log.error(error);
        process.exit(1);
    }
    app.get('/', (_:FastifyRequest, repl: FastifyReply) => {
        repl.send({message: 'Health Check API'});
    });
};
/**
 * Handle special termination command
 */
['SIGINT', 'SIGTERM'].forEach(signal => {
    process.on(signal, () =>
        app.close().then(err => {
            console.log(`Closing application on ${signal}`);
            process.exit(err ? 1 : 0);
        })
    );
});

startServer().then(r => { 
});