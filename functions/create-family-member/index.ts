import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';

// POST /families
export const handler = async (event: APIGatewayProxyEvent, context?: any): Promise<APIGatewayProxyResult> => {
    console.log(JSON.stringify({event, context}));
    const client = new DynamoDBClient({ region: "us-east-1" });

    // Return this for now..
    return {
        statusCode: 201,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true
        },
        body: JSON.stringify({ created: 'nothing yet ;)' })
};

    // PK: FAMILY#<familyId>
    // SK: MEMBER#<username>

    // if (!familyId || !username || !giftId || !title) {

    //     return {
    //         statusCode: 400,
    //         headers: {
    //             "Access-Control-Allow-Origin": "*",
    //             "Access-Control-Allow-Credentials": true
    //         },
    //         body: JSON.stringify({ message: 'missing request body values' })
    //     };
    // }

    // try {
    //     const input = {
    //         Item: {
    //             PK: {
    //                 S: `FAMILY#${familyId}`
    //             },
    //             SK: {
    //                 S: `#MEMBER#${username}#GIFT#${giftId}`
    //             },
    //             description: {
    //                 S: description || ""
    //             },
    //             link: {
    //                 S: link || ""
    //             },
    //             title: {
    //                 S: title
    //             },
    //             purchased: {
    //                 BOOL: false
    //             }
    //         },
    //         ReturnConsumedCapacity: 'TOTAL',
    //         TableName: 'wish-list-table'
    //     };

    //     const command = new PutItemCommand(input);

    //     await client.send(command);

    //     return {
    //         statusCode: 201,
    //         headers: {
    //             "Access-Control-Allow-Origin": "*",
    //             "Access-Control-Allow-Credentials": true
    //         },
    //         body: JSON.stringify({ created: `FAMILY#${familyId}` })
    //     };
    // } catch (error: any) {
    //     return {
    //         statusCode: error?.$metadata?.httpStatusCode,
    //         headers: {
    //             "Access-Control-Allow-Origin": "*",
    //             "Access-Control-Allow-Credentials": true
    //         },
    //         body: JSON.stringify({ reason: error.name, error })
    //     };
    // }
};
