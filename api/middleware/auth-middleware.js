const { findBy } = require('../users/users-model');

const checkUserBody = (req, res, next) => {
  if(!req.body.username || !req.body.password) {
    next({ status:400, message: 'username and password required' });
  } else {
    next();
  }
}

const checkUserExists = async (req, res, next) => {
  const user = await findBy({ username: req.body.username });

  if(user) {
    next({ status: 400, message: 'username taken' });
  } else {
    next();
  }
}

const validateCredentials = (req, res, next) => {

}

module.exports = {
  checkUserBody,
  checkUserExists,
  validateCredentials
}