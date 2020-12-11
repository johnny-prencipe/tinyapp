const bcrypt = require('bcrypt');
const saltRounds = 10;
const plaintext = 'asd'

bcrypt.hash(plaintext, saltRounds, function(err, hash) {
  if (err) return err;
  console.log(hash);
});

