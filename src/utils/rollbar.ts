import Rollbar from 'rollbar';

let rollbarInstance: Rollbar | null = null;

if (process.env.APP_ENVIRONMENT !== 'development' && process.env.APP_ENVIRONMENT !== 'test') {
    const rollbarConfiguration: Rollbar.Configuration = {
        accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
        captureIp: true,
        environment: [process.env.APP_ENV, process.env.NAMESPACE].join('-'),
        captureUncaught: true,
        addErrorContext: true,
        captureUnhandledRejections: true,
    };
    rollbarInstance = new Rollbar(rollbarConfiguration);
}

export { rollbarInstance };