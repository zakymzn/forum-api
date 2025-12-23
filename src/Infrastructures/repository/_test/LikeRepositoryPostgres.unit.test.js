const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');
const LikeComment = require('../../../Domains/likes/entities/LikeComment');

describe('LikeRepositoryPostgres unit mapping', () => {
  it('should map addLike params and return inserted id', async () => {
    const fakePool = {
      query: jest.fn().mockResolvedValue({ rows: [{ id: 'like-123' }] }),
    };

    const repo = new LikeRepositoryPostgres(fakePool, () => '123');
    const like = new LikeComment({ commentId: 'comment-123', owner: 'user-123' });

    const added = await repo.addLike(like);

    expect(added.id).toEqual('like-123');
    expect(fakePool.query).toHaveBeenCalledWith({
      text: 'INSERT INTO likes (id, comment_id, owner) VALUES($1, $2, $3) RETURNING id',
      values: ['like-123', 'comment-123', 'user-123'],
    });
  });

  it('should call delete query with correct params', async () => {
    const fakePool = { query: jest.fn().mockResolvedValue() };
    const repo = new LikeRepositoryPostgres(fakePool, () => '123');

    await repo.deleteLike('comment-1', 'user-1');

    expect(fakePool.query).toHaveBeenCalledWith({
      text: 'DELETE FROM likes WHERE comment_id = $1 AND owner = $2',
      values: ['comment-1', 'user-1'],
    });
  });

  it('should return like when findLike returns a row', async () => {
    const fakePool = { query: jest.fn().mockResolvedValue({ rows: [{ id: 'like-1' }] }) };
    const repo = new LikeRepositoryPostgres(fakePool, () => '123');

    const like = await repo.findLike('comment-1', 'user-1');

    expect(like.id).toEqual('like-1');
    expect(fakePool.query).toHaveBeenCalledWith({
      text: 'SELECT id FROM likes WHERE comment_id = $1 AND owner = $2',
      values: ['comment-1', 'user-1'],
    });
  });

  it('should return count number from getLikeCountByCommentId', async () => {
    const fakePool = { query: jest.fn().mockResolvedValue({ rows: [{ count: 5 }] }) };
    const repo = new LikeRepositoryPostgres(fakePool, () => '123');

    const count = await repo.getLikeCountByCommentId('comment-1');

    expect(count).toEqual(5);
    expect(fakePool.query).toHaveBeenCalledWith({
      text: 'SELECT COUNT(*)::int AS count FROM likes WHERE comment_id = $1',
      values: ['comment-1'],
    });
  });
});
