import {handler} from '..';

describe('delete-invitation', () => {

    let expectedEvent: { 
        pathParameters: { 
            familyId: string;
            email: string;
         }
     };
    
    beforeEach(() => {
        expectedEvent = {
            pathParameters: {
                familyId: 'f6cf9f74-6f16-4dd4-99fc-2d70cc103264',
                email: 'mallbert@gmail.com'
            },
        }
    });

    it('should work', async () => {
        // @ts-ignore
        const result = await handler(expectedEvent);

        expect(result.statusCode).toBe(204);
    }, 70000);
});
