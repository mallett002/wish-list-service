import { DynamoDBClient, GetItemCommand, GetItemCommandInput } from '@aws-sdk/client-dynamodb';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { Context, APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';
import { Handler } from 'aws-lambda';


export const handler = async (event: APIGatewayProxyEvent, context?: any): Promise<APIGatewayProxyResult> => {
  const client = new DynamoDBClient({ region: "us-east-1" });

  const { Authorization } = event.headers;
  const { familyId, userId, giftId } = event.pathParameters;

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

  // Todo: use env vars for these
  const verifier = CognitoJwtVerifier.create({
    userPoolId: "us-east-1_VHq3eUcoC",
    tokenUse: "access",
    clientId: "33a9l29lpt18inurahn35tqv8s",
  });

  const [, encryptedToken] = Authorization.split(' ');

  try {
    const payload = await verifier.verify(encryptedToken);

    if (payload.sub !== userId) {
      return {
        statusCode: 403,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true
        },
        body: JSON.stringify({ message: 'Forbidden' })
      }
    }

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

  // GET /families/{id}/users/{id}/gifts/{giftId}
  const input: GetItemCommandInput = {
    "Key": {
      "PK": {
        "S": `FAMILY#${familyId}`
      },
      "SK": {
        "S": `#MEMBER#mallett002@gmail.com#GIFT#${giftId}`
        // "S": `#MEMBER#${userId}#GIFT#${giftId}`
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
