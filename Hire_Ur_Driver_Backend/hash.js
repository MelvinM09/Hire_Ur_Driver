const bcrypt = require('bcryptjs');
bcrypt.hash('admin@123', 10).then(hash => {
  console.log('Generated hash:', hash);
  bcrypt.compare('admin@123', hash).then(result => console.log('Compare result:', result));
});