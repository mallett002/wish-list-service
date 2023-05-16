import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { Handler } from 'aws-lambda';

export const handler = async (event?: any, context?: any) => {
    const client = new DynamoDBClient({ region: "us-east-1" });

    try {

        const input = {
            Item: {
                gift_id: {
                    S: 'ABE1D7B5-4EEA-4C78-A51B-3B6C1314DBCD'
                },
                for_user: {
                    S: 'C2D9F0C7-83A5-4303-B319-C918C8473434'
                },
                description: {
                    S: 'see link, something pink.'
                },
                link: {
                    S: 'https://amazon.com'
                },
                name: {
                    S: 'HAT'
                },
                purchased: {
                    BOOL: false
                }
            },
            ReturnConsumedCapacity: 'TOTAL',
            TableName: 'wish-list-gift'
        };

        const command = new PutItemCommand(input);
        const response = await client.send(command);
        console.log({ response });

        // TODO implement
        return { statusCode: 201 };

    } catch (error) {

        return {
            statusCode: 201,
            body: JSON.stringify({
                message: 'hello world',
            }),
        };
    }
};
