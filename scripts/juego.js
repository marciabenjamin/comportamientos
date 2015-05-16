window.onload = function() {

	var juego = new Phaser.Game(720,480,Phaser.AUTO,'juego', {
		preload: preload,
		create: create,
		update: update
	});
	
	function preload() {
		juego.load.image('fondo','assets/fondo.png');
		juego.load.image('nave','assets/nave.png');
		juego.load.image('ovni','assets/ovni.png');
	}
	
	var nave,ovni;
	var mensaje, infoMetodo;
	var barra;	
	function create() {
		juego.physics.startSystem(Phaser.Physics.ARCADE);
		juego.add.image(0,0,'fondo');
		
		//nave.--------------
		nave = juego.add.sprite(75,400,'nave');
		nave.anchor.setTo(.5,.5);
		juego.physics.arcade.enable(nave);
		nave.RADIO = 100;
		nave.MAX_VELOCIDAD = 250;
		nave.MAX_ROTACION = Math.PI/2;
		nave.outOfBoundsKill = false;
		
		//ovni.--------------
		ovni = juego.add.sprite(360,240,'ovni');
		ovni.anchor.setTo(.5,.5);
		juego.physics.arcade.enable(ovni);
		ovni.RADIO = 100;
		ovni.MAX_VELOCIDAD = 250;
		ovni.MAX_ROTACION = Math.PI/2;
		ovni.outOfBoundsKill = false;
		
		barra = juego.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		barra.onDown.add(function() {
			comportamiento = (comportamiento+1)%5;//no se nota bien la direccion del ovni
		})
		
		mensaje = juego.add.text(20,450,'Presionar barra para cambiar método.',{fontSize: '10px', fill: '#fff'});
		infoMetodo = juego.add.text(20,460,'', {fontSize: '10px', fill: '#fff'});
	}
	
	var comportamiento = 0;
	function update() {
		validarPosicion(nave);
		validarPosicion(ovni);
		
		switch (comportamiento) {
			case 0:
				infoMetodo.setText('seek. nave -> ovni');
				buscar(nave,ovni); 
				break;
			case 1:
				infoMetodo.setText('flee. nave -> ovni');
				huir(nave,ovni);
				break;
			case 2:
				infoMetodo.setText('wander. nave');
				deambular(nave);
				break;
			case 3:
				infoMetodo.setText('arrive. nave -> ovni');
				arribar(nave,ovni);
				break;
			case 4:
				infoMetodo.setText('pursuit. nave -> ovni');
				perseguir(nave,ovni);
				break;
				
			case 5:
				infoMetodo.setText('seek. ovni -> nave');
				buscar(ovni,nave); 
				break;
			case 6:
				infoMetodo.setText('flee. ovni -> nave');
				huir(ovni,nave);
				break;
			case 7:
				infoMetodo.setText('wander. ovni');
				deambular(ovni);
				break;
			case 8:
				infoMetodo.setText('arrive. ovni -> nave');
				arribar(ovni,nave);
				break;
			case 9:
				infoMetodo.setText('pursuit. ovni -> nave');
				perseguir(ovni,nave);
				break;

		}
	}
	
	
	function validarPosicion (objeto) {
		if (objeto.position.x < 0) {
			objeto.x = juego.world.bounds.width;
		}
		if (objeto.position.y < 0) {
			objeto.y = juego.world.bounds.height;
		}
		if (objeto.position.x > juego.world.bounds.width) {
			objeto.x = 0;
		}
		if (objeto.position.y > juego.world.bounds.height) {
			objeto.y = 0;
		}
	}
	
	function getDireccion (desde, puntoHasta) {
		var vector = Phaser.Point.subtract(puntoHasta,desde.position);
		vector.normalize();		
		return vector;
	}
	
	function getVelocidad (vector,magnitud) {
		vector.multiply(magnitud,magnitud);
		return vector;
	}
	
	function getFuerza (vector,velocidad) {
		vector = Phaser.Point.subtract(vector,velocidad);
		return vector;
	}
	
	function aplicarFuerza (vehiculo,vector) {
		vehiculo.body.velocity.add(vector.x,vector.y);
	}

	var origen = new Phaser.Point(0,0);
	function alinear (vehiculo) {
		vehiculo.rotation = origen.angle(vehiculo.body.velocity);
	}
	

	
	
	
	
	
	
	
	function seek (vehiculo,destino) {
		var v = getDireccion(vehiculo,destino);
		v = getVelocidad(v,vehiculo.MAX_VELOCIDAD);
		v = getFuerza(v,vehiculo.body.velocity);
		aplicarFuerza(vehiculo,v);
		alinear(vehiculo);
	};
	
	function flee (vehiculo,destino) {
		var v = getDireccion(vehiculo,destino);
		v.multiply(-1,-1);
		v = getVelocidad(v,vehiculo.MAX_VELOCIDAD);
		v = getFuerza(v,vehiculo.body.velocity);
		aplicarFuerza(vehiculo,v);
		alinear(vehiculo);
	}
	
	function rotacionComoVector(rotacion) {
		return new Phaser.Point(Math.cos(rotacion),Math.sin(rotacion));
	}
	
	function wander (vehiculo) {
		var r = randomBinomial();
		var rotacion = vehiculo.rotation + ((vehiculo.rotation + vehiculo.MAX_ROTACION) * r);
		var v = rotacionComoVector(rotacion);
		v.multiply(vehiculo.RADIO,vehiculo.RADIO);
		seek(vehiculo,v);
	}
	
	function randomBinomial () {
		return Math.random() - Math.random();
	}	
	
	function arrive (vehiculo, destino) {
		var distancia = Phaser.Math.distance(vehiculo.position.x,vehiculo.position.y,destino.position.x,destino.position.y);
		if (distancia > destino.RADIO/4) { //no llego
			var desaceleracion = 1;
			if (distancia > destino.RADIO) {//distancia > radio. fuera del radio. va rapido.
				desaceleracion = 1;
			}
			else {
				if (distancia > destino.RADIO/2) {//radio/2 < distancia <= radio. dentro del radio. va a MAX_VEL/2.
					desaceleracion = 2;
				}
				else if (distancia > destino.RADIO/4) {//radio/4 < distancia < radio/2. casi llega. va a MAX_VEL/4.
					desaceleracion = 4;
				}
			}
			var v = getDireccion(vehiculo,destino);
			v = getVelocidad(v,vehiculo.MAX_VELOCIDAD/desaceleracion);
			v = getFuerza(v,vehiculo.body.velocity);
			aplicarFuerza(vehiculo,v);
			alinear(vehiculo);

		}
	}
	 
	
	function pursuit (perseguidor, perseguido) {
		var v = getDireccion(perseguidor,perseguido.position);
		var d = Phaser.Math.distance(0,0,v.x,v.y);
		
		var vel = Phaser.Math.distance(0,0,perseguidor.body.velocity.x,perseguidor.body.velocity.y);
		var prediccion;
		if (vel <= d/10) {//vel <= distancia/maxPrediction
			prediccion = 10;//maxPrediction
		}
		else {
			prediccion = d/vel;
		}
		var posPredecida = new Phaser.Point(perseguido.position.x,perseguido.position.y);		
		posPredecida = posPredecida.add(perseguido.body.velocity.x*prediccion,perseguido.body.velocity.y*prediccion);
		seek(perseguidor,posPredecida);
	}
	
	
	
	
	
	
	
	
	
	
	
	function buscar (vehiculo, objeto) {
		vehiculo.bringToTop();
		seek(vehiculo,objeto.position);
	}
	
	function huir (vehiculo, objeto) {
		vehiculo.bringToTop();
		flee(vehiculo,objeto.position);
	}
	
	function deambular (vehiculo) {
		vehiculo.bringToTop();
		wander(vehiculo);
	}
	
	function perseguir (perseguidor, perseguido) {
		perseguido.bringToTop();
		wander(perseguido);
		pursuit(perseguidor,perseguido);
	}
	
	function arribar (vehiculo, objeto) {
		vehiculo.bringToTop();
		arrive(vehiculo,objeto);
	} 
}
