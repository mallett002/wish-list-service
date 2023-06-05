import { DynamoDBClient, GetItemCommand, GetItemCommandInput } from '@aws-sdk/client-dynamodb';

import { Context, APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';
import { Handler } from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEvent, context?: any): Promise<APIGatewayProxyResult> => {
    const client = new DynamoDBClient({ region: "us-east-1" });
    console.log('logging event...');

    console.log(JSON.stringify(event, null, 2));

    const {familyId, username, giftId} = event.pathParameters;

    // GET /families/{id}/username/{id}/gifts/{giftId}

    const input: GetItemCommandInput = {
        "Key": {
          "PK": {
            "S": `FAMILY#${familyId}`
          },
          "SK": {
            "S": `#MEMBER#${username}#GIFT#${giftId}`
          }
        },
        "TableName": "wish-list-table"
      };

      const command = new GetItemCommand(input);
      const response = await client.send(command);

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true
        },
        body: JSON.stringify(response.Item)
    };
};
