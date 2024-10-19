import Ajv from 'ajv';
import { FastifyReply } from 'fastify';

const ajv = new Ajv();

function getSchemaForType(type: string): any {
    switch (type) {
        case 'string':
            return { type: 'string' };
        case 'number':
            return { type: 'number' };
        case 'boolean':
            return { type: 'boolean' };
        case 'object':
            return { type: 'object' }; // For further customization
        default:
            return undefined;
    }
}

function generateSchemaForContract(contract: any): any {
    const schema: any = { type: 'object', properties: {}, required: [] };
    
    for (const key in contract) {
        const fieldType = typeof contract[key];
        schema.properties[key] = getSchemaForType(fieldType) || { type: 'object' }; // Default to object if unknown type
        schema.required.push(key);
    }

    return schema;
}

export async function validateContract(data: any, contract: any, reply: FastifyReply) {
    const schema = generateSchemaForContract(contract);
    const validate = ajv.compile(schema);
    const valid = validate(data);
    
    if (!valid) {
        reply.code(400).send({ error: 'Invalid data', issues: validate.errors });
        return false;
    }

    return true;
}
