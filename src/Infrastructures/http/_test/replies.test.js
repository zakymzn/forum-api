const createServer = require('../createServer');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
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

describe('POST /threads/{threadId}/comments/{commentId}/replies', () => {
  let accessToken;
  let threadId;
  let commentId;
  let userId;

  beforeEach(async () => {
    // add user
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

    // login user
    const loginResponse = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: 'dicoding',
        password: 'secret_password',
      },
    });
    accessToken = JSON.parse(loginResponse.payload).data.accessToken;

    // add thread
    const threadResponse = await server.inject({
      method: 'POST',
      url: '/threads',
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { title: 'sebuah thread', body: 'isi thread' },
    });
    threadId = JSON.parse(threadResponse.payload).data.addedThread.id;

    // add comment
    const commentResponse = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { content: 'sebuah comment' },
    });
    commentId = JSON.parse(commentResponse.payload).data.addedComment.id;
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when request valid', () => {
    it('should response 201 and persisted reply', async () => {
      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        headers: { authorization: `Bearer ${accessToken}` },
        payload: { content: 'sebuah reply' },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
      expect(responseJson.data.addedReply.id).toBeDefined();
      expect(responseJson.data.addedReply.content).toEqual('sebuah reply');
      expect(responseJson.data.addedReply.owner).toEqual(userId);
    });
  });

  describe('when request payload not contain needed property', () => {
    it('should response 400', async () => {
      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        headers: { authorization: `Bearer ${accessToken}` },
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
        url: `/threads/thread-invalid/comments/${commentId}/replies`,
        headers: { authorization: `Bearer ${accessToken}` },
        payload: { content: 'sebuah reply' },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });
  });

  describe('when comment not found', () => {
    it('should response 404', async () => {
      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/comment-invalid/replies`,
        headers: { authorization: `Bearer ${accessToken}` },
        payload: { content: 'sebuah reply' },
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
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: { content: 'sebuah reply' },
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });
  });
});

afterAll(async () => {
  await server.stop();
  await pool.end();
});

describe('DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
  let accessToken;
  let threadId;
  let commentId;

  beforeEach(async () => {
    // add user
    const userResponse = await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      },
    });

    // login user
    const loginResponse = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: 'dicoding',
        password: 'secret_password',
      },
    });
    accessToken = JSON.parse(loginResponse.payload).data.accessToken;

    // add thread
    const threadResponse = await server.inject({
      method: 'POST',
      url: '/threads',
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { title: 'sebuah thread', body: 'isi thread' },
    });
    threadId = JSON.parse(threadResponse.payload).data.addedThread.id;

    // add comment
    const commentResponse = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { content: 'sebuah comment' },
    });
    commentId = JSON.parse(commentResponse.payload).data.addedComment.id;
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  it('should response 200 when reply deleted by owner', async () => {
    // Arrange
    const replyResponse = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments/${commentId}/replies`,
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { content: 'sebuah reply' },
    });
    const replyId = JSON.parse(replyResponse.payload).data.addedReply.id;

    // Action
    const response = await server.inject({
      method: 'DELETE',
      url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
      headers: { authorization: `Bearer ${accessToken}` },
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(200);
    expect(responseJson.status).toEqual('success');
  });

  it('should response 403 when deleting by not owner', async () => {
    // Arrange
    const replyResponse = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments/${commentId}/replies`,
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { content: 'sebuah reply' },
    });
    const replyId = JSON.parse(replyResponse.payload).data.addedReply.id;

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
      url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
      headers: { authorization: `Bearer ${otherAccessToken}` },
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(403);
    expect(responseJson.status).toEqual('fail');
  });

  it('should response 404 when reply not found', async () => {
    // Action
    const response = await server.inject({
      method: 'DELETE',
      url: `/threads/${threadId}/comments/${commentId}/replies/reply-invalid`,
      headers: { authorization: `Bearer ${accessToken}` },
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(404);
    expect(responseJson.status).toEqual('fail');
  });

  it('should response 401 when not authenticated', async () => {
    // Arrange
    const replyResponse = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments/${commentId}/replies`,
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { content: 'sebuah reply' },
    });
    const replyId = JSON.parse(replyResponse.payload).data.addedReply.id;

    // Action
    const response = await server.inject({
      method: 'DELETE',
      url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
    });

    // Assert
    expect(response.statusCode).toEqual(401);
  });
});
