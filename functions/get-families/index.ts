import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyResult, APIGatewayProxyEvent, APIGatewayProxyEventPathParameters } from 'aws-lambda';

interface IGetFamilyBoardParams extends APIGatewayProxyEventPathParameters {
  memberId: string
}

// GET /members/{id}/families
export const handler = async (event: any): Promise<APIGatewayProxyResult> => {
  const client = new DynamoDBClient({ region: "us-east-1" });
  const { memberId }: IGetFamilyBoardParams = event.pathParameters;

  console.log({memberId});
  
  // Working, but I'm getting familyMembers. I want families.
  const command = new QueryCommand({
    TableName: 'wish-list-table',
    KeyConditionExpression: `#SK = :SK AND begins_with(#PK, :PK)`,
    ExpressionAttributeNames: {
      "#PK": "PK",
      "#SK": "SK"
    },
    ExpressionAttributeValues: {
      ":SK": { S: `MEMBER#${memberId}` },
      ":PK": { S: `FAMILY#` }
    },
    ConsistentRead: false,
    IndexName: 'inverse-composite'
  });

  const response = await client.send(command);
  console.log(JSON.stringify({response}));
  
  const families = response.Items || [];
  
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true
    },
    body: {families}
  };
};
