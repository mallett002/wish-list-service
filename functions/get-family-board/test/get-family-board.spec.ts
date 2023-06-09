import {handler} from '..';
import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import Chance from 'chance';
import {buildQueryResult} from './board-factory';

const chance = new Chance();

jest.mock('@aws-sdk/client-dynamodb');

describe('get-family-board', () => {
    // @ts-ignore
    const mockedDBClient = DynamoDBClient as jest.MockedFunction<typeof DynamoDBClient>;
    // @ts-ignore
    const mockedQeuryCommand = QueryCommand as jest.MockedFunction<typeof QueryCommand>;

    let dbClient,
        expectedEvent: { pathParameters: { familyId: any; }; },
        queryCommandResult,
        mockedSend,
        queryResult,
        expectedFamilyId;
    
    beforeEach(() => {
        mockedSend = jest.fn();
        dbClient = {send: mockedSend};
        expectedFamilyId = chance.guid();

        expectedEvent = {
            pathParameters: {
                familyId: expectedFamilyId
            }
        }
        queryCommandResult = Symbol('queryCommandResult');
        queryResult = buildQueryResult();

        mockedDBClient.mockReturnValue(dbClient);
        mockedQeuryCommand.mockReturnValue(queryCommandResult);
        mockedSend.mockResolvedValue(queryResult);
    });

    it('should work', async () => {
        // @ts-ignore
        const result = await handler(expectedEvent);

        expect(result.statusCode).toBe(200);
    });
});
