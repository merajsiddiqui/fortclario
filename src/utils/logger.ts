// src/logger.ts
import { createLogger, format, transports } from 'winston';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import DailyRotateFile = require('winston-daily-rotate-file');
import fs from 'fs';
import path from 'path';

const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

const logDir = path.join(process.cwd(), 'logs');
const logFilePath = path.join(logDir, 'application-%DATE%.log');

// Ensure log directory exists
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// Define the logger
const logger = createLogger({
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        // Log to console for debugging
        new transports.Console({
            level: 'debug',
            format: format.combine(
                format.colorize(),
                format.simple()
            )
        }),
        // Daily rotating log file
        new DailyRotateFile({
            filename: logFilePath,
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
            level: 'info'
        })
    ],
});

// Function to upload logs to S3
const uploadLogToS3 = async (logFileName: string) => {
    const fileContent = fs.readFileSync(path.join(logDir, logFileName));
    const params = {
        Bucket: 'YOUR_S3_BUCKET_NAME',
        Key: `logs/${logFileName}`,
        Body: fileContent,
    };

    try {
        await s3Client.send(new PutObjectCommand(params));
        logger.info(`Successfully uploaded ${logFileName} to S3`);
    } catch (error) {
        logger.error('Error uploading log to S3:', error);
    }
};

// Monitor for application crashes and upload logs
process.on('exit', async () => {
    const logFiles = fs.readdirSync(logDir);
    for (const logFile of logFiles) {
        await uploadLogToS3(logFile);
    }
});

// Usage
logger.info('Logger initialized');

export default logger;
