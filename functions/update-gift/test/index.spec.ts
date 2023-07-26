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
                familyId: '678e0112-dd17-4c16-b2ea-49d46fb417b9',
                email: 'mallett002@gmail.com',
                giftId: 'aed19711-1b41-44de-9284-cc473526b684'
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
