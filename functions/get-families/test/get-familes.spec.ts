import {handler} from '..';
import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import Chance from 'chance';
import {buildQueryResult} from './board-factory';

const chance = new Chance();

// jest.mock('@aws-sdk/client-dynamodb');

describe('get-families for member', () => {
    // // @ts-ignore
    // const mockedDBClient = DynamoDBClient as jest.MockedFunction<typeof DynamoDBClient>;
    // // @ts-ignore
    // const mockedQeuryCommand = QueryCommand as jest.MockedFunction<typeof QueryCommand>;

    // let dbClient,
        let expectedEvent: { pathParameters: { memberId: any; }; };
        // queryCommandResult,
        // mockedSend,
        // queryResult,
        // expectedFamilyId;
    
    beforeEach(() => {
        // mockedSend = jest.fn();
        // dbClient = {send: mockedSend};
        // expectedFamilyId = chance.guid();

        expectedEvent = {
            pathParameters: {
                memberId: 'f3970d31-62f6-4fdd-b35b-a79654261b54'
            }
        }
        // queryCommandResult = Symbol('queryCommandResult');
        // queryResult = buildQueryResult();

        // mockedDBClient.mockReturnValue(dbClient);
        // mockedQeuryCommand.mockReturnValue(queryCommandResult);
        // mockedSend.mockResolvedValue(queryResult);
    });

    it('should work', async () => {
        // @ts-ignore
        const result = await handler(expectedEvent);

        expect(result.statusCode).toBe(200);
    }, 70000);
});
