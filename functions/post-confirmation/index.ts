import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyResult, PostConfirmationTriggerEvent } from 'aws-lambda';


export const handler = async (event: PostConfirmationTriggerEvent): Promise<PostConfirmationTriggerEvent> => {
  const { sub, email } = event.request.userAttributes;

  try {
    const client = new DynamoDBClient({ region: "us-east-1" });
    const input = {
      Item: {
        PK: {
          S: `MEMBER#${sub}` // this should be email, I think. Or have to use userId everywhere
        },
        SK: {
          S: `PROFILE`
        },
        email: {
          S: email || ""
        },
        alias: {
          S: ''
        }
      },
      ReturnConsumedCapacity: 'TOTAL',
      TableName: 'wish-list-table'
    };
    const command = new PutItemCommand(input);

    await client.send(command);
  } catch (err: any) {
    console.log('There was an issue saving the new member to the database', err);

    throw new Error(err.message);
  }

  return event;
};
