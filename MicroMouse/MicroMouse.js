//////////////////////////////////////////////////////////////////
//																//
//  Tiago Madeira 76321 & Diogo Duarte 77645 - November 2017	//
//																//
//////////////////////////////////////////////////////////////////


//----------------------------------------------------------------
//
// Global Variables
//

// WebGL context
var gl = null; 

var shaderProgram = null;
var triangleVertexPositionBuffer = null;
var triangleVertexNormalBuffer = null;

// The GLOBAL transformation parameters
var globalAngleYY = 0.0;
var globalTz = 0.0;

// The local transformation parameters

// The translation vector
var tx = 0.0;
var ty = 0.0;
var tz = 0.0;

// The rotation angles in degrees
var angleXX = 0.0;
var angleYY = 0.0;
var angleZZ = 0.0;

// The scaling factors
var sx = 1;
var sy = 1;
var sz = 1;

// Global Animation controls
var globalRotationYY_ON = 1;
var globalRotationYY_DIR = 1;
var globalRotationYY_SPEED = 1;

// Local Animation controls
var rotationXX_ON = 1;
var rotationXX_DIR = 1;
var rotationXX_SPEED = 1;
var rotationYY_ON = 1;
var rotationYY_DIR = 1;
var rotationYY_SPEED = 1;
var rotationZZ_ON = 1;
var rotationZZ_DIR = 1;
var rotationZZ_SPEED = 1;

// To allow choosing the way of drawing the model triangles
var primitiveType = null;

// The viewer position
var pos_Viewer = [ 0.0, 0.0, 0.0, 1.0 ];

// Model Material Features

// Ambient coef.
var kAmbi = [ 0.2, 0.2, 0.2 ];

// Diffuse coef.
var kDiff = [ 0.7, 0.7, 0.7 ];

// Specular coef.
var kSpec = [ 0.7, 0.7, 0.7 ];

// Phong coef.
var nPhong = 100;

// Initial model has just ONE TRIANGLE
var vertices = [

		// FRONTAL TRIANGLE

		-1.0, -1.0,  1.0,

		 1.0, -1.0,  1.0,

		 1.0,  1.0,  1.0,
];

var normals = [

		// FRONTAL TRIANGLE

		 0.0,  0.0,  1.0,

		 0.0,  0.0,  1.0,

		 0.0,  0.0,  1.0,
];


//----------------------------------------------------------------------------
//
// Count the number of frames per second (fps)
//

var elapsedTime = 0;
var frameCount = 0;
var lastfpsTime = new Date().getTime();;

function countFrames() {

   var now = new Date().getTime();
   frameCount++;

   elapsedTime += (now - lastfpsTime);

   lastfpsTime = now;

   if(elapsedTime >= 1000) {

       fps = frameCount;

       frameCount = 0;

       elapsedTime -= 1000;

	   document.getElementById('fps').innerHTML = 'fps:' + fps;
   }
}


//----------------------------------------------------------------------------
//
// The WebGL code
//

//----------------------------------------------------------------------------
//
//  Rendering
//

// Handling the Vertex Coordinates and the Vertex Normal Vectors

function initBuffers() {

	// Vertex Coordinates
	triangleVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	triangleVertexPositionBuffer.itemSize = 3;
	triangleVertexPositionBuffer.numItems = vertices.length / 3;

	// Associating to the vertex shader
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
			triangleVertexPositionBuffer.itemSize,
			gl.FLOAT, false, 0, 0);

	// Vertex Normal Vectors
	triangleVertexNormalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexNormalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
	triangleVertexNormalBuffer.itemSize = 3;
	triangleVertexNormalBuffer.numItems = normals.length / 3;

	// Associating to the vertex shader
	gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute,
			triangleVertexNormalBuffer.itemSize,
			gl.FLOAT, false, 0, 0);
}

//----------------------------------------------------------------------------

//  Drawing the model

