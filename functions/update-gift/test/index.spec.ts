import {handler} from '..';

describe('update-gift', () => {

    let expectedEvent: { 
        pathParameters: { 
            familyId: string;
            email: string;
            giftId: string;
         };
        body: string
     };
    
    beforeEach(() => {
        expectedEvent = {
            pathParameters: {
                familyId: 'f6cf9f74-6f16-4dd4-99fc-2d70cc103264',
                email: 'mally@gmail.com',
                giftId: '...'
            },
            body: JSON.stringify({
                purchased: true,
                description: 'This is a test gift'
            })
        }
    });

    it('should work', async () => {
        // @ts-ignore
        const result = await handler(expectedEvent);

        expect(result.statusCode).toBe(200);
    }, 70000);
});
