const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'sebuah thread',
      body: 'isi thread',
      owner: 'user-123',
    };

    // create dependency
    const mockThreadRepository = {
      addThread: jest.fn().mockResolvedValue({
        id: 'thread-123',
        title: useCasePayload.title,
        owner: useCasePayload.owner,
      }),
    };

    const addThreadUseCase = new AddThreadUseCase({ threadRepository: mockThreadRepository });

    // Action
    const addedThread = await addThreadUseCase.execute(useCasePayload);

    // Assert
    expect(addedThread).toEqual({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: useCasePayload.owner,
    });
    expect(mockThreadRepository.addThread).toBeCalledWith(expect.objectContaining({
      title: useCasePayload.title,
      body: useCasePayload.body,
      owner: useCasePayload.owner,
    }));
  });
});
