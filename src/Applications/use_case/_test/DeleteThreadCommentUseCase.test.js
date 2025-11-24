const DeleteThreadCommentUseCase = require('../DeleteThreadCommentUseCase');

describe('DeleteThreadCommentUseCase', () => {
  it('should orchestrating the delete thread comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    const mockThreadRepository = {
      getThreadById: jest.fn().mockResolvedValue({}),
    };

    const mockCommentRepository = {
      verifyCommentOwner: jest.fn().mockResolvedValue(),
      deleteComment: jest.fn().mockResolvedValue(),
    };

    const deleteThreadCommentUseCase = new DeleteThreadCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    await deleteThreadCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(useCasePayload.commentId, useCasePayload.owner);
    expect(mockCommentRepository.deleteComment).toBeCalledWith(useCasePayload.commentId);
  });

  it('should throw error when comment not found or not owner', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-invalid',
      owner: 'user-123',
    };

    const mockThreadRepository = {
      getThreadById: jest.fn().mockResolvedValue({}),
    };

    const mockCommentRepository = {
      verifyCommentOwner: jest.fn().mockRejectedValue(new Error('COMMENT_NOT_FOUND')),
      deleteComment: jest.fn(),
    };

    const deleteThreadCommentUseCase = new DeleteThreadCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    await expect(deleteThreadCommentUseCase.execute(useCasePayload)).rejects.toThrowError('COMMENT_NOT_FOUND');
    expect(mockCommentRepository.deleteComment).not.toBeCalled();
  });
});
