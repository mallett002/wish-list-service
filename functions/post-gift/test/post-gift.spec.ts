import {handler} from '..';

describe('post-gift', () => {

    let expectedEvent: { 
        pathParameters: { 
            familyId: string;
            email: string;
         };
        body: string
     };
    
    beforeEach(() => {
        expectedEvent = {
            pathParameters: {
                familyId: '194dee74-6f21-4765-a4b2-b4083ecb4b0d',
                email: 'mallett002@gmail.com',
            },
            body: JSON.stringify({
                title: 'watch',
                purchased: false,
                description: 'This is a test',
                link: 'somewhere3.com',
                favorite: true
            })
        }
    });

    it('should work', async () => {
        const result = await handler(expectedEvent);

        expect(result.statusCode).toBe(201);
    }, 70000);
});
