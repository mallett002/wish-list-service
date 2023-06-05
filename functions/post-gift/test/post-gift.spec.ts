import {handler} from '..';

describe('post-gift', () => {
    it('should work', async () => {
        const result = await handler();

        expect(result.statusCode).toBe(201);
    });
});
