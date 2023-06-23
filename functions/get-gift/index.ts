import { DynamoDBClient, GetItemCommand, GetItemCommandInput } from '@aws-sdk/client-dynamodb';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { Context, APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';
import { Handler } from 'aws-lambda';


export const handler = async (event: APIGatewayProxyEvent, context?: any): Promise<APIGatewayProxyResult> => {
  const client = new DynamoDBClient({ region: "us-east-1" });

  const { Authorization } = event.headers;
  const { familyId, username, giftId } = event.pathParameters;

  if (!Authorization) {
    return {
      statusCode: 401,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      },
      body: JSON.stringify({ message: 'Unauthorized' })
    }
  }

  const verifier = CognitoJwtVerifier.create({
    userPoolId: process.env.USER_POOL_ID || '',
    tokenUse: "access",
    clientId: process.env.APP_CLIENT_ID || '',
  });

  const [, encryptedToken] = Authorization.split(' ');

  try {
    await verifier.verify(encryptedToken);
  } catch (err) {
    console.log("Token not valid!", err);

    return {
      statusCode: 401,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      },
      body: JSON.stringify({ message: 'Unauthorized' })
    };
  }

  // GET /families/{id}/users/{username}/gifts/{giftId}
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
