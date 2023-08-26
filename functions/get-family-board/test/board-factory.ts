import Chance from 'chance';

const chance = new Chance();

const createFamilyMember = (familyId: string) => ({
    "alias": {
        "S": chance.first()
      },
      "SK": {
        "S": `MEMBER#${chance.email()}`
      },
      "PK": {
        "S": `FAMILY#${familyId}`
      },
});

const createInvitation = (familyId: string) => ({
    "status": {
        "S": 'PENDING'
      },
      "SK": {
        "S": `MEMBER#${chance.email()}#INVITATION`
      },
      "PK": {
        "S": `FAMILY#${familyId}`
      },
});

const createGift = (familyId: string, username: string) => ({
    "purchased": {
        "BOOL": chance.bool()
      },
      "SK": {
        "S": `MEMBER#${username}GIFT#${chance.guid()}`
      },
      "link": {
        "S": chance.url()
      },
      "description": {
        "S": chance.string()
      },
      "PK": {
        "S": `FAMILY#${familyId}`
      },
      "title": {
        "S": chance.string()
      }
});

export const buildQueryResult = () => {
    const familyId = chance.guid();
    const result = {
        "$metadata": {
            "httpStatusCode": 200,
            "requestId": "IF3IJNU7PDSGGJAGLIM47NLJAJVV4KQNSO5AEMVJF66Q9ASUAAJG",
            "attempts": 1,
            "totalRetryDelay": 0
          },
          Items: [
            {
                "imageContentType": {
                    "S": chance.string()
                  },
                  "SK": {
                    "S": "MEMBER#BOARD"
                  },
                  "PK": {
                    "S": `FAMILY#${familyId}`
                  },
                  "familyName": {
                    "S": chance.last()
                  }
            }
          ]
    };

    for (let i = 0; i < 3; i++) {
        const member = createFamilyMember(familyId);

        result.Items.push(member);
        result.Items.push(createInvitation(familyId))

        const username = member.SK.S.replace('MEMBER#', '');

        for (let i = 0; i < chance.d4(); i++) {
            // @ts-ignore
            result.Items.push(createGift(familyId, username));
        }
    }

    result.Items.sort();

    console.log(JSON.stringify(result, null, 2));

    return result;
};