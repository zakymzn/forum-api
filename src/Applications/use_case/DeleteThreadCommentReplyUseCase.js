const DeleteReply = require('../../Domains/replies/entities/DeleteReply');

class DeleteThreadCommentReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const deleteReply = new DeleteReply(useCasePayload);

    const { threadId, commentId, replyId, owner } = deleteReply;

    // verify thread exists
    await this._threadRepository.getThreadById(threadId);

    // verify comment exists
    await this._commentRepository.verifyCommentExist(commentId);

    // verify reply ownership and existence
    await this._replyRepository.verifyReplyOwner(replyId, owner);

    // perform soft delete
    await this._replyRepository.deleteReply(replyId);
  }
}

module.exports = DeleteThreadCommentReplyUseCase;
