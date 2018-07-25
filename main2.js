var io = require('socket.io')({
	transports: ['websocket'],
});
io.attach(4567);

var usernames = {};
var socketids = [];
var nPlayers = 1;

var rooms = ['Lobby'];

io.sockets.on('connection', function(socket) {

    socket.on('userInit', function(username) {
        socket.username = username; 
		socket.room = 'Lobby';
        usernames[socket.id] = username; 
        socket.join('Lobby');
		console.log(socket.id);
        //io.sockets["in"]('Lobby').emit('updatechat', updatechatMsg('System', 'System', username + ' have connected to Lobby'));
        console.log(socket.username + " >>> In >>> " + socket.room);
        //io.sockets["in"](socket.room).emit('updatechat', updatechatMsg(socket.id, username, username + ' has connected to this room'));
       // io.sockets.emit('updaterooms', {'id': socket.id ,'rooms':rooms, 'current_room':socket.room, 'room_information': io.sockets.adapter.rooms[socket.room] });
        //socket.emit('updaterooms', rooms, 'Lobby');
    });

    socket.on('entityPos', function(msg) {

        var players = msg.split("|");
		console.log(msg);
        var bufArr = new ArrayBuffer((players.length-1)*12);
        var bufView = new Float32Array(bufArr);
        var i = 0;

        while(i<players.length-1){
            var xyz = players[i].split(",");
            console.log(xyz[2]);
            	bufView[i*3]=1 * xyz[0];
            	bufView[i*3+1]=1* xyz[1];
            	bufView[i*3+2]=1* xyz[2];
            i++;
         }
         	socket.username = "UNITY-SERVER";
         	usernames[socket.id] = "UNITY-SERVER"; 
         	socket.room = 'Lobby';
         	socket.join('Lobby');
            io.sockets["in"](socket.room).emit('playersPos', bufArr);
            console.log(usernames[socket.id] + "'s Position X: " + bufView[2]);

     });


     socket.on('posXy', function(msg) {
        console.log(usernames[socket.id] + "'s Position X: " + msg);
        io.sockets["in"](socket.room).emit('posX', updatechatMsg(socket.id, usernames[socket.id], msg));
    });
    socket.on('posY', function(msg) {
        console.log(usernames[socket.id] + "'s Position Y: " + msg);
        io.sockets["in"](socket.room).emit('updatechat', updatechatMsg(socket.id, usernames[socket.id], msg));
    });
    socket.on('posZ', function(msg) {
        console.log(usernames[socket.id] + "'s Position Z: " + msg);
        io.sockets["in"](socket.room).emit('updatechat', updatechatMsg(socket.id, usernames[socket.id], msg));
    });


 });


function updatechatMsg(id, username,  msg){
    return {'id':id,'username': username ,'msg':msg};
}
