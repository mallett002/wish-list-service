import { DynamoDBClient, GetItemCommand, GetItemCommandInput } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';


export const handler = async (event: any, context?: any): Promise<APIGatewayProxyResult> => {
  const client = new DynamoDBClient({ region: "us-east-1" });

  /*
  
  should return something like:
  {
    familyId: {
      familyId,
      familyName
      familyImage
      members: [
        {
          alias,
          email,
          memberId
          gifts: [
            {
              giftId,
              description,
              image,
              title
              ... other gift attributes
            }
          ]
        }
      ]
    }
  }

  PK=FAMILY#familyId AND SK = PROFILE: familyProfile
  PK=FAMILY#familyId AND SK begins_with(MEMBER#): familyMembers and familyMemberGifts
  
  */


  // // userId (sub) will be on the context from the authorizer lambda
  // const { familyId, username, giftId } = event.pathParameters;

  // // GET /families/{id}/users/{username}/gifts/{giftId}
  // const input: GetItemCommandInput = {
  //   "Key": {
  //     "PK": {
  //       "S": `FAMILY#${familyId}`
  //     },
  //     "SK": {
  //       "S": `#MEMBER#${username}#GIFT#${giftId}`
  //     }
  //   },
  //   "TableName": "wish-list-table"
  // };

  // const command = new GetItemCommand(input);
  // const response = await client.send(command);

  // console.log({response});
  
  // return {
  //   statusCode: 200,
  //   headers: {
  //     "Access-Control-Allow-Origin": "*",
  //     "Access-Control-Allow-Credentials": true
  //   },
  //   body: JSON.stringify(response.Item)
  // };
};