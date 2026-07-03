const bcrypt = require("bcrypt");
bcrypt.hash("ownerpassword", 10).then((hash) => {
  process.stdout.write(hash);
});