import { DynamoDBClient, QueryCommand, BatchGetItemCommand } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyResult, APIGatewayProxyEvent, APIGatewayProxyEventPathParameters } from 'aws-lambda';

interface IQueryMembersParams extends APIGatewayProxyEventPathParameters {
  email: string
}

// GET /members?email=<email>
export const handler = async (event: any): Promise<APIGatewayProxyResult> => {
  const client = new DynamoDBClient({ region: "us-east-1" });

  console.log(JSON.stringify({ event }));
  const { email }: IQueryMembersParams = event.queryStringParameters;

  try {
    const command = new QueryCommand({
      TableName: 'wish-list-table',
      KeyConditionExpression: `#SK = :SK AND begins_with(#PK, :PK)`,
      ExpressionAttributeNames: {
        "#PK": "PK",
        "#SK": "SK"
      },
      ExpressionAttributeValues: {
        ":SK": { S: `PROFILE` },
        ":PK": { S: `MEMBER#${email}` }
      },
      ConsistentRead: false,
      IndexName: 'inverse-composite'
    });

    const response = await client.send(command);
    console.log({ response });

    const members = response.Items || [];

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      },
      body: JSON.stringify({ members })
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
}
