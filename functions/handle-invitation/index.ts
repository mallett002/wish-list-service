import {
    DynamoDBClient,
    PutItemCommand,
    GetItemCommandInput,
    GetItemCommand,
    DeleteItemCommand
} from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyResult, APIGatewayProxyEventPathParameters } from 'aws-lambda';

interface IHandleInvitationParams extends APIGatewayProxyEventPathParameters {
    familyId: string
    email: string
}

// PUT /families/{familyId}/invitations/{email}
// Accepts/rejects invitation 
export const handler = async (event: any): Promise<APIGatewayProxyResult> => {
    const client = new DynamoDBClient({ region: "us-east-1" });
    const { status } = JSON.parse(event.body);
    const { familyId, email }: IHandleInvitationParams = event.pathParameters;

    if (!status || status !== 'ACCEPTED' && status !== 'REJECTED') {
        console.log('missing status in request body');

        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true
            },
            body: JSON.stringify({ message: 'Bad Request' })
        };
    }

    try {
        // make sure invitation exists
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
        const getInvitationResponse = await client.send(getItemCommand);
        console.log({ getInvitationResponse });

        // if doesn't exists, return error code
        if (!getInvitationResponse.Item) {
            console.log(`Invitation for ${email} does not exist`, getInvitationResponse.Item);

            return {
                statusCode: 404,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials": true
                },
                body: JSON.stringify({ message: 'Not Found' })
            };
        }

        // if status is ACCEPTED
        //- create familyMember:
        //   - FAMILY#<id>, MEMBER#<id> from the invitation (familyId from SK)
        //   - delete invitation (FAMILY#<id>, MEMBER#<id>#INVITATION)

        if (status === 'ACCEPTED') {
            // Get the member
            const getMemberInput: GetItemCommandInput = {
                Key: {
                    PK: {
                        S: `MEMBER#${email}`
                    },
                    SK: {
                        S: `PROFILE`
                    }
                },
                TableName: "wish-list-table"
            };

            const getMemberCommand = new GetItemCommand(getMemberInput);
            const { Item: memberItem } = await client.send(getMemberCommand);

            // Create the family member:
            const createFamilyMemberInput = {
                Item: {
                    PK: {
                        S: `FAMILY#${familyId}`
                    },
                    SK: {
                        S: `MEMBER#${email}`
                    },
                    alias: {
                        S: memberItem.alias.S
                    },
                },
                ReturnConsumedCapacity: 'TOTAL',
                TableName: 'wish-list-table'
            };
            const createMemberCommand = new PutItemCommand(createFamilyMemberInput);
            const createMemberResponse = await client.send(createMemberCommand);
            console.log({ createMemberResponse });

            // Delete the invitation:
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

        } else { // status is REJECTED
            // ELSE status is REJECTED (checking in if block above)
            // set the status on the db item to rejected
            const updateInviteInput = {
                "ExpressionAttributeNames": {
                    "#ST": "status",
                },
                "ExpressionAttributeValues": {
                    ":t": {
                        "S": "REJECTED"
                    },
                },
                "Key": {
                    PK: {
                        S: `FAMILY#${familyId}`
                    },
                    SK: {
                        S: `MEMBER#${email}#INVITATION`
                    }
                },
                "ReturnValues": "ALL_NEW",
                "TableName": "wish-list-table",
                "UpdateExpression": "SET #ST = :t"
            };
            const updateInviteCommand = new UpdateItemCommand(updateInviteInput);
            const updateInviteResponse = await client.send(updateInviteCommand);

            console.log({ updateInviteResponse });
        }

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
