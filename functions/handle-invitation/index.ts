import {
    DynamoDBClient,
    PutItemCommand,
    GetItemCommandInput,
    GetItemCommand,
    DeleteItemCommand,
    UpdateItemCommand
} from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyResult, APIGatewayProxyEventPathParameters } from 'aws-lambda';

interface IHandleInvitationParams extends APIGatewayProxyEventPathParameters {
    familyId: string
    email: string
}

// PUT /families/{familyId}/invitations/{email}
// Accepts/rejects/sets back to pending an invitation 
export const handler = async (event: any): Promise<APIGatewayProxyResult> => {
    const client = new DynamoDBClient({ region: "us-east-1" });
    const { status } = JSON.parse(event.body);
    const { familyId, email }: IHandleInvitationParams = event.pathParameters;

    if (!status || (status !== 'ACCEPTED' && status !== 'REJECTED' && status !== 'PENDING')) {
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

        // if status is ACCEPTED: and create family member and delete invitation
        // if status is REJECTED: set status on db invitation to REJECTED
        if (status === 'ACCEPTED') {

            console.log('Setting PENDING invitation to ACCEPTED...');

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

            // Check that the familyMember doesn't already exist: 
            // Shouldn't get here if it doesn't exist. Invitation should have been deleted.
            // const getFamilyMemberInput: GetItemCommandInput = {
            //     Key: {
            //         PK: {
            //             S: `FAMILY#${familyId}`
            //         },
            //         SK: {
            //             S: `MEMBER#${email}`
            //         },
            //     },
            //     TableName: "wish-list-table"
            // };

            // const getFamilyMemberCommand = new GetItemCommand(getFamilyMemberInput);
            // const { Item: familyMemberItem } = await client.send(getFamilyMemberCommand);

            // if (familyMemberItem) {
            //     return {
            //         statusCode: 409,
            //         headers: {
            //             "Access-Control-Allow-Origin": "*",
            //             "Access-Control-Allow-Credentials": true
            //         },
            //         body: JSON.stringify({ message: `Conflict: Family member with email ${email} already exists in family ${familyId}` })
            //     };
            // }

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

        } else if (status === 'REJECTED') {

            console.log('Setting PENDING invitation to REJECTED...');

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

        } else { // setting back to PENDING when was rejected

            console.log('Setting REJECTED invitation back to PENDING...');
            
            // If it's not currently rejected, return bad request
            if (getInvitationResponse.Item.status.S !== 'REJECTED') {
                return {
                    statusCode: 400,
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Credentials": true
                    },
                    body: JSON.stringify({ message: 'Bad Request: Status is currently not REJECTED' })
                };
            }

            // set it back to pending:
            const updateToPendingInviteInput = {
                "ExpressionAttributeNames": {
                    "#ST": "status",
                },
                "ExpressionAttributeValues": {
                    ":t": {
                        "S": "PENDING"
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
            const updateToPendingInviteCommand = new UpdateItemCommand(updateToPendingInviteInput);
            const updateToPendingInviteResponse = await client.send(updateToPendingInviteCommand);
            console.log({ updateToPendingInviteResponse });
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
