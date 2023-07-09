const { DynamoDBClient, BatchWriteItemCommand, QueryCommand } = require('@aws-sdk/client-dynamodb');
const Chance = require('chance');

const chance = new Chance();
const client = new DynamoDBClient({ region: "us-east-1" });

function createMemberInput() {
    return {
        PutRequest: {
            Item: {
                PK: {
                    S: `MEMBER#${chance.guid()}`
                },
                SK: {
                    S: `PROFILE`
                },
                email: {
                    S: chance.email()
                },
                alias: {
                    S: chance.first()
                }
            }
        }
    };
}

function createFamilyInput(familyId) {
    return {
        "PutRequest": {
            "Item": {
                "PK": {
                    "S": `FAMILY#${familyId}`
                },
                "SK": {
                    "S": 'MEMBER#BOARD'
                },
                "familyName": {
                    "S": chance.last()
                },
                "familyImage": {
                    "S": chance.string()
                },
            },
        }
    };
}

function createFamilyMember(familyId) {
    return {
        "PutRequest": {
            "Item": {
                "PK": {
                    "S": `FAMILY#${familyId}`
                },
                "SK": {
                    "S": `MEMBER#${chance.guid()}`
                },
                "alias": {
                    "S": chance.first()
                },
                "email": {
                    "S": chance.email()
                },
            }
        }
    }
}


async function putItems(input) {
    const command = new BatchWriteItemCommand(input);

    const result = await client.send(command);

    console.log(JSON.stringify({result}));
}

async function queryBoard(memberId) {
    const command = new QueryCommand({
        TableName: 'wish-list-table',
        KeyConditionExpression: `#PK = :PK AND begins_with(#SK, :SK)`,
        ExpressionAttributeNames: {
          "#PK": "PK",
          "#SK": "SK"
        },
        ExpressionAttributeValues: {
          ":PK": { S: `MEMBER#${memberId}` },
          ":SK": { S: `FAMILY#` }
        },
        ConsistentRead: false,
        IndexName: 'inverse-composite'
      });

      const response = await client.send(command);
      console.log(JSON.stringify({response}, null, 2));
}

(async function doIt() {
    const memberInputs = [];
    const familyMemberInputs = [];

    for (let i = 0; i < 3; i++) {
        const familyId = chance.guid();
        const familyInput = createFamilyInput(familyId);
        const familyMember = createFamilyMember(familyId);

        familyMemberInputs.push(familyMember);

        for (let i = 0; i < chance.d6(); i++) {
            giftInputs.push(createGift(familyId, memberId));
        }
    }

    const itemsToPush = [
        familyInput,
        ...familyMemberInputs,
        ...giftInputs
    ];

    // console.log({length: itemsToPush.length});

    const input = {
        "RequestItems": {
            "wish-list-table": itemsToPush
        }
    };

    await putItems(input);
    await queryBoard(familyId);
})()