import { DynamoDBClient, PutItemCommand, GetItemCommandInput, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyResult, APIGatewayProxyEventPathParameters } from 'aws-lambda';

interface ICreateInvitationParams extends APIGatewayProxyEventPathParameters {
    familyId: string
}

// POST /families/{familyId}/invitations
// Creates invitation 
export const handler = async (event: any): Promise<APIGatewayProxyResult> => {
    const client = new DynamoDBClient({ region: "us-east-1" });
    const { email } = JSON.parse(event.body); // WHO THE INVITATION IS FOR
    const { familyId }: ICreateInvitationParams = event.pathParameters; // the family the invitation is for

    if (!email) {
        console.log('missing email');

        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true // Todo: what is this header? do I need it? It's in all my requests
            },
            body: JSON.stringify({ message: 'Bad Request' })
        };
    }

    try {
        // See if invitation already exists for this member + family
        const getItemInput: GetItemCommandInput = {
            "Key": {
                "PK": {
                    "S": `FAMILY#${familyId}`
                },
                "SK": {
                    "S": `MEMBER#${email}#INVITATION`
                }
            },
            "TableName": "wish-list-table"
        };

        const getItemCommand = new GetItemCommand(getItemInput);
        const getItemResponse = await client.send(getItemCommand);

        // if exists, return error code
        if (getItemResponse.Item) {
            console.log('Invitation already exists, ', getItemResponse.Item);
            
            return {
                statusCode: 409,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials": true
                },
                body: JSON.stringify({ message: 'Conflict' })
            };
        }

        // doesn't exist yet, create it
        const input = {
            Item: {
                PK: {
                    S: `FAMILY#${familyId}`
                },
                SK: {
                    S: `MEMBER#${email}#INVITATION`
                },
                status: {
                    S: 'PENDING'
                },
            },
            ReturnConsumedCapacity: 'TOTAL',
            TableName: 'wish-list-table'
        };
        const createMemberCommand = new PutItemCommand(input);

        await client.send(createMemberCommand);

        return {
            statusCode: 201,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true
            },
            body: JSON.stringify({ 'message': 'Created' })
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
