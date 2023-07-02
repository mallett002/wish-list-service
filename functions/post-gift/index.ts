import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEvent, context?: any): Promise<APIGatewayProxyResult> => {
    const client = new DynamoDBClient({ region: "us-east-1" });
    console.log('logging event...');
    console.log(JSON.stringify(event, null, 2));

    console.log('logging context...');
    console.log(JSON.stringify(context, null, 2));

    // PK: FAMILY#<familyId>    ex: FAMILY#ABE1D7B5-4EEA-4C78-A51B-3B6C1314DBCW
    // SK: #MEMBER#<username>#GIFT#<giftId>    ex: #MEMBER#mallett002@gmail.com#GIFT#C2D9F0C7-83A5-4303-B319-C918C8473434
    const { familyId, username, giftId, description, link, title } = JSON.parse(event.body || '{}');

// {
//     "familyId": "family1",
//     "username": "mallett002@gmail.com",
//     "giftId": "gift1", // todo: create this guid in this handler. don't pass it in.
//     "description": "hat",
//     "link": "google.com",
//     "title": "Hat"
// }

    if (!familyId || !username || !giftId || !title) {

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
        const input = {
            Item: {
                PK: {
                    S: `FAMILY#${familyId}`
                },
                SK: {
                    S: `#MEMBER#${username}#GIFT#${giftId}`
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
                    BOOL: false
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
