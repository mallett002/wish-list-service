import {handler} from '..';

describe('search members by email', () => {

    let expectedEvent: { queryStringParameters: { email: string; }; };
    
    beforeEach(() => {
        expectedEvent = {
            queryStringParameters: {
                email: 'mall'
            }
        }
    });

    it('should work', async () => {
        // @ts-ignore
        const result = await handler(expectedEvent);

        expect(result.statusCode).toBe(200);
    }, 70000);
});
