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
                ...accum.ExpressionAttributeValues,
                [expAtVal]: {
                    [typeof value === 'boolean' ? 'BOOL' : 'S']: value
                }
            },
            UpdateExpression: !accum.UpdateExpression 
                ? `SET ${expAtName} = ${expAtVal}` 
                : accum.UpdateExpression + `, ${expAtName} = ${expAtVal}`
        };

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
    });

    try {
        const updateGiftCommand = new UpdateItemCommand(updateGiftInput);
        const updateGiftResponse = await client.send(updateGiftCommand);
        console.log({ updateGiftResponse });
    
        const {Attributes} = updateGiftResponse;
        const [email, giftId] = Attributes.SK.S.split('MEMBER#')[1].split('GIFT#')

        const gift: IGift = {
            familyId: Attributes.PK.S.replace('FAMILY#', ''),
            email,
            giftId,
            description: Attributes?.description?.S || '',
            link: Attributes?.link?.S || '',
            title: Attributes?.title?.S || '',
            purchased: Attributes?.purchased?.BOOL || false,
            favorite: Attributes?.favorite?.BOOL || false,
        };
    
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true
            },
            body: JSON.stringify({ gift })
        };
    } catch (error) {
        console.log({error});

        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true
            },
            body: JSON.stringify({ message: 'Something went wrong.' })
        };
    }
};
