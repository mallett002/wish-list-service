import {handler} from '..';

describe('handle-invitation', () => {

    let expectedEvent: { 
        pathParameters: { 
            familyId: string;
            email: string;
         };
        body: any
     };
    
    beforeEach(() => {
        expectedEvent = {
            pathParameters: {
                familyId: 'e000cd90-441d-4765-afa1-23f7b6a50bb8',
                email: 'mally2@gmail.com'
            },
            body: JSON.stringify({
                status: 'ACCEPTED', // OR REJECTED
            })
        }
    });

    it('should work', async () => {
        // @ts-ignore
        const result = await handler(expectedEvent);

        expect(result.statusCode).toBe(204);
    }, 70000);
});
