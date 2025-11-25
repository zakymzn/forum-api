const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const pool = require('../../database/postgres/pool');

describe('ThreadRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia' });
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist thread and return added thread correctly', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const addThread = new AddThread({
        title: 'sebuah thread',
        body: 'isi thread',
        owner: 'user-123',
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(addThread);

      // Assert
      expect(addedThread.id).toEqual('thread-123');
      expect(addedThread.title).toEqual('sebuah thread');
      expect(addedThread.owner).toEqual('user-123');

      const threads = await ThreadsTableTestHelper.findThreadsById('thread-123');
      expect(threads).toHaveLength(1);
      expect(threads[0].title).toEqual('sebuah thread');
      expect(threads[0].body).toEqual('isi thread');
      expect(threads[0].owner).toEqual('user-123');
    });
  });

  describe('getThreadById function', () => {
    it('should return thread by id with username', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'sebuah thread', body: 'isi thread', owner: 'user-123' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => {});

      // Action
      const thread = await threadRepositoryPostgres.getThreadById('thread-123');

      // Assert
      expect(thread.id).toEqual('thread-123');
      expect(thread.title).toEqual('sebuah thread');
      expect(thread.body).toEqual('isi thread');
      expect(thread.username).toEqual('dicoding');
    });

    it('should throw error when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => {});

      // Action & Assert
      await expect(threadRepositoryPostgres.getThreadById('thread-invalid')).rejects.toThrowError('THREAD_NOT_FOUND');
    });
  });
});
