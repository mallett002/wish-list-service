import { DynamoDBClient, GetItemCommand, GetItemCommandInput } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';


export const handler = async (event: any, context?: any): Promise<APIGatewayProxyResult> => {
  const client = new DynamoDBClient({ region: "us-east-1" });

  // GET /families/{id}/board
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

  QueryCommand: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/dynamodb/command/QueryCommand/
  Maybe I should save family profile as PK=FAMILY#familyId AND SK = MEMBER#BOARD so I can do this in one query
  PK=FAMILY#familyId AND SK = PROFILE: familyProfile
  PK=FAMILY#familyId AND SK begins_with(MEMBER#): familyMembers and familyMemberGifts
  
  */


  const { familyId } = event.pathParameters;

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
  
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true
    },
    body: JSON.stringify({message: 'working on it :)'})
  };
};
