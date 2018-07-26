const hostname='<ucanvas.io>';
const port='<443>';

var https = require('https');
var fs = require("fs");

var options= {
	ca: fs.readFileSync('/opt/ucanvas2/ucanvas_io.ca-bundle'),
	key: fs.readFileSync('/opt/ucanvas2/ucanvas.key'),
	cert: fs.readFileSync('/opt/ucanvas2/ucanvas_io.crt')
};

https.createServer(options,function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(8000);


var io = require('socket.io')({
	transports: ['websocket'],
});
io.attach(4568);


var clients = {};
var rooms = ['Lobby'];

var packageIds = [];
var packageVectors = [];
var packageParents = [];

io.sockets.on('connection', function (socket) {
	
	/*(function() {
        var oldEmit = socket.emit;
        socket.emit = function() {
            var args = Array.from(arguments);
            setTimeout(() => {
                oldEmit.apply(this, args);
            }, Math.random()*100); 
        };
    })();*/

  socket.on('userInit', function(data) {
	  
    clients[data] = {
      "socket": socket.id,
	  "username": data
    };
	socket.username=data;
	socket.room = 'Lobby';
    socket.join('Lobby');
	//io.sockets["in"]('Lobby').emit('updatechat', updatechatMsg('System', 'System', username + ' have connected to Lobby'));
    console.log(socket.username + " >>> In >>> " + socket.room);
	
	if(data!="UNITY-SERVER"){
		socket.emit('welcome',packageIds, packageParents);
	}
	else{
		packageIds=[];
		packageVectors=[];
		packageParents=[];
	}
  });
  
  socket.on('ucUpdate', function(data){
	
	//PACKAGE FORMAT: ID,POSX,POSY,POSZ,ROTX,ROTY,ROTZ,SCLX,SCLY,SCLZ | ID2,POSX2,POSY2,POSZ2,ROTX2,....
	
    if (clients[data]){
		
        //console.log(packageVectors.length);
		//Cada Float32 ocupa 4 bytes
		var bufArr = new ArrayBuffer((packageVectors.length)*4); 
        var bufView = new Float32Array(bufArr);
		
		//Cada Int16 ocupa 2 bytes
		var bufArr2 = new ArrayBuffer((packageIds.length)*2); 
        var bufView2 = new Uint16Array(bufArr2);
		
        var i = 0;
		

		
        while(i<packageIds.length){
            //var xyz = players[i].split(",");
				
				//ID
				
				bufView2[i]=parseInt(packageIds[i].substring(0,4));
				//console.log(parseInt(packageIds[i].substring(0,4)));
				
				//Posiçao
            	bufView[i*11]=packageVectors[i*11];
            	bufView[i*11+1]=packageVectors[i*11+1];
            	bufView[i*11+2]=packageVectors[i*11+2];
				
				//Rotacao
				bufView[i*11+3]=packageVectors[i*11+3];
            	bufView[i*11+4]=packageVectors[i*11+4];
            	bufView[i*11+5]=packageVectors[i*11+5];
				bufView[i*11+6]=packageVectors[i*11+6];
				
				//Escala
				bufView[i*11+7]=packageVectors[i*11+7];
            	bufView[i*11+8]=packageVectors[i*11+8];
            	bufView[i*11+9]=packageVectors[i*11+9];
				
				//Tempo no servidor
				bufView[i*11+10]=packageVectors[i*11+10];
            i++;
		}		
		
		console.log(packageVectors.length);
      io.sockets.connected[clients[data].socket].emit("ucUpdate", bufArr2, bufArr);
    } 
	else {
      //console.log("User does not exist: " + data); 
    }
  });
  
  socket.on('addPackageID', function(data,data2){
		addPackageID(data,data2);
  });
  
   socket.on('effect', function(data){
		var bufArr2 = new ArrayBuffer(2); 
        var bufView2 = new Uint16Array(bufArr2);
		bufView2[0]=parseInt(data.substring(0,4));
		console.log("EFFECT" + data);
		socket.to(socket.room).emit("effect", bufArr2);
  });
  
    socket.on('setPackageValue', function(data,data2){
		setPackageValue(data,data2);
  });
  
  socket.on('addPackageValue', function(data){
		addPackageValue(data);
  });
  

  //Removing the socket on disconnect
  socket.on('disconnect', function() {
  	for(var name in clients) {
  		if(clients[name].socket === socket.id) {
			console.log("User " + name + " disconnected");
  			delete clients[name];
  			break;
  		}
  	}	
  })

});

function updatechatMsg(id, username,  msg){
    return {'id':id,'username': username ,'msg':msg};
}

function addPackageID(id,ucparent){
	packageIds.push(id);
	console.log(ucparent);
	packageParents.push(ucparent);
}

function addPackageValue(id){
	packageVectors.push(id);
}

function setPackageValue(value, id){
	packageVectors[id]=value;
	//console.log(packageVectors);
}

