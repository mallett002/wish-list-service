import {handler} from '..';

describe('get-family-board', () => {
    it('should work', async () => {
        const result = await handler({});

        expect(result.statusCode).toBe(200);
    });
});
