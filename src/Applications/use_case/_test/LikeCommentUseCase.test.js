const LikeCommentUseCase = require('../LikeCommentUseCase');

describe('LikeCommentUseCase', () => {
  it('should add like when user has not liked the comment', async () => {
    const mockThreadRepository = { getThreadById: jest.fn().mockResolvedValue() };
    const mockCommentRepository = { verifyCommentExist: jest.fn().mockResolvedValue() };
    const mockLikeRepository = { findLike: jest.fn().mockResolvedValue(undefined), addLike: jest.fn(), deleteLike: jest.fn() };

    const likeCommentUseCase = new LikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    await likeCommentUseCase.execute({ threadId: 'thread-1', commentId: 'comment-1', owner: 'user-1' });

    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith('thread-1');
    expect(mockCommentRepository.verifyCommentExist).toHaveBeenCalledWith('comment-1');
    expect(mockLikeRepository.findLike).toHaveBeenCalledWith('comment-1', 'user-1');
    expect(mockLikeRepository.addLike).toHaveBeenCalledWith({ commentId: 'comment-1', owner: 'user-1' });
    expect(mockLikeRepository.deleteLike).not.toHaveBeenCalled();
  });

  it('should delete like when user has already liked the comment', async () => {
    const mockThreadRepository = { getThreadById: jest.fn().mockResolvedValue() };
    const mockCommentRepository = { verifyCommentExist: jest.fn().mockResolvedValue() };
    const mockLikeRepository = { findLike: jest.fn().mockResolvedValue({ id: 'like-1' }), addLike: jest.fn(), deleteLike: jest.fn() };

    const likeCommentUseCase = new LikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    await likeCommentUseCase.execute({ threadId: 'thread-1', commentId: 'comment-1', owner: 'user-1' });

    expect(mockLikeRepository.findLike).toHaveBeenCalledWith('comment-1', 'user-1');
    expect(mockLikeRepository.deleteLike).toHaveBeenCalledWith('comment-1', 'user-1');
    expect(mockLikeRepository.addLike).not.toHaveBeenCalled();
  });
});
