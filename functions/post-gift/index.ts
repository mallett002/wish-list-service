import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { randomUUID } from 'node:crypto';
import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';

interface IGift {
    familyId: string
    email: string
    giftId: string
    description: string
    link: string
    title: string
    purchased: boolean
    favorite: boolean
}

export const handler = async (event: APIGatewayProxyEvent, context?: any): Promise<APIGatewayProxyResult> => {
    const client = new DynamoDBClient({ region: "us-east-1" });
    console.log('logging event...');
    console.log(JSON.stringify(event, null, 2));

    console.log('logging context...');
    console.log(JSON.stringify(context, null, 2));

    const { familyId, email } = event.pathParameters;

    // PK: FAMILY#<familyId>
    // SK: MEMBER#<email>#GIFT#<giftId>
    const { description, link, title, favorite } = JSON.parse(event.body || '{}');
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
                    BOOL: false
                },
                favorite: {
                    BOOL: favorite || false
                }
            },
            TableName: 'wish-list-table'
        };

        const command = new PutItemCommand(input);
        const createGiftResponse = await client.send(command);
        console.log({ createGiftResponse });

        const gift: IGift = {
            familyId,
            email,
            giftId,
            description: description || '',
            link: link || '',
            title,
            purchased: false,
            favorite: favorite || false,
        };

        return {
            statusCode: 201,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true
            },
            body: JSON.stringify({ gift })
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
