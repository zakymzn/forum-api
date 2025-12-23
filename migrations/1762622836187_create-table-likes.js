/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('likes', {
    id: { type: 'VARCHAR(60)', primaryKey: true },
    comment_id: {
      type: 'VARCHAR(60)',
      notNull: true,
      references: '"comments"',
      onDelete: 'cascade',
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"users"',
      onDelete: 'cascade',
    },
  });

  pgm.addConstraint('likes', 'unique_like_per_user_per_comment', 'UNIQUE(comment_id, owner)');
};

exports.down = (pgm) => {
  pgm.dropTable('likes');
};
