const GetThreadUseCase = require('../GetThreadUseCase');

describe('GetThreadUseCase', () => {
  it('should orchestrating the get thread action correctly', async () => {
    // Arrange
    const useCasePayload = 'thread-123';

    const mockThreadRepository = {
      getThreadById: jest.fn().mockResolvedValue({
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'isi thread',
        username: 'dicoding',
        created_at: '2021-08-08T07:19:09.775Z',
      }),
    };

    const mockCommentRepository = {
      getCommentsByThreadId: jest.fn().mockResolvedValue([]),
    };

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const thread = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(useCasePayload);
    expect(thread.id).toEqual('thread-123');
    expect(thread.title).toEqual('sebuah thread');
    expect(thread.body).toEqual('isi thread');
    expect(thread.username).toEqual('dicoding');
    expect(thread.comments).toHaveLength(0);
  });

  it('should throw error when thread not found', async () => {
    // Arrange
    const useCasePayload = 'thread-invalid';

    const mockThreadRepository = {
      getThreadById: jest.fn().mockRejectedValue(new Error('THREAD_NOT_FOUND')),
    };

    const mockCommentRepository = {
      getCommentsByThreadId: jest.fn(),
    };

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    await expect(getThreadUseCase.execute(useCasePayload)).rejects.toThrowError('THREAD_NOT_FOUND');
    expect(mockCommentRepository.getCommentsByThreadId).not.toBeCalled();
  });
});
