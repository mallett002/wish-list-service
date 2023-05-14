const {handler} = require('../functions/wish-list-post');

describe('wish-list-post', () => {
    it('should work', async () => {
        await handler();
    });
});
