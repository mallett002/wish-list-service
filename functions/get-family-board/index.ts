import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyResult, APIGatewayProxyEvent, APIGatewayProxyEventPathParameters } from 'aws-lambda';

interface IGetFamilyBoardParams extends APIGatewayProxyEventPathParameters {
  familyId: string
}

// GET /families/{id}/board
export const handler = async (event: any): Promise<APIGatewayProxyResult> => {
  const client = new DynamoDBClient({ region: "us-east-1" });
  const { familyId }: IGetFamilyBoardParams = event.pathParameters;

  const command = new QueryCommand({
    TableName: 'wish-list-table',
    KeyConditionExpression: `#PK = :PK AND begins_with(#SK, :SK)`,
    ExpressionAttributeNames: {
      "#PK": "PK",
      "#SK": "SK"
    },
    ExpressionAttributeValues: {
      ":PK": { S: `FAMILY#${familyId}` },
      ":SK": { S: `MEMBER#` }
    },
    ConsistentRead: true
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

  const [familyProfile] = response.Items.filter(({ SK }) => SK.S === 'MEMBER#BOARD').map((item) => ({
    familyId: item?.PK?.S.replace('FAMILY#', '') || '',
    familyName: item.familyName.S,
    familyImage: item.familyImage.S,
  }));

  const members = response.Items.filter(({ SK }) =>
    !SK.S?.includes('GIFT#')
    && SK.S?.includes('MEMBER#')
    && !SK.S?.includes('BOARD')).map((member) => ({
      memberId: member?.SK?.S.replace('MEMBER#', ''),
      alias: member.alias.S,
      email: member.email.S
    }));

  const gifts = response.Items
    .filter(({ SK }) => SK && SK.S && SK.S.includes('GIFT#'))
    .map((gift) => {
      const [memberId, giftId] = gift.SK && gift.SK.S && gift.SK.S.split('MEMBER#')[1].split('GIFT#') || ['', ''];

      return {
        purchased: gift.purchased.BOOL,
        memberId,
        giftId,
        link: gift.link.S,
        description: gift.description.S,
        title: gift.title.S
      };
    });

  const membersWithGifts = members.map((member) => {
    const giftsForMember = gifts.filter((gift) => gift.memberId === member.memberId);

    return {
      ...member,
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
};
