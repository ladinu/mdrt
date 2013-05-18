var log    = require('./lib/log');
var WebSS  = require('ws').Server;
var http   = require('http');
var nb     = require('vim-netbeans');
var marked = require('marked');
var fs     = require('fs');

var fname = process.argv[1];
var server = new nb.VimServer({'port': 8080, 'debug': false});

var handleClient = function(client) {

  client.editFile(fname, function(buffer) {
    buffer.startDocumentListen();

    buffer.on("insert", function() {
      buffer.getText(handleChanges);
    });

    buffer.on("remove", function() {
      buffer.getText(handleChanges);
    })
  });
}

server.on('clientAuthed', handleClient);
server.listen();


var wss = new WebSS( {'port': 9091} );
var socket;

wss.on('connection', function(ws) {
  log("> CONNECTION");
  socket = ws;
});

var handleChanges = function(text) {
  var md = marked.parse(text);
  socket.send(md, function(err) {
    if (err) log("> ERR: ", err);
  });
}

var httpServer = http.createServer(function(req, res) {
  var url = req.url;
  if (url !== '/')
    res.end()
  else
    fs.createReadStream('./app.html').pipe(res);
});

httpServer.listen(9090);
