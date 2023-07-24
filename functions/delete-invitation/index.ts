import { DynamoDBClient, DeleteItemCommand, } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyResult, APIGatewayProxyEventPathParameters } from 'aws-lambda';

interface IDeleteInvitationParams extends APIGatewayProxyEventPathParameters {
    familyId: string
    email: string
}

// DELETE /families/{familyId}/invitations/{email}
export const handler = async (event: any): Promise<APIGatewayProxyResult> => {
    const client = new DynamoDBClient({ region: "us-east-1" });
    const { familyId, email }: IDeleteInvitationParams = event.pathParameters;

    try {
        const deleteInvitationInput = {
            Key: {
                PK: {
                    S: `FAMILY#${familyId}`
                },
                SK: {
                    S: `MEMBER#${email}#INVITATION`
                }
            },
            TableName: "wish-list-table"
        };
        const deleteInvitationCommand = new DeleteItemCommand(deleteInvitationInput);
        const deleteInviteResponse = await client.send(deleteInvitationCommand);
        console.log({ deleteInviteResponse });

        return {
            statusCode: 204,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true
            },
            body: JSON.stringify({ 'message': 'No Content' })
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true
            },
            body: JSON.stringify({ message: 'Something went wrong' })
        };
    }
};
