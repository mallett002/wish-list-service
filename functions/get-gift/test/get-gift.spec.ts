import {handler} from '..';

describe('get-gift', () => {
    it('should work', async () => {
        const result = await handler();

        expect(result.statusCode).toBe(200);
    });
});
