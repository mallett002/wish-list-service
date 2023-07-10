import {handler} from '..';

describe('get-families for member', () => {

    let expectedEvent: { pathParameters: { memberId: any; }; };
    
    beforeEach(() => {
        expectedEvent = {
            pathParameters: {
                memberId: 'f3970d31-62f6-4fdd-b35b-a79654261b54'
            }
        }
    });

    it('should work', async () => {
        // @ts-ignore
        const result = await handler(expectedEvent);

        expect(result.statusCode).toBe(200);
    }, 70000);
});