function drawModel( angleXX, angleYY, angleZZ,
					sx, sy, sz,
					tx, ty, tz,
					mvMatrix,
					primitiveType ) {

	// The global model transformation is an input
	// Concatenate with the particular model transformations
    // Transformation order is important
	mvMatrix = mult( mvMatrix, translationMatrix( tx, ty, tz ) );

	mvMatrix = mult( mvMatrix, rotationZZMatrix( angleZZ ) );

	mvMatrix = mult( mvMatrix, rotationYYMatrix( angleYY ) );

	mvMatrix = mult( mvMatrix, rotationXXMatrix( angleXX ) );

	mvMatrix = mult( mvMatrix, scalingMatrix( sx, sy, sz ) );

	// Passing the Model View Matrix to apply the current transformation
	var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");

	gl.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));

	// Associating the data to the vertex shader
	// This can be done in a better way !!
	// Vertex Coordinates and Vertex Normal Vectors

	initBuffers();

	// Material properties
	gl.uniform3fv( gl.getUniformLocation(shaderProgram, "k_ambient"),
		flatten(kAmbi) );

    gl.uniform3fv( gl.getUniformLocation(shaderProgram, "k_diffuse"),
        flatten(kDiff) );

    gl.uniform3fv( gl.getUniformLocation(shaderProgram, "k_specular"),
        flatten(kSpec) );

	gl.uniform1f( gl.getUniformLocation(shaderProgram, "shininess"),
		nPhong );

    // Light Sources
	var numLights = 2;

	gl.uniform1i( gl.getUniformLocation(shaderProgram, "numLights"),
		numLights );

	//Light Sources
	for(var i = 0; i < lightSources.length; i++ )
	{
		gl.uniform4fv( gl.getUniformLocation(shaderProgram, "allLights[" + String(i) + "].position"),
			flatten(lightSources[i].getPosition()) );

		gl.uniform3fv( gl.getUniformLocation(shaderProgram, "allLights[" + String(i) + "].intensities"),
			flatten(lightSources[i].getIntensity()) );
    }

	// Drawing
	// primitiveType allows drawing as filled triangles / wireframe / vertices

	if( primitiveType == gl.LINE_LOOP ) {

		// To simulate wireframe drawing!
		// No faces are defined! There are no hidden lines!
		// Taking the vertices 3 by 3 and drawing a LINE_LOOP

		var i;
		for( i = 0; i < triangleVertexPositionBuffer.numItems / 3; i++ ) {
			gl.drawArrays( primitiveType, 3 * i, 3 );
		}
	}
	else {
		gl.drawArrays(primitiveType, 0, triangleVertexPositionBuffer.numItems);
	}
}

//----------------------------------------------------------------------------

//  Drawing the 3D scene

function drawScene() {

	var pMatrix;
	var mvMatrix = mat4();

	// Clearing the frame-buffer and the depth-buffer
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Computing the Projection Matrix
	// A standard view volume.
	// Viewer is at (0,0,0)
	// Ensure that the model is "inside" the view volume
	pMatrix = perspective( 45, 1, 0.05, 15 );

	// Global transformation
	globalTz = -2.5;

	//The viewer is on (0,0,0)
	pos_Viewer[0] = pos_Viewer[1] = pos_Viewer[2] = 0.0;
	pos_Viewer[3] = 1.0;

	// TODO - Allow the user to control the size of the view volume

	// Passing the Projection Matrix to apply the current projection
	var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	gl.uniformMatrix4fv(pUniform, false, new Float32Array(flatten(pMatrix)));

	// Passing the viewer position to the vertex shader
	gl.uniform4fv( gl.getUniformLocation(shaderProgram, "viewerPosition"),
        flatten(pos_Viewer) );

	// GLOBAL TRANSFORMATION FOR THE WHOLE SCENE
	mvMatrix = translationMatrix( 0, 0, globalTz );

	// Updating the position of the light sources, if required

	// for each light source
	for(var i = 0; i < lightSources.length; i++ )
	{
		if( lightSources[i].isOff() ) {

			continue;
		}

		// Animating the light source, if defined

		var lightSourceMatrix = mat4();

		// TODO COMPLETE THE CODE FOR THE OTHER ROTATION AXES

		if( lightSources[i].isRotYYOn() )
		{
			lightSourceMatrix = mult(
					lightSourceMatrix,
					rotationYYMatrix( lightSources[i].getRotAngleYY() ) );
		}

		// Passing the Light Souree Matrix to apply
		var lsmUniform = gl.getUniformLocation(shaderProgram, "allLights["+ String(i) + "].lightSourceMatrix");
		gl.uniformMatrix4fv(lsmUniform, false, new Float32Array(flatten(lightSourceMatrix)));
	}

	// Instantianting the current model
	drawModel( angleXX, angleYY, angleZZ,
	           sx, sy, sz,
	           tx, ty, tz,
	           mvMatrix,
	           primitiveType );

	// Counting the frames
	countFrames();
}

