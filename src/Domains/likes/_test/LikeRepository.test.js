const LikeRepository = require('../LikeRepository');

describe('LikeRepository interface', () => {
  it('should throw error when invoke addLike abstract behavior', async () => {
    const likeRepository = new LikeRepository();

    await expect(likeRepository.addLike({})).rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoke deleteLike abstract behavior', async () => {
    const likeRepository = new LikeRepository();

    await expect(likeRepository.deleteLike('comment-123', 'user-123')).rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoke findLike abstract behavior', async () => {
    const likeRepository = new LikeRepository();

    await expect(likeRepository.findLike('comment-123', 'user-123')).rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoke getLikeCountByCommentId abstract behavior', async () => {
    const likeRepository = new LikeRepository();

    await expect(likeRepository.getLikeCountByCommentId('comment-123')).rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
