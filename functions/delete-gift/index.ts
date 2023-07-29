import { DynamoDBClient, DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyResult, APIGatewayProxyEventPathParameters } from 'aws-lambda';

interface IGiftParams extends APIGatewayProxyEventPathParameters {
    familyId: string
    email: string
    giftId: string
}

// DELETE /families/{id}/members/{email}/gifts/{giftId}
export const handler = async (event: any): Promise<APIGatewayProxyResult> => {
    const client = new DynamoDBClient({ region: "us-east-1" });
    const { familyId, email, giftId }: IGiftParams = event.pathParameters;

    const deleteGiftInput = {
        Key: {
            PK: {
                S: `FAMILY#${familyId}`
            },
            SK: {
                S: `MEMBER#${email}GIFT#${giftId}`
            },
        },
        TableName: "wish-list-table"
    }

    try {
        const deleteGiftCommand = new DeleteItemCommand(deleteGiftInput);
        const deleteGiftResponse = await client.send(deleteGiftCommand);
        console.log({ deleteGiftResponse });
    
        return {
            statusCode: 204,
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
