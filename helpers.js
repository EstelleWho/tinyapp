// move helper function here
const getUserByEmail = (email, database) => {
  return Object.values(users).find(user => user.email === email);
};

module.exports = getUserByEmail;
