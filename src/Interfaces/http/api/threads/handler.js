const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const AddThreadCommentUseCase = require('../../../../Applications/use_case/AddThreadCommentUseCase');
const DeleteThreadCommentUseCase = require('../../../../Applications/use_case/DeleteThreadCommentUseCase');
const GetThreadUseCase = require('../../../../Applications/use_case/GetThreadUseCase');
const AddThreadCommentReplyUseCase = require('../../../../Applications/use_case/AddThreadCommentReplyUseCase');
const DeleteThreadCommentReplyUseCase = require('../../../../Applications/use_case/DeleteThreadCommentReplyUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadByIdHandler = this.getThreadByIdHandler.bind(this);
    this.postThreadCommentHandler = this.postThreadCommentHandler.bind(this);
    this.deleteThreadCommentHandler = this.deleteThreadCommentHandler.bind(this);
    this.postThreadCommentReplyHandler = this.postThreadCommentReplyHandler.bind(this);
    this.deleteThreadCommentReplyHandler = this.deleteThreadCommentReplyHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const owner = request.auth && request.auth.credentials ? request.auth.credentials.id : undefined;
    const addedThread = await addThreadUseCase.execute({ ...request.payload, owner });

    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      }
    });
    response.code(201);
    return response;
  }

  async getThreadByIdHandler(request, h) {
    const getThreadUseCase = this._container.getInstance(GetThreadUseCase.name);
    const { threadId } = request.params;

    const thread = await getThreadUseCase.execute(threadId);

    const response = h.response({
      status: 'success',
      data: {
        thread,
      },
    });
    response.code(200);
    return response;
  }

  async postThreadCommentHandler(request, h) {
    const postThreadCommentUseCase = this._container.getInstance(AddThreadCommentUseCase.name);
    const { threadId } = request.params;
    const { content } = request.payload;
    const owner = request.auth && request.auth.credentials ? request.auth.credentials.id : undefined;

    const addedComment = await postThreadCommentUseCase.execute({ content, threadId, owner });

    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }

  async deleteThreadCommentHandler(request, h) {
    const deleteThreadCommentUseCase = this._container.getInstance(DeleteThreadCommentUseCase.name);
    const { threadId, commentId } = request.params;
    const owner = request.auth && request.auth.credentials ? request.auth.credentials.id : undefined;

    await deleteThreadCommentUseCase.execute({ threadId, commentId, owner });

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }

  async postThreadCommentReplyHandler(request, h) {
    const addThreadCommentReplyUseCase = this._container.getInstance(AddThreadCommentReplyUseCase.name);
    const { threadId, commentId } = request.params;
    const { content } = request.payload;
    const owner = request.auth && request.auth.credentials ? request.auth.credentials.id : undefined;

    const addedReply = await addThreadCommentReplyUseCase.execute({ content, commentId, threadId, owner });

    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }

  async deleteThreadCommentReplyHandler(request, h) {
    const deleteThreadCommentReplyUseCase = this._container.getInstance(DeleteThreadCommentReplyUseCase.name);
    const { threadId, commentId, replyId } = request.params;
    const owner = request.auth && request.auth.credentials ? request.auth.credentials.id : undefined;

    await deleteThreadCommentReplyUseCase.execute({ threadId, commentId, replyId, owner });

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = ThreadsHandler;