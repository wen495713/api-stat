# api-stat

middleware for express application

### sample code

var express = require('express');
var app = express();
app.use(apistat(app));
app.listen(7654)