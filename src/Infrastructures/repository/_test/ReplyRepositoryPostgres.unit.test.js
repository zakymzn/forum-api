const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepositoryPostgres unit mapping', () => {
  it('should map getReplyByCommentId rows correctly (username null, not deleted)', async () => {
    const fakePool = {
      query: jest.fn().mockResolvedValue({ rows: [
        { id: 'reply-1', content: 'hello', is_delete: false, created_at: '2020-01-01', username: null },
      ] }),
    };

    const repo = new ReplyRepositoryPostgres(fakePool, () => '123');
    const replies = await repo.getReplyByCommentId('comment-1');
    expect(replies).toHaveLength(1);
    expect(replies[0].content).toBe('hello');
    expect(replies[0].username).toBeNull();
    expect(replies[0].date).toBe('2020-01-01');
  });

  it('should replace deleted reply content with replacement text', async () => {
    const fakePool = {
      query: jest.fn().mockResolvedValue({ rows: [
        { id: 'reply-2', content: 'secret', is_delete: true, created_at: '2020-01-02', username: 'john' },
      ] }),
    };

    const repo = new ReplyRepositoryPostgres(fakePool, () => '123');
    const replies = await repo.getReplyByCommentId('comment-1');
    expect(replies[0].content).toBe('**balasan telah dihapus**');
  });

  it('should verify reply exist without throwing when reply exists', async () => {
    const fakePool = {
      query: jest.fn().mockResolvedValue({ rowCount: 1, rows: [{ id: 'reply-1' }] }),
    };

    const repo = new ReplyRepositoryPostgres(fakePool, () => '123');
    await expect(repo.verifyReplyExist('reply-1')).resolves.not.toThrow();
  });
});