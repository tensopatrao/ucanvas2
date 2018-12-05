

var APP = {

	Player: function () {

		var loader = new THREE.ObjectLoader();
		//var container, stats, controls;
		var camera, scene, renderer, light;
		var clock = new THREE.Clock();
		var mixers = [];
		
		var container;

		var events = {};

		var dom = document.createElement( 'div' );

		this.dom = dom;

		this.width = 500;
		this.height = 500;

		this.load = function () {
			
			if ( WEBGL.isWebGLAvailable() === false ) {
				document.body.appendChild( WEBGL.getWebGLErrorMessage() );
			}
			
			container = document.createElement( 'div' );
			document.body.appendChild( container );

			renderer = new THREE.WebGLRenderer( { antialias: true } );
			renderer.setClearColor( 0x000000 );
			renderer.setPixelRatio( window.devicePixelRatio );
			

			renderer.gammaInput = true;
			renderer.gammaOutput = true;
			renderer.shadowMap.enabled = true;
			
			scene = new THREE.Scene();
			scene.background = new THREE.Color( 0xa0a0a0 );
			scene.fog = new THREE.Fog( 0xa0a0a0, 200, 1000 );
			
			camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
			camera.position.set( 100, 200, 300 );
			
			light = new THREE.HemisphereLight( 0xffffff, 0x444444 );
			light.position.set( 0, 200, 0 );
			scene.add( light );
			
			var loader = new THREE.FBXLoader();
				loader.load( 'app/models/LORI_BOD.fbx', function ( object ) {
					object.mixer = new THREE.AnimationMixer( object );
					mixers.push( object.mixer );
					var action = object.mixer.clipAction( object.animations[ 0 ] );
					action.play();
					object.traverse( function ( child ) {
						if ( child.isMesh ) {
							child.castShadow = true;
							child.receiveShadow = true;
						}
					} );
					scene.add( object );
				} );
			
			container.appendChild( renderer.domElement );


		};

		this.setCamera = function ( value ) {

			camera = value;
			camera.aspect = this.width / this.height;
			camera.updateProjectionMatrix();

			if ( renderer.vr.enabled ) {

				dom.appendChild( WEBVR.createButton( renderer ) );

			}

		};

		this.setScene = function ( value ) {

			scene = value;

		};

		this.setSize = function ( width, height ) {

			this.width = width;
			this.height = height;

			if ( camera ) {

				camera.aspect = this.width / this.height;
				camera.updateProjectionMatrix();

			}

			if ( renderer ) {

				renderer.setSize( width, height );

			}

		};

		function dispatch( array, event ) {

			for ( var i = 0, l = array.length; i < l; i ++ ) {

				array[ i ]( event );

			}

		}

		var time, prevTime;

		function animate() {

			time = performance.now();

			renderer.render( scene, camera );

			prevTime = time;

		}

		this.play = function () {

			prevTime = performance.now();

			renderer.setAnimationLoop( animate );

		};

		this.stop = function () {

			

			renderer.setAnimationLoop( null );

		};

		this.dispose = function () {

			while ( dom.children.length ) {

				dom.removeChild( dom.firstChild );

			}

			renderer.dispose();

			camera = undefined;
			scene = undefined;
			renderer = undefined;

		};

		//

		function onDocumentKeyDown( event ) {

			dispatch( events.keydown, event );

		}

		function onDocumentKeyUp( event ) {

			dispatch( events.keyup, event );

		}

		function onDocumentMouseDown( event ) {

			dispatch( events.mousedown, event );

		}

		function onDocumentMouseUp( event ) {

			dispatch( events.mouseup, event );

		}

		function onDocumentMouseMove( event ) {

			dispatch( events.mousemove, event );

		}

		function onDocumentTouchStart( event ) {

			dispatch( events.touchstart, event );

		}

		function onDocumentTouchEnd( event ) {

			dispatch( events.touchend, event );

		}

		function onDocumentTouchMove( event ) {

			dispatch( events.touchmove, event );

		}

	}

};
