import { DynamoDBClient, QueryCommand, BatchGetItemCommand } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyResult, APIGatewayProxyEvent, APIGatewayProxyEventPathParameters } from 'aws-lambda';

interface IGetFamilyBoardParams extends APIGatewayProxyEventPathParameters {
  email: string
}

// GET /members/{email}/families
export const handler = async (event: any): Promise<APIGatewayProxyResult> => {
  const client = new DynamoDBClient({ region: "us-east-1" });
  const { email }: IGetFamilyBoardParams = event.pathParameters;

  try {
    const command = new QueryCommand({
      TableName: 'wish-list-table',
      KeyConditionExpression: `#SK = :SK AND begins_with(#PK, :PK)`,
      ExpressionAttributeNames: {
        "#PK": "PK",
        "#SK": "SK"
      },
      ExpressionAttributeValues: {
        ":SK": { S: `MEMBER#${email}` },
        ":PK": { S: `FAMILY#` }
      },
      ConsistentRead: false,
      IndexName: 'inverse-composite'
    });

    const queryFamilyMembersResponse = await client.send(command);
    console.log({ queryFamilyMembersResponse });

    if (!queryFamilyMembersResponse.Items || !queryFamilyMembersResponse.Items.length) {
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true
        },
        body: JSON.stringify({ families: [] })
      };
    }

    const familyIds = queryFamilyMembersResponse.Items.map(({ PK }) => ({ PK, SK: { S: 'MEMBER#BOARD' } }));

    const batchGetInput = {
      RequestItems: {
        'wish-list-table': {
          Keys: familyIds
        }
      }
    };

    const batchGetCommand = new BatchGetItemCommand(batchGetInput);
    const getFamiliesResponse = await client.send(batchGetCommand);
    console.log({ getFamiliesResponse });

    const { Responses: { 'wish-list-table': families } } = getFamiliesResponse;

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      },
      body: JSON.stringify({ families })
    };
  } catch (error) {
    console.log('something went wrong..', { error });

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      },
      body: JSON.stringify({ message: 'Something went wrong.' })
    };
  }
};
