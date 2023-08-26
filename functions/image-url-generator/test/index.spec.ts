import {handler} from '..';

describe('image-url-generator', () => {

    let expectedEvent: { pathParameters: { familyId: string; }; body: any };
    
    beforeEach(() => {
        // this stuff will change:
        expectedEvent = {
            pathParameters: {
                familyId: '94548e87-e9b3-4917-8594-bfb1a99a4f94'
            },
            body: JSON.stringify({
                contentType: 'image/png',
                // operation: 'GET_OBJECT'
                operation: 'PUT_OBJECT'
            })
        }
    });

    it('should work', async () => {
        // @ts-ignore
        const result = await handler(expectedEvent);

        expect(result.statusCode).toBe(200);
    }, 70000);
});
