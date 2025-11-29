const createServer = require('../createServer');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const pool = require('../../database/postgres/pool');

let server;
beforeAll(async () => {
  server = await createServer(container);
});

describe('POST /threads/{threadId}/comments', () => {
  let accessToken;
  let threadId;
  let userId;

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

describe('DELETE /threads/{threadId}/comments/{commentId}', () => {
  let accessToken;
  let threadId;
  let userId;

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

  it('should response 200 when comment deleted by owner', async () => {
    // Arrange
    const commentResponse = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      payload: {
        content: 'sebuah comment',
      },
    });

    const commentId = JSON.parse(commentResponse.payload).data.addedComment.id;

    // Action
    const response = await server.inject({
      method: 'DELETE',
      url: `/threads/${threadId}/comments/${commentId}`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(200);
    expect(responseJson.status).toEqual('success');
  });

  it('should response 403 when deleting by not owner', async () => {
    // Arrange
    const commentResponse = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      payload: {
        content: 'sebuah comment',
      },
    });

    const commentId = JSON.parse(commentResponse.payload).data.addedComment.id;

    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'another',
        password: 'secret_password',
        fullname: 'Another User',
      },
    });

    const loginResponse = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: 'another',
        password: 'secret_password',
      },
    });
    const otherAccessToken = JSON.parse(loginResponse.payload).data.accessToken;

    // Action
    const response = await server.inject({
      method: 'DELETE',
      url: `/threads/${threadId}/comments/${commentId}`,
      headers: {
        authorization: `Bearer ${otherAccessToken}`,
      },
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(403);
    expect(responseJson.status).toEqual('fail');
  });

  it('should response 404 when thread or comment not found', async () => {
    const response = await server.inject({
      method: 'DELETE',
      url: `/threads/${threadId}/comments/comment-invalid`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(404);
    expect(responseJson.status).toEqual('fail');
  });

  it('should response 401 when not authenticated', async () => {
    const commentResponse = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      payload: {
        content: 'sebuah comment',
      },
    });

    const commentId = JSON.parse(commentResponse.payload).data.addedComment.id;

    const response = await server.inject({
      method: 'DELETE',
      url: `/threads/${threadId}/comments/${commentId}`,
    });

    expect(response.statusCode).toEqual(401);
  });
});

afterAll(async () => {
  await server.stop();
  await pool.end();
});

