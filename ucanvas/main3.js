const hostname='ucanvas.io';
const port=443;

var https = require('https');
var fs = require("fs");

var options= {
	ca: fs.readFileSync('/opt/ucanvas2/ucanvas_io.ca-bundle'),
	key: fs.readFileSync('/opt/ucanvas2/ucanvas.key'),
	cert: fs.readFileSync('/opt/ucanvas2/ucanvas_io.crt')
};

var server = https.createServer(options,function (req, res) {
  // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:443');
	
	 // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'https://launch.playcanvas.com:443'); 
	
	// Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'https://launch.playcanvas.com:4568'); 

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

});

server.listen(443);


var io = require('socket.io')({
	transports: ['websocket'],
});
io.listen(server);


var clients = {};
var rooms = ['Lobby'];

var packageIds = [];
var packageVectors = [];
var packageParents = [];

var uPlayers= new Array(30);

var unityId="yeah";

var lastPackage;

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
	if(data!="UNITY-SERVER"){socket.username=data;}
	else{socket.username=data;}
	socket.room = 'Lobby';
    socket.join('Lobby');
	//io.sockets["in"]('Lobby').emit('updatechat', updatechatMsg('System', 'System', username + ' have connected to Lobby'));
    console.log(socket.username + "" + socket.id + " >>> In >>> " + socket.room);
	
	if(data!="UNITY-SERVER"){
		socket.emit('welcome',packageIds, packageParents);
		if(clients["UNITY-SERVER"]){
			io.sockets.connected[clients["UNITY-SERVER"].socket].emit('newPlayer', {id: socket.id});
		}
		//io.to(clients[unityId]).emit('newPlayer', ""+socket.id);
		console.log(unityId);
		console.log(socket.id);
	}
	else{
		unityId=socket.id;
		packageIds=[];
		packageVectors=[];
		packageParents=[];
	}
  });
  
  
  
  socket.on('playerId', function(data,data2){
	  uPlayers[parseInt(data2)]=data;
  });
  
  
  socket.on('playerJoined', function(data,data2){
	  io.sockets.connected[uPlayers[parseInt(data)]].emit('playerJoined', data2);
	  console.log("Player Joined");
  });
  
  
  socket.on('playerUpdate', function(data,data2){
	
	//PACKAGE FORMAT: ID,POSX,POSY,POSZ,ROTX,ROTY,ROTZ,SCLX,SCLY,SCLZ | ID2,POSX2,POSY2,POSZ2,ROTX2,....
	var filter=data2.split(",");
	var b=0;
	var counter=0;
	while(b<filter.length){
		if(parseInt(filter[b])=== 1){ counter+=1; }
		b++;
	}
    if (io.sockets.connected[uPlayers[parseInt(data)]]){
		
        //console.log(packageVectors.length);
		//Cada Float32 ocupa 4 bytes
		var bufArr = new ArrayBuffer((counter*11)*4); 
        var bufView = new Float32Array(bufArr);
		
		//Cada Int16 ocupa 2 bytes
		var bufArr2 = new ArrayBuffer((counter)*2); 
        var bufView2 = new Uint16Array(bufArr2);
		
        var i = 0;
		var e = 0;

		
        while(e<packageIds.length){
            //var xyz = players[i].split(",");
				if(parseInt(filter[e])===1){
				//ID
				
				//bufView2[i]=parseInt(packageIds[i].substring(0,4));
				bufView2[i]=e;
				//console.log(parseInt(packageIds[i].substring(0,4)));
				
				//Posiçao
            	bufView[i*11]=packageVectors[e*11];
            	bufView[i*11+1]=packageVectors[e*11+1];
            	bufView[i*11+2]=packageVectors[e*11+2];
				
				//Rotacao
				bufView[i*11+3]=packageVectors[e*11+3];
            	bufView[i*11+4]=packageVectors[e*11+4];
            	bufView[i*11+5]=packageVectors[e*11+5];
				bufView[i*11+6]=packageVectors[e*11+6];
				
				//Escala
				bufView[i*11+7]=packageVectors[e*11+7];
            	bufView[i*11+8]=packageVectors[e*11+8];
            	bufView[i*11+9]=packageVectors[e*11+9];
				
				//Tempo no servidor
				bufView[i*11+10]=packageVectors[e*11+10];
				
				i++;
				}
            e++;
		}		
		//console.log(packageVectors.length);
		io.sockets.connected[uPlayers[parseInt(data)]].emit("ucUpdate", bufArr2, bufArr);
    } 
	else {
      console.log("User does not exist: " + data); 
	  if(clients["UNITY-SERVER"]){io.sockets.connected[clients["UNITY-SERVER"].socket].emit('udisconnect', {id: parseInt(data)});}
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
			console.log("User " + name + " " + socket.id + " disconnected");
  			delete clients[name];
  			break;
  		}
		var i=0;
		while(i<uPlayers.length){
			if(socket.id+""===uPlayers[i]){
				if(clients["UNITY-SERVER"]){io.sockets.connected[clients["UNITY-SERVER"].socket].emit('udisconnect', {id: i});}	
			}
			i++;
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

function setPackageValue2(value, id){
	packageVectors[id]=value;
	//console.log(packageVectors);
}

function setPackageValue(value, id){
	var xy = value.split(",");
	var yz = id.split(",");
	var i=0;
	for(var cc in yz) {
  		setPackageValue2(xy[i],cc);
		i++;
  	}
	//console.log(packageVectors);
}