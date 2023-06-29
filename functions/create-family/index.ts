import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';

// POST /families
export const handler = async (event: APIGatewayProxyEvent, context?: any): Promise<APIGatewayProxyResult> => {
    console.log(JSON.stringify({event, context}));
    // not seeing event.requestContext.authorizer (should have my userId decrypted)
    // https://stackoverflow.com/questions/45631758/how-to-pass-api-gateway-authorizer-context-to-a-http-integration

    const client = new DynamoDBClient({ region: "us-east-1" });

    // Create Family entity {pk: familyId, sk: PROFILE familyName, familyImage}

    // Return this for now..
    return {
        statusCode: 201,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true
        },
        body: JSON.stringify({ created: 'nothing yet ;)' })
};

};
