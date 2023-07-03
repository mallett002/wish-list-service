import { DynamoDBClient, GetItemCommand, GetItemCommandInput } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';


//TODO: This handler will probably go away
export const handler = async (event: any, context?: any): Promise<APIGatewayProxyResult> => {
  const client = new DynamoDBClient({ region: "us-east-1" });

  const { familyId, memberId, giftId } = event.pathParameters;

  // GET /families/{id}/members/{memberId}/gifts/{giftId}
  const input: GetItemCommandInput = {
    "Key": {
      "PK": {
        "S": `FAMILY#${familyId}`
      },
      "SK": {
        "S": `MEMBER#${memberId}GIFT#${giftId}`
      }
    },
    "TableName": "wish-list-table"
  };

  const command = new GetItemCommand(input);
  const response = await client.send(command);

  console.log({response});
  
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true
    },
    body: JSON.stringify(response.Item)
  };
};
