import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyResult, APIGatewayProxyEventPathParameters } from 'aws-lambda';

interface IGiftParams extends APIGatewayProxyEventPathParameters {
    familyId: string
    email: string
}
interface IGiftPayload {
    description?: string
    link?: string
    title?: string
    purchased?: boolean
}

// PUT /families/{id}/members/{email}/gifts/{giftId}
export const handler = async (event: any): Promise<APIGatewayProxyResult> => {
    const client = new DynamoDBClient({ region: "us-east-1" });
    const { familyId, email, giftId }: IGiftParams = event.pathParameters;
    const payload: IGiftPayload = JSON.parse(event.body || '{}');
    const payloadKeys = Object.keys(payload);

    if (!payloadKeys.length) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true
            },
            body: JSON.stringify({ message: 'Bad Request: no gift fields provided' })
        };
    }

    const updateGiftInput = payloadKeys.reduce((accum, key) => {
        const expAtVal = `:${key.substr(0, 1)}`;
        const expAtName = `#${key.substr(0, 2).toUpperCase()}`;
        const value = payload[key];

        return {
            ...accum,
            ExpressionAttributeNames: {
                ...accum.ExpressionAttributeNames,
                [expAtName]: key
            },
            ExpressionAttributeValues: {
                ...ExpressionAttributeValues,
                [expAtVal]: {
                    [typeof value === 'boolean' ? 'BOOL' : S]: value
                }
            }
            UpdateExpression: accum.UpdateExpression += `${accum.UpdateExpression && ','} SET ${expAtName} = ${expAtVal}`
        }

    }, {
        ExpressionAttributeNames: {},
        ExpressionAttributeValues: {},
        Key: {
            PK: {
                S: `FAMILY#${familyId}`
            },
            SK: {
                S: `MEMBER#${email}GIFT#${giftId}`
            },
        },
        ReturnValues: 'ALL_NEW',
        TableName: 'wish-list-table',
        UpdateExpression: ''
    })

    // const updateToPendingInviteInput = {
    //     "ExpressionAttributeNames": {
    //         "#ST": "status",
    //     },
    //     "ExpressionAttributeValues": {
    //         ":t": {
    //             "S": "PENDING"
    //         },
    //     },
    //     "Key": {
    //         PK: {
    //             S: `FAMILY#${familyId}`
    //         },
    //         SK: {
    //             S: `MEMBER#${email}#INVITATION`
    //         }
    //     },
    //     "ReturnValues": "ALL_NEW",
    //     "TableName": "wish-list-table",
    //     "UpdateExpression": "SET #ST = :t"
    // };
    const updateGiftCommand = new UpdateItemCommand(updateGiftInput);
    const updateGiftResponse = await client.send(updateGiftCommand);
    console.log({ updateGiftResponse });

    const {Item: updatedGift} = updateGiftResponse;

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true
        },
        body: JSON.stringify({ gift: updatedGift })
    };
};
