import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { Handler } from 'aws-lambda';

export const handler = async (event?: APIGatewayEvent, context?: any): Promise<APIGatewayProxyResult> => {
    const client = new DynamoDBClient({ region: "us-east-1" });
    console.log('logging event...');

    console.log(JSON.stringify(event, null, 2));

    console.log('logging context...');

    console.log(JSON.stringify(context, null, 2));

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true
        },
        body: JSON.stringify({ salutation: `hello....` })
    };
};
