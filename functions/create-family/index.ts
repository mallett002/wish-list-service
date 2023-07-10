import { DynamoDBClient, BatchWriteItemCommand, GetItemCommand, GetItemCommandInput } from '@aws-sdk/client-dynamodb';
import {randomUUID} from 'node:crypto';

import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';

// POST /families
// Creates family profile & family member in the family for the user that created the family
export const handler = async (event: APIGatewayProxyEvent, context?: any): Promise<APIGatewayProxyResult> => {

    const client = new DynamoDBClient({ region: "us-east-1" });
    const { familyName, familyImage } = JSON.parse(event.body || '{}');

    // Get member from auth context
    const { memberId }: any = event.requestContext.authorizer;

    const getMemberInput: GetItemCommandInput = {
        "Key": {
            "PK": {
                "S": `MEMBER#${memberId}`
            },
            "SK": {
                "S": 'PROFILE' // TODO: make this the email
            }
        },
        "TableName": "wish-list-table"
    };

    const getMemberCommand = new GetItemCommand(getMemberInput);
    const { Item } = await client.send(getMemberCommand);

    // if member, create family member and family
    if (Item && Item.email && Item.email.S) {
        const email = Item.email.S;
        const alias = Item.alias.S;
        const familyId = randomUUID();

        const input = {
            "RequestItems": {
                "wish-list-table": [
                    {
                        "PutRequest": {
                            "Item": {
                                "PK": {
                                    "S": `FAMILY#${familyId}`
                                },
                                "SK": {
                                    "S": 'MEMBER#BOARD'
                                },
                                "familyName": {
                                    "S": familyName
                                },
                                "familyImage": {
                                    "S": familyImage
                                },
                            },
                        }
                    },
                    {
                        "PutRequest": {
                            "Item": {
                                "PK": {
                                    "S": `FAMILY#${familyId}`
                                },
                                "SK": {
                                    "S": `MEMBER#${memberId}`
                                },
                                "alias": {
                                    "S": alias
                                },
                                "email": {
                                    "S": email
                                },
                            }
                        }
                    }
                ]
            }
        };

        const command = new BatchWriteItemCommand(input);

        await client.send(command);

        return {
            statusCode: 201,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true
            },
            body: JSON.stringify({ created: { familyId, email } })
        };
    } else {
        return {
            statusCode: 422,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true
            },
            body: JSON.stringify({ message: 'Unprocessible Entity', reason: 'email not available' })
        };
    }
};
