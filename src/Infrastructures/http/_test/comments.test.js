const createServer = require('../createServer');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const pool = require('../../database/postgres/pool');

describe('POST /threads/{threadId}/comments', () => {
  let server;
  let accessToken;
  let threadId;
  let userId;

  beforeAll(async () => {
    server = await createServer(container);
  });

  beforeEach(async () => {
    // Add user
    const userResponse = await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      },
    });
    userId = JSON.parse(userResponse.payload).data.addedUser.id;

    // Login user
    const loginResponse = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: 'dicoding',
        password: 'secret_password',
      },
    });
    accessToken = JSON.parse(loginResponse.payload).data.accessToken;

    // Add thread
    const threadResponse = await server.inject({
      method: 'POST',
      url: '/threads',
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      payload: {
        title: 'sebuah thread',
        body: 'isi thread',
      },
    });
    threadId = JSON.parse(threadResponse.payload).data.addedThread.id;
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await server.stop();
    await pool.end();
  });

  describe('when request valid', () => {
    it('should response 201 and persisted comment', async () => {
      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          content: 'sebuah comment',
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment.id).toBeDefined();
      expect(responseJson.data.addedComment.content).toEqual('sebuah comment');
      expect(responseJson.data.addedComment.owner).toEqual(userId);
    });
  });

  describe('when request payload not contain needed property', () => {
    it('should response 400', async () => {
      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        payload: {},
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
    });
  });

  describe('when thread not found', () => {
    it('should response 404', async () => {
      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-invalid/comments',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          content: 'sebuah comment',
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });
  });

  describe('when request not authenticated', () => {
    it('should response 401', async () => {
      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'sebuah comment',
        },
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });
  });
});
