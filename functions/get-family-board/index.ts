import { DynamoDBClient, QueryCommand, QueryCommandInput } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';


export const handler = async (event: any, context?: any): Promise<APIGatewayProxyResult> => {
  const client = new DynamoDBClient({ region: "us-east-1" });

  // GET /families/{id}/board
  /*
  
  should return something like:
  {
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

  QueryCommand: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/dynamodb/command/QueryCommand/
  PK=FAMILY#familyId AND SK begins_with(MEMBER#): familyMembers and familyMemberGifts
  
  */

 const { familyId } = event.pathParameters;
 
  const command = new QueryCommand({
    TableName: 'wish-list-table',
    KeyConditionExpression: `#PK = :PK AND begins_with(#SK, :SK)`,
    ExpressionAttributeNames: {
      "#PK": "PK",
      "#SK": "SK"
    },
    ExpressionAttributeValues: {
      ":PK": {S: `FAMILY#${familyId}`},
      ":SK": {S: `MEMBER#`}
    },
    ConsistentRead: true
  });

  const response = await client.send(command);
  console.log({response});
  
  if (!response.Items || !response.Items.length) {
    return {
      statusCode: 404,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      },
      body: JSON.stringify({message: 'Not Found'})
    };
  }

  const familyProfile = response.Items.find(({SK}) => SK.S === 'MEMBER#BOARD');
  
  const members = response.Items.filter(({SK}) => 
    !SK.S?.includes('GIFT#')
    && SK.S?.includes('MEMBER#')
    && !SK.S?.includes('BOARD'));

  const gifts = response.Items
  .filter(({SK}) => SK && SK.S && SK.S.includes('GIFT#'))
  .map((gift) => {
    const [memberId, giftId] = gift.SK && gift.SK.S && gift.SK.S.split('MEMBER#')[1].split('GIFT#') || ['', ''];

    return {
      purchased: gift.purchased.BOOL,
      memberId,
      giftId,
      link: gift.link.S,
      description: gift.description.S,
      familyId: gift.PK.S?.replace('FAMILY#', ''),
      title: gift.title.S
    };
  });

  const membersWithGifts = members.map((member) => {
    const giftsForMember = gifts.filter((gift) => member.SK && member.SK.S && member.SK.S.includes(gift.memberId));

    return {
      alias: member.alias.S,
      memberId: member.SK.S?.replace('MEMBER#', ''),
      email: member.email.S,
      gifts: giftsForMember
    };
  });

  const boardResult = {
    ...familyProfile,
    members: membersWithGifts
  };

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true
    },
    body: JSON.stringify(boardResult)
  };
    
  /* Example response from db query:
{
    "$metadata": {
      "httpStatusCode": 200,
      "requestId": "IF3IJNU7PDSGGJAGLIM47NLJAJVV4KQNSO5AEMVJF66Q9ASUAAJG",
      "attempts": 1,
      "totalRetryDelay": 0
    },
    "Count": 3,
    "Items": [
      {
        "familyImage": {
          "S": "somerandomimage"
        },
        "SK": {
          "S": "MEMBER#BOARD"
        },
        "PK": {
          "S": "FAMILY#9c10c193-c4c5-40d7-91a1-e458908b849c"
        },
        "familyName": {
          "S": "Mallett"
        }
      },
      {
        "alias": {
          "S": ""
        },
        "SK": {
          "S": "MEMBER#c438b4a8-c011-70b8-662a-032d03cf41be"
        },
        "PK": {
          "S": "FAMILY#9c10c193-c4c5-40d7-91a1-e458908b849c"
        },
        "email": {
          "S": "mallett002@gmail.com"
        }
      },
      {
        "purchased": {
          "BOOL": false
        },
        "SK": {
          "S": "MEMBER#c438b4a8-c011-70b8-662a-032d03cf41beGIFT#4ff01607-6d82-4d33-b846-d50d7f4fdb3b"
        },
        "link": {
          "S": "google.com"
        },
        "description": {
          "S": "hat"
        },
        "PK": {
          "S": "FAMILY#9c10c193-c4c5-40d7-91a1-e458908b849c"
        },
        "title": {
          "S": "Hat"
        }
      }
    ],
    "ScannedCount": 3
  }

  */
};
