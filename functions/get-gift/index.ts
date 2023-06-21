import { DynamoDBClient, GetItemCommand, GetItemCommandInput } from '@aws-sdk/client-dynamodb';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { Context, APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';
import { Handler } from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEvent, context?: any): Promise<APIGatewayProxyResult> => {
    const client = new DynamoDBClient({ region: "us-east-1" });
    
    const {Authorization} = event.headers;

    if (!Authorization) {
      return {
        statusCode: 401,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true
        },
        body: JSON.stringify({message: 'Unauthorized'})
      }
    }

    const verifier = CognitoJwtVerifier.create({
      userPoolId: "us-east-1_F485Eqx6d",
      tokenUse: "access",
      clientId: "62u6l57h8lv257qh3b990d4ucc",
    });

    const [, encryptedToken] = Authorization.split(' ');
    
    try {
      const payload = await verifier.verify(encryptedToken);
      console.log({payload});
            
    } catch (err) {
      console.log("Token not valid!", err);
    }
    

    const {familyId, username, giftId} = event.pathParameters;

    // GET /families/{id}/users/{id}/gifts/{giftId}

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