//----------------------------------------------------------------------------
//
// Animation
//

// Updating transformation parameters

var lastTime = 0;

function animate() {

	var timeNow = new Date().getTime();

	if( lastTime != 0 ) {

		var elapsed = timeNow - lastTime;

		// Global rotation

		if( globalRotationYY_ON ) {

			globalAngleYY += globalRotationYY_DIR * globalRotationYY_SPEED * (90 * elapsed) / 1000.0;
	    }

		// Local rotations

		if( rotationXX_ON ) {

			angleXX += rotationXX_DIR * rotationXX_SPEED * (90 * elapsed) / 1000.0;
	    }

		if( rotationYY_ON ) {

			angleYY += rotationYY_DIR * rotationYY_SPEED * (90 * elapsed) / 1000.0;
	    }

		if( rotationZZ_ON ) {

			angleZZ += rotationZZ_DIR * rotationZZ_SPEED * (90 * elapsed) / 1000.0;
	    }

		// Rotating the light sources

		for(var i = 0; i < lightSources.length; i++ )
	    {
			if( lightSources[i].isRotYYOn() ) {

				var angle = lightSources[i].getRotAngleYY() + lightSources[i].getRotationSpeed() * (90 * elapsed) / 1000.0;

				lightSources[i].setRotAngleYY( angle );
			}
		}
}

	lastTime = timeNow;
}


//----------------------------------------------------------------------------

// Timer

function tick() {

	requestAnimFrame(tick);

	resizeCanvas(gl.canvas);
	gl.viewport(0,0, gl.canvas.width, gl.canvas.height);

    handleKeys();

	drawScene();

	//animate();
}


//----------------------------------------------------------------------------

// Resize Canvas

function resizeCanvas(canvas) {
	// Lookup the size the browser is displaying the canvas.
	var displayWidth  = canvas.clientWidth;
	var displayHeight = canvas.clientHeight;

	// Check if the canvas is not the same size.
	if (canvas.width  != displayWidth ||
	  canvas.height != displayHeight) {

    // Make the canvas the same size
    canvas.width  = displayWidth;
    canvas.height = displayHeight;
  }
}

//----------------------------------------------------------------------------
//
//  User Interaction
//

function outputInfos(){

}

//----------------------------------------------------------------------------

// Handling keyboard events

var currentlyPressedKeys = {};

function handleKeys() {

	// Page Up
	if (currentlyPressedKeys[33]) {
		//Zoom out
		sx *= 0.9;
		sz = sy = sx;
	}
	// Page Down
	if (currentlyPressedKeys[34]) {
		//Zoom in
		sx *= 1.1;
		sz = sy = sx;
	}
	// W or w
	if (currentlyPressedKeys[87] || currentlyPressedKeys[119]) {
		// go up
		ty += 0.01;
	}
	// A or a
	if (currentlyPressedKeys[65] || currentlyPressedKeys[97]) {
		// go left
		tx -= 0.01;
	}
	// S or s
	if (currentlyPressedKeys[83] || currentlyPressedKeys[115]) {
		// go down
		ty -= 0.01;
	}
	// D or d
	if (currentlyPressedKeys[68] || currentlyPressedKeys[100]) {
		// go right
		tx += 0.01;
	}
}

//----------------------------------------------------------------------------

// Handling mouse events

var mouseDown = false;

var lastMouseX = null;

var lastMouseY = null;

function handleMouseDown(event) {

    mouseDown = true;

    lastMouseX = event.clientX;

    lastMouseY = event.clientY;
}

function handleMouseUp(event) {

    mouseDown = false;
}

