const bcrypt = require("bcryptjs");

bcrypt.hash("owner123", 10).then((hash) => {
  console.log(hash);
});