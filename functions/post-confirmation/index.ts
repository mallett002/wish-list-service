import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { PostConfirmationTriggerEvent } from 'aws-lambda';


// Todo: make update member handler to add an alias. Prefer this in front end
export const handler = async (event: PostConfirmationTriggerEvent): Promise<PostConfirmationTriggerEvent> => {
  const { sub, email } = event.request.userAttributes;

  console.log(JSON.stringify({event}));
  
  try {
    const client = new DynamoDBClient({ region: "us-east-1" });
    const input = {
      Item: {
        PK: {
          S: `MEMBER#${email}`
        },
        SK: {
          S: `PROFILE`
        },
        // email: {
        //   S: email || "" // todo: maybe remove since have it in the SK
        // },
        alias: {
          S: ''
        },
        sub: {
          S: sub
        }
      },
      ReturnConsumedCapacity: 'TOTAL',
      TableName: 'wish-list-table'
    };
    const createMemberCommand = new PutItemCommand(input);

    await client.send(createMemberCommand);
  } catch (err: any) {
    console.log('There was an issue saving the new member to the database', err);

    throw new Error(err.message);
  }

  return event;
};
