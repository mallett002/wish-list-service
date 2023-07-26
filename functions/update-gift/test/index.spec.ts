import {handler} from '..';

describe('update-gift', () => {

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
                familyId: 'f6cf9f74-6f16-4dd4-99fc-2d70cc103264',
                email: 'mally@gmail.com'
            },
            body: JSON.stringify({
                status: 'ACCEPTED',
                // status: 'REJECTED',
                // status: 'PENDING',
            })
        }
    });

    it('should work', async () => {
        // @ts-ignore
        const result = await handler(expectedEvent);

        expect(result.statusCode).toBe(204);
    }, 70000);
});
