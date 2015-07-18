// serve locally for mobile access
var express = require('express');

var app = express();
app.use(express.static('.'));


app.listen(3002, function () {
	console.log('server started on 3002')
})


