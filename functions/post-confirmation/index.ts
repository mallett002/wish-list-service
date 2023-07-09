import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyResult, PostConfirmationTriggerEvent } from 'aws-lambda';


// For invitation:
// Need ability to search for members by email to invite them to the family
// Also, use email to find the member and create the familyMember off of them
// Use GSI to query SK = email AND PK begin_with(MEMBER#)
// Todo: make update member handler to add an alias. Prefer this in front end
export const handler = async (event: PostConfirmationTriggerEvent): Promise<PostConfirmationTriggerEvent> => {
  const { sub, email } = event.request.userAttributes;

  try {
    const client = new DynamoDBClient({ region: "us-east-1" });
    const input = {
      Item: {
        PK: {
          S: `MEMBER#${sub}`
        },
        SK: {
          S: `PROFILE` // todo: make this email
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
