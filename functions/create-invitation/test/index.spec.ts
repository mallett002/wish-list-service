import {handler} from '..';

describe('create-invitation', () => {

    let expectedEvent: { pathParameters: { familyId: string; }; body: any };
    
    beforeEach(() => {
        expectedEvent = {
            pathParameters: {
                familyId: 'f3970d31-62f6-4fdd-b35b-a79654261b54'
            },
            body: JSON.stringify({
                memberId: 'member1',
                email: 'mallett002@gmail.com'
            })
        }
    });

    it('should work', async () => {
        // @ts-ignore
        const result = await handler(expectedEvent);

        expect(result.statusCode).toBe(201);
    }, 70000);
});
