const db = require('../../data/dbConfig');

function add(user) {
  return db('users').insert(user).then(([id]) => {
    return findById(id);
  });
}

function findById(id) {
  return db('users').where('id', id).first();
}

function findBy(filter) {
  return db('users').where(filter).first();
}

module.exports = {
  add,
  findById,
  findBy
}