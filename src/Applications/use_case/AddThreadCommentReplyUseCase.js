const AddReply = require('../../Domains/replies/entities/AddReply');

class AddThreadCommentReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const addReply = new AddReply(useCasePayload);

    const { commentId, threadId } = addReply;

    // verify thread exists
    await this._threadRepository.getThreadById(threadId);

    // verify comment exists
    await this._commentRepository.verifyCommentExist(commentId);

    // perform the add reply
    const addedReply = await this._replyRepository.addReply(addReply);

    return addedReply;
  }
}

module.exports = AddThreadCommentReplyUseCase;
