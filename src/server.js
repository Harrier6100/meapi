require('dotenv').config();
require('module-alias/register');
const app = require('@/app.js');
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log('Server is running on port', port);
});