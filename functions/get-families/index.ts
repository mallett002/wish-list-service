import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyResult, APIGatewayProxyEvent, APIGatewayProxyEventPathParameters } from 'aws-lambda';

interface IGetFamilyBoardParams extends APIGatewayProxyEventPathParameters {
  memberId: string
}

// GET /members/{id}/families
export const handler = async (event: any): Promise<APIGatewayProxyResult> => {
  const client = new DynamoDBClient({ region: "us-east-1" });
  const { memberId }: IGetFamilyBoardParams = event.pathParameters;

  const command = new QueryCommand({
    TableName: 'wish-list-table',
    KeyConditionExpression: `#PK = :PK AND begins_with(#SK, :SK)`,
    ExpressionAttributeNames: {
      "#PK": "PK",
      "#SK": "SK"
    },
    ExpressionAttributeValues: {
      ":PK": { S: `MEMBER#${memberId}` },
      ":SK": { S: `FAMILY#` }
    },
    ConsistentRead: false,
    IndexName: 'inverse-composite'
  });

  const response = await client.send(command);

  if (!response.Items || !response.Items.length) {
    return {
      statusCode: 404,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      },
      body: JSON.stringify({ message: 'Not Found' })
    };
  }

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true
    },
    body: {families: response.Items}
  };
};
