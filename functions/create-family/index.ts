import { DynamoDBClient, PutItemCommand, GetItemCommand, GetItemCommandInput } from '@aws-sdk/client-dynamodb';
import crypto from 'crypto';

import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';

// POST /families
// Creates family profile & family member in the family for the user that created the family
export const handler = async (event: APIGatewayProxyEvent, context?: any): Promise<APIGatewayProxyResult> => {

    const client = new DynamoDBClient({ region: "us-east-1" });
    const { familyName, familyImage } = JSON.parse(event.body || '{}');
    const { userId } = event.requestContext.authorizer;

    const getMemberInput: GetItemCommandInput = {
        "Key": {
            "PK": {
                "S": `MEMBER#${userId}`
            },
            "SK": {
                "S": 'PROFILE'
            }
        },
        "TableName": "wish-list-table"
    };

    const getMemberCommand = new GetItemCommand(getMemberInput);
    const { Item } = await client.send(getMemberCommand);
    console.log({Item});
    

    if (Item && Item.email && Item.email.S) {
        const email = Item.email.S;
        const alias = Item.alias.S;
        const familyId = `FAMILY#${crypto.randomUUID()}`;

        console.log({familyId});
        

        const createFamilyInput = {
            Item: {
                PK: {
                    S: `FAMILY#${familyId}`
                },
                SK: {
                    S: 'PROFILE'
                },
                familyName: {
                    S: familyName
                },
                familyImage: {
                    S: familyImage
                },
            },
            ReturnConsumedCapacity: 'TOTAL',
            TableName: 'wish-list-table'
        };
        const createFamilyMemberInput = {
            Item: {
                PK: {
                    S: `FAMILY#${familyId}`
                },
                SK: {
                    S: `MEMBER#${email}`
                },
                alias: {
                    S: alias
                },
                email: {
                    S: email
                },
            },
            ReturnConsumedCapacity: 'TOTAL',
            TableName: 'wish-list-table'
        };
        console.log({createFamilyInput, createFamilyMemberInput})

        const createFamilyCommand = new PutItemCommand(createFamilyInput);
        const createFamilyMemberCommand = new PutItemCommand(createFamilyMemberInput);
        console.log({createFamilyCommand, createFamilyMemberCommand});
        

        const createFamilyResult = await client.send(createFamilyCommand);
        const createFamilyMemberResult = await client.send(createFamilyMemberCommand);

        // Getting "Cannot read properties of undefined (reading '0')" on client.send
        console.log({createFamilyResult, createFamilyMemberResult});

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
