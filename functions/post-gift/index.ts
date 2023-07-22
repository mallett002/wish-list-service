import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import {randomUUID} from 'node:crypto';
import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEvent, context?: any): Promise<APIGatewayProxyResult> => {
    const client = new DynamoDBClient({ region: "us-east-1" });
    console.log('logging event...');
    console.log(JSON.stringify(event, null, 2));

    console.log('logging context...');
    console.log(JSON.stringify(context, null, 2));

    const { familyId, email } = event.pathParameters;

    // PK: FAMILY#<familyId>
    // SK: MEMBER#<email>#GIFT#<giftId>
    const { description, link, title } = JSON.parse(event.body || '{}');
// {
//     "familyId": "family1",
//     "email": "mallett002@gmail.com",
//     "description": "hat",
//     "link": "google.com",
//     "title": "Hat"
// }

    if (!familyId || !email || !title) {

        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true
            },
            body: JSON.stringify({ message: 'missing request body values' })
        };
    }

    try {
        const giftId = randomUUID();
        const input = {
            Item: {
                PK: {
                    S: `FAMILY#${familyId}`
                },
                SK: {
                    S: `MEMBER#${email}GIFT#${giftId}`
                },
                description: {
                    S: description || ""
                },
                link: {
                    S: link || ""
                },
                title: {
                    S: title
                },
                purchased: {
                    BOOL: false // todo: make an update gift handler to mark as purchased/edit the gift
                }
            },
            ReturnConsumedCapacity: 'TOTAL',
            TableName: 'wish-list-table'
        };

        const command = new PutItemCommand(input);

        await client.send(command);

        return {
            statusCode: 201,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true
            },
            body: JSON.stringify({ created: `FAMILY#${familyId}` })
        };
    } catch (error: any) {
        return {
            statusCode: error?.$metadata?.httpStatusCode,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true
            },
            body: JSON.stringify({ reason: error.name, error })
        };
    }
};
