const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const InvariantError = require('../../../Commons/exceptions/InvariantError');

describe('ThreadRepositoryPostgres unit tests', () => {
  it('should throw InvariantError when addThread does not persist', async () => {
    // Arrange: fake pool returning no rows
    const fakePool = {
      query: jest.fn().mockResolvedValue({ rowCount: 0, rows: [] }),
    };
    const repo = new ThreadRepositoryPostgres(fakePool, () => '123');

    // Action & Assert
    await expect(repo.addThread({ title: 't', body: 'b', owner: 'user-123' })).rejects.toThrow(InvariantError);
  });

  it('should throw THREAD_NOT_FOUND error when getThreadById not found', async () => {
    const fakePool = {
      query: jest.fn().mockResolvedValue({ rowCount: 0, rows: [] }),
    };
    const repo = new ThreadRepositoryPostgres(fakePool, () => '123');

    await expect(repo.getThreadById('thread-xyz')).rejects.toThrowError('THREAD_NOT_FOUND');
  });
});
