const AddThread = require('../../entities/AddThread');

describe('AddThread entity', () => {
  it('should create AddThread object correctly', () => {
    const payload = {
      title: 'sebuah thread',
      body: 'isi thread',
      owner: 'user-123',
    };

    const addThread = new AddThread(payload);

    expect(addThread.title).toEqual(payload.title);
    expect(addThread.body).toEqual(payload.body);
    expect(addThread.owner).toEqual(payload.owner);
  });

  it('should throw error when payload not contain needed property', () => {
    const payload = {
      title: 'sebuah thread',
    };

    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    const payload = {
      title: 123,
      body: {},
    };

    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
});
