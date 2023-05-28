import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { Handler } from 'aws-lambda';

export const handler = async (event?: APIGatewayEvent, context?: any): Promise<APIGatewayProxyResult> => {
    const client = new DynamoDBClient({ region: "us-east-1" });
    console.log('logging event...');
     
    console.log(JSON.stringify(event, null, 2));

    console.log('logging context...');
    
    console.log(JSON.stringify(context, null, 2));
    


    // PK: FAMILY#<familyId>    ex: FAMILY#ABE1D7B5-4EEA-4C78-A51B-3B6C1314DBCW
    // SK: #MEMBER#<username>#GIFT#<giftId>    ex: #MEMBER#wmallett@gmail.com#GIFT#C2D9F0C7-83A5-4303-B319-C918C8473434

    try {
        const input = {
            Item: {
                PK: {
                    S: 'FAMILY#ABE1D7B5-4EEA-4C78-A51B-3B6C1314DBCP'
                },
                SK: {
                    S: '#MEMBER#wmallett@gmail.com#GIFT#C2D9F0C7-83A5-4303-B319-C918C8473433'
                },
                description: {
                    S: 'see link, something pink.'
                },
                link: {
                    S: 'https://amazon.com'
                },
                name: {
                    S: 'HAT'
                },
                purchased: {
                    BOOL: false
                }
            },
            ReturnConsumedCapacity: 'TOTAL',
            TableName: 'wish-list-table'
        };

        const command = new PutItemCommand(input);
        
        await client.send(command);

        return {
            statusCode: 201,
            headers: {
                "Access-Control-Allow-Origin" : "*",
                "Access-Control-Allow-Credentials" : true
            },
            body: JSON.stringify({created: `FAMILY#ABE1D7B5-4EEA-4C78-A51B-3B6C1314DBCP`})
        };
    } catch (error: any) {
        return {
            statusCode: error?.$metadata?.httpStatusCode,
            headers: {
                "Access-Control-Allow-Origin" : "*",
                "Access-Control-Allow-Credentials" : true
            },
            body: JSON.stringify({reason: error.name, error})
        };
    }
};
