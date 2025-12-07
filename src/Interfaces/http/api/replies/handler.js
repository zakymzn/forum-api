const AddThreadCommentReplyUseCase = require('../../../../Applications/use_case/AddThreadCommentReplyUseCase');
const DeleteThreadCommentReplyUseCase = require('../../../../Applications/use_case/DeleteThreadCommentReplyUseCase');

class RepliesHandler {
  constructor(container) {
    this._container = container;

    this.postThreadCommentReplyHandler = this.postThreadCommentReplyHandler.bind(this);
    this.deleteThreadCommentReplyHandler = this.deleteThreadCommentReplyHandler.bind(this);
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

module.exports = RepliesHandler;