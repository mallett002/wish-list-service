import {handler} from '..';

describe('get-families for member', () => {

    let expectedEvent: { pathParameters: { memberId: any; }; };
    
    beforeEach(() => {
        expectedEvent = {
            pathParameters: {
                memberId: '636c9015-35d3-4006-9567-5411786ea646'
            }
        }
    });

    it('should work', async () => {
        // @ts-ignore
        const result = await handler(expectedEvent);

        expect(result.statusCode).toBe(200);
    }, 70000);
});
