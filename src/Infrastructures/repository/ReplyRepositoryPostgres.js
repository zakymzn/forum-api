const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(addReply) {
    const { content, commentId, threadId, owner } = addReply;
    const id = `reply-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO replies (id, content, comment_id, thread_id, owner) VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, content, commentId, threadId, owner],
    };

    const result = await this._pool.query(query);

    return { ...result.rows[0] };
  }

  async getReplyByCommentId(commentId) {
    const query = {
      text: `SELECT replies.id, replies.content, replies.is_delete, replies.created_at, users.username
             FROM replies
             LEFT JOIN users ON users.id = replies.owner
             WHERE replies.comment_id = $1
             ORDER BY replies.created_at ASC`,
      values: [commentId],
    };

    const result = await this._pool.query(query);
    return result.rows.map((row) => ({
      id: row.id,
      username: row.username,
      date: row.created_at,
      content: row.is_delete ? '**balasan telah dihapus**' : row.content,
    }));
  }
}

module.exports = ReplyRepositoryPostgres;
