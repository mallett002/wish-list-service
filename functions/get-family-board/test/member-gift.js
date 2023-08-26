const { DynamoDBClient, BatchWriteItemCommand, QueryCommand } = require('@aws-sdk/client-dynamodb');
const Chance = require('chance');

const chance = new Chance();
const client = new DynamoDBClient({ region: "us-east-1" });

function createMemberInput() {
    const email = chance.email();

    return {
        PutRequest: {
            Item: {
                PK: {
                    S: `MEMBER#${email}`
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

function createInvitation(familyId) {
    return {
        "PutRequest": {
            "Item": {
                "status": {
                    "S": 'PENDING'
                },
                "SK": {
                    "S": `MEMBER#${chance.guid()}#INVITATION`
                },
                "PK": {
                    "S": `FAMILY#${familyId}`
                },
            }
        }
    }
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
                "imageContentType": {
                    "S": chance.pickone(['image/png', 'image/jpeg'])
                },
            },
        }
    };
}

function createFamilyMember(familyId, alias, email, memberId) {
    return {
        "PutRequest": {
            "Item": {
                "PK": {
                    "S": `FAMILY#${familyId}`
                },
                "SK": {
                    "S": `MEMBER#${memberId}`
                },
                "alias": {
                    "S": alias
                },
                "email": {
                    "S": email
                },
            }
        }
    }
}

function createGift(familyId, memberId) {
    return {
        PutRequest: {
            Item: {
                PK: {
                    S: `FAMILY#${familyId}`
                },
                SK: {
                    S: `MEMBER#${memberId}GIFT#${chance.guid()}`
                },
                description: {
                    S: chance.sentence()
                },
                link: {
                    S: chance.url()
                },
                title: {
                    S: chance.string()
                },
                purchased: {
                    BOOL: chance.bool()
                }
            }
        }
    }
}

async function putItems(input) {
    const command = new BatchWriteItemCommand(input);

    const result = await client.send(command);

    console.log(JSON.stringify({ result }));
}

async function queryBoard(familyId) {
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
        ConsistentRead: true,
        ScanIndexForward: true
    });

    const response = await client.send(command);
    console.log(JSON.stringify({ response }, null, 2));
}

(async function doIt() {
    const memberInputs = [];
    const familyMemberInputs = [];
    const giftInputs = [];
    const invitationInputs = [];

    const familyId = chance.guid();

    const familyInput = createFamilyInput(familyId);

    for (let i = 0; i < 3; i++) {
        const member = createMemberInput();

        const { PutRequest: { Item: memberItem } } = member;
        const memberId = memberItem.PK.S.replace('MEMBER#', '');

        const familyMember = createFamilyMember(
            familyId,
            memberItem.alias.S,
            memberItem.email.S,
            memberId
        );

        memberInputs.push(member);
        familyMemberInputs.push(familyMember);
        invitationInputs.push(createInvitation(familyId));

        for (let i = 0; i < chance.d6(); i++) {
            giftInputs.push(createGift(familyId, memberId));
        }
    }

    const itemsToPush = [
        familyInput,
        ...familyMemberInputs,
        ...giftInputs
    ];

    const input = {
        "RequestItems": {
            "wish-list-table": itemsToPush
        }
    };

    await putItems(input);
    await queryBoard(familyId);
})()