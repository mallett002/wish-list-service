import {handler} from '..';

describe('delete-gift', () => {

    let expectedEvent: { 
        pathParameters: { 
            familyId: string;
            email: string;
            giftId: string;
         };
     };
    
    beforeEach(() => {
        expectedEvent = {
            pathParameters: {
                familyId: '69b6e448-c210-4dd3-82cc-aba728bece2b',
                email: 'mallett002@gmail.com',
                giftId: '109d84c7-0333-4301-b171-b69110b3db33'
            }
        }
    });

    it('should work', async () => {
        // @ts-ignore
        const result = await handler(expectedEvent);

        expect(result.statusCode).toBe(204);
    }, 70000);
});
