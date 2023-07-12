import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyResult, APIGatewayProxyEventPathParameters } from 'aws-lambda';

interface ICreateInvitationParams extends APIGatewayProxyEventPathParameters {
    familyId: string
}

// POST /families/{familyId}/invitations
// Creates invitation 
export const handler = async (event: any): Promise<APIGatewayProxyResult> => {
    const client = new DynamoDBClient({ region: "us-east-1" });
    const { memberId } = JSON.parse(event.body); // WHO THE INVITATION IS FOR
    const { familyId }: ICreateInvitationParams = event.pathParameters; // the family the invitation is for

    if (!memberId) {
        console.log('missing memberId');

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
        const input = {
            Item: {
                PK: {
                    S: `FAMILY#${familyId}`
                },
                SK: {
                    S: `MEMBER#${memberId}#INVITATION`
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

    // const { memberId }: any = event.requestContext.authorizer;

    // const getMemberInput: GetItemCommandInput = {
    //     "Key": {
    //         "PK": {
    //             "S": `MEMBER#${memberId}`
    //         },
    //         "SK": {
    //             "S": `EMAIL#${creatorEmail}`
    //         }
    //     },
    //     "TableName": "wish-list-table"
    // };

    // const getMemberCommand = new GetItemCommand(getMemberInput);
    // const { Item } = await client.send(getMemberCommand);

    // // if member, create family member and family
    // if (Item && Item.email && Item.email.S) {
    //     const email = Item.email.S;
    //     const alias = Item.alias.S;
    //     const familyId = randomUUID();

    //     const input = {
    //         "RequestItems": {
    //             "wish-list-table": [
    //                 {
    //                     "PutRequest": {
    //                         "Item": {
    //                             "PK": {
    //                                 "S": `FAMILY#${familyId}`
    //                             },
    //                             "SK": {
    //                                 "S": 'MEMBER#BOARD'
    //                             },
    //                             "familyName": {
    //                                 "S": familyName
    //                             },
    //                             "familyImage": {
    //                                 "S": familyImage
    //                             },
    //                         },
    //                     }
    //                 },
    //                 {
    //                     "PutRequest": {
    //                         "Item": {
    //                             "PK": {
    //                                 "S": `FAMILY#${familyId}`
    //                             },
    //                             "SK": {
    //                                 "S": `MEMBER#${memberId}`
    //                             },
    //                             "alias": {
    //                                 "S": alias
    //                             },
    //                             "email": {
    //                                 "S": email
    //                             },
    //                         }
    //                     }
    //                 }
    //             ]
    //         }
    //     };

    //     const command = new BatchWriteItemCommand(input);

    //     await client.send(command);

    //     return {
    //         statusCode: 201,
    //         headers: {
    //             "Access-Control-Allow-Origin": "*",
    //             "Access-Control-Allow-Credentials": true
    //         },
    //         body: JSON.stringify({ created: { familyId, email } })
    //     };
    // } else {
    //     return {
    //         statusCode: 422,
    //         headers: {
    //             "Access-Control-Allow-Origin": "*",
    //             "Access-Control-Allow-Credentials": true
    //         },
    //         body: JSON.stringify({ message: 'Unprocessible Entity', reason: 'email not available' })
    //     };
    // }
};
