// move helper function here
// const getUserByEmail = (email, database) => {
//   return Object.values(database).find(user => user.email === email);
// };

const getUserByEmail = function(email, userDatabase) {
  for (const user in userDatabase) {
    if (userDatabase[user].email === email) {
      return userDatabase[user].id;
    }
  }
};


module.exports = getUserByEmail;
