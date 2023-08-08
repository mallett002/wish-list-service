import {handler} from '..';

describe('image-url-generator', () => {

    let expectedEvent: { pathParameters: { familyId: string; }; body: any };
    
    beforeEach(() => {
        // this stuff will change:
        expectedEvent = {
            pathParameters: {
                familyId: 'f3970d31-62f6-4fdd-b35b-a79654261b54'
            },
            body: JSON.stringify({
                memberId: 'member1',
            })
        }
    });

    it('should work', async () => {
        // @ts-ignore
        const result = await handler(expectedEvent);

        expect(result.statusCode).toBe(200);
    }, 70000);
});
