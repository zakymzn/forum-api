class GetThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository, likeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._likeRepository = likeRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);

    // fetch replies and likeCount for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await this._replyRepository.getReplyByCommentId(comment.id);
        const likeCount = await this._likeRepository.getLikeCountByCommentId(comment.id);
        return {
          ...comment,
          replies,
          likeCount,
        };
      }),
    );

    return {
      id: thread.id,
      title: thread.title,
      body: thread.body,
      date: thread.created_at,
      username: thread.username,
      comments: commentsWithReplies,
    };
  }
}

module.exports = GetThreadUseCase;