function handleMouseMove(event) {

    if (!mouseDown) {

      return;
    }

    // Rotation angles proportional to cursor displacement

    var newX = event.clientX;

    var newY = event.clientY;

    var deltaX = newX - lastMouseX;

    angleYY += radians( 10 * deltaX  )

    var deltaY = newY - lastMouseY;

    angleXX += radians( 10 * deltaY  )

    lastMouseX = newX

    lastMouseY = newY;
  }

//----------------------------------------------------------------------------

function setEventListeners( canvas ){
    // Mouse + Keyboard Events
    canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;
    // Handling the keyboard
    function handleKeyDown(event) {
        currentlyPressedKeys[event.keyCode] = true;
    }
    function handleKeyUp(event) {
        currentlyPressedKeys[event.keyCode] = false;
    }
	document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;

	// http://stackoverflow.com/questions/23331546/how-to-use-javascript-to-read-local-text-file-and-read-line-by-line
	document.getElementById("file").onchange = function(){
		var file = this.files[0];
		var reader = new FileReader();
		reader.onload = function( progressEvent ){
			// Entire file read as a string
			// The tokens/values in the file

			// Separation between values is 1 or mode whitespaces
			var tokens = this.result.split(/\s\s*/);

			// Array of values; each value is a string
			var numVertices = parseInt( tokens[0] );

			// For every vertex we have 3 floating point values
			var i, j;
			var aux = 1;
			var newVertices = [];

			for( i = 0; i < numVertices; i++ ) {
				for( j = 0; j < 3; j++ ) {
					newVertices[ 3 * i + j ] = parseFloat( tokens[ aux++ ] );
				}
			}
			// Assigning to the current model
			vertices = newVertices.slice();

			//Computing the triangle normal vector for every vertex
			computeVertexNormals( vertices, normals );

			// To render the model just read
			initBuffers();

			// Reset the transformations
			tx = ty = tz = 0.0;
			angleXX = angleYY = angleZZ = 0.0;
			sx = sy = sz = 1;
		};

		// Entire file read as a string
		reader.readAsText( file );
	}
	// Dropdown list
	var list = document.getElementById("rendering-mode-selection");
	list.addEventListener("click", function(){

		// Getting the selection
		var mode = list.selectedIndex;

		switch(mode){

			case 0 : primitiveType = gl.TRIANGLES;
				break;

			case 1 : primitiveType = gl.LINE_LOOP;
				break;

			case 2 : primitiveType = gl.POINTS;
				break;
		}
	});

	document.getElementById("reset-button").onclick = function(){

		// The initial values

		tx = 0.0;

		ty = 0.0;

		tz = 0.0;

		angleXX = 0.0;

		angleYY = 0.0;

		angleZZ = 0.0;

		sx = 1;

		sy = 1;

		sz = 1;

		rotationXX_ON = 0;

		rotationXX_DIR = 1;

		rotationXX_SPEED = 1;

		rotationYY_ON = 0;

		rotationYY_DIR = 1;

		rotationYY_SPEED = 1;

		rotationZZ_ON = 0;

		rotationZZ_DIR = 1;

		rotationZZ_SPEED = 1;
	};
}

//----------------------------------------------------------------------------
//
// WebGL Initialization
//

function initWebGL( canvas ) {
	try {

		// Create the WebGL context
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

		// DEFAULT: The viewport occupies the whole canvas

		// DEFAULT: The viewport background color is WHITE

		// Drawing the triangles defining the model
		primitiveType = gl.TRIANGLES;

		// DEFAULT: Face culling is DISABLED

		// Enable FACE CULLING
		gl.enable( gl.CULL_FACE );

		// DEFAULT: The BACK FACE is culled!

		// Enable DEPTH-TEST
		gl.enable( gl.DEPTH_TEST );

	} catch (e) {
	}
	if (!gl) {
		alert("Could not initialise WebGL, sorry! :-(");
	}
}

//----------------------------------------------------------------------------

function runWebGL() {

	var canvas = document.getElementById("my-canvas");
	initWebGL( canvas );
	shaderProgram = initShaders( gl );
	setEventListeners( canvas );
	initBuffers();
	tick();		// Timer that controls the rendering / animation
	outputInfos();
}


