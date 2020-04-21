const server = require('./app');

const port = process.env.PORT;

// используем вместо app server чтобы работать с socket
server.listen(port, () => {
    console.log('Server is listening on ' + port);
});