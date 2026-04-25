const bcrypt = require('bcrypt');

bcrypt.hash("cuneo2026", 10, (err, hash) => {
  console.log(hash);
});