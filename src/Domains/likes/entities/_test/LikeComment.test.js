const LikeComment = require('../LikeComment');

describe('LikeComment entity', () => {
  it('should create LikeComment object correctly', () => {
    const payload = {
      commentId: 'comment-123',
      owner: 'user-123',
    };

    const likeComment = new LikeComment(payload);

    expect(likeComment.commentId).toEqual(payload.commentId);
    expect(likeComment.owner).toEqual(payload.owner);
  });
});
