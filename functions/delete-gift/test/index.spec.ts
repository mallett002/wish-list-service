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
                familyId: '194dee74-6f21-4765-a4b2-b4083ecb4b0d',
                email: 'mallett002@gmail.com',
                giftId: '4ffeb86f-0328-4352-be79-625649f708c7'
            }
        }
    });

    it('should work', async () => {
        // @ts-ignore
        const result = await handler(expectedEvent);

        expect(result.statusCode).toBe(204);
    }, 70000);
});
