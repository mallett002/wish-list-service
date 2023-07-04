import Chance from 'chance';

const chance = new Chance();

const createMember = (familyId: string) => ({
    "alias": {
        "S": chance.first()
      },
      "SK": {
        "S": `MEMBER#${chance.guid()}`
      },
      "PK": {
        "S": `FAMILY#${familyId}`
      },
      "email": {
        "S": chance.email()
      }
});

const createGift = (familyId: string, memberId: string) => ({
    "purchased": {
        "BOOL": chance.bool()
      },
      "SK": {
        "S": `MEMBER#${memberId}GIFT#${chance.guid()}`
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
})

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
                "familyImage": {
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

    for (let i = 0; i < 2; i++) {
        const member = createMember(familyId);
        const memberId = member.SK.S.replace('MEMBER#', '');

        for (let i = 0; i < 3; i++) {
            // @ts-ignore
            result.Items.push(createGift(familyId, memberId));
        }

        // @ts-ignore
        result.Items.push(createMember(familyId));
    }

    return result;
};