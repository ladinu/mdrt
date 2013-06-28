var log    = require('./lib/log');
var WebSS  = require('ws').Server;
var http   = require('http');
var nb     = require('vim-netbeans');
var marked = require('marked');
var fs     = require('fs');

var fname = process.argv[2];
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
var sockets = [];
var md = '';

wss.on('connection', function(ws) {
  log("> CONNECTION");
  ws.send(md);
  sockets.push(ws);
  ws.addEventListener('close', function() {
    log("> CLIENT DISCONNECT");
    sockets.splice(sockets.indexOf(ws), 1);
  });
});

var handleChanges = function(text) {
  md = marked.parse(text);
  broadcast(md, function(err) {
    if (err) log("> ERR: ", err);
  });
}

var broadcast = function(text, cb) {
  sockets.forEach(function(socket) {
    socket.send(text, cb);
  });
}

var httpServer = http.createServer(function(req, res) {
  var url = req.url;
  if (url !== '/')
    res.end();
  else
    fs.createReadStream('./app.html').pipe(res);
});

httpServer.listen(9090);
