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

// Buffers
var cubeVertexPositionBuffer = null;
var cubeVertexColorBuffer = null;
var cubeVertexIndexBuffer = null;

// The GLOBAL transformation parameters
var globalAngleXX = 0.0;
var globalAngleYY = 0.0;
var globalTz = 0.0;
var globalSz = 1;
var globalSy = 1;
var globalSx = 1;

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

// Dictionary with models
var models = null;

var vertices = [
        -0.058333,  0.000000,  0.004167,
         0.058333,  0.000000,  0.004167,
         0.058333,  0.034722,  0.004167,
        -0.058333,  0.034722,  0.004167,

         0.058333,  0.000000,  0.004167,
         0.058333,  0.000000, -0.004167,
         0.058333,  0.034722, -0.004167,
         0.058333,  0.034722,  0.004167,

        -0.058333,  0.000000, -0.004167,
        -0.058333,  0.034722, -0.004167,
         0.058333,  0.034722, -0.004167,
         0.058333,  0.000000, -0.004167,

        -0.058333,  0.000000, -0.004167,
        -0.058333,  0.000000,  0.004167,
        -0.058333,  0.034722,  0.004167,
        -0.058333,  0.034722, -0.004167,

        -0.058333,  0.034722, -0.004167,
        -0.058333,  0.034722,  0.004167,
         0.058333,  0.034722,  0.004167,
         0.058333,  0.034722, -0.004167,

        -0.058333,  0.000000,  0.004167,
        -0.058333,  0.000000, -0.004167,
         0.058333,  0.000000, -0.004167,
         0.058333,  0.000000,  0.004167
];

// Vertex indices defining the triangles

var cubeVertexIndices = [

            0, 1, 2,      0, 2, 3,    // Front face

            4, 5, 6,      4, 6, 7,    // Back face

            8, 9, 10,     8, 10, 11,  // Top face

            12, 13, 14,   12, 14, 15, // Bottom face

            16, 17, 18,   16, 18, 19, // Right face

            20, 21, 22,   20, 22, 23  // Left face
];

// And their colour

var colors = [

		 // FRONT FACE - RED

		 1.00,  0.00,  0.00,

		 1.00,  0.00,  0.00,

		 1.00,  0.00,  0.00,

		 1.00,  0.00,  0.00,

		 // BACK FACE - BLACK

		 0.00,  0.00,  0.00,

		 0.00,  0.00,  0.00,

		 0.00,  0.00,  0.00,

		 0.00,  0.00,  0.00,

		 // TOP FACE -

		 1.00,  1.00,  0.00,

		 1.00,  1.00,  0.00,

		 1.00,  1.00,  0.00,

		 1.00,  1.00,  0.00,


		 // BOTTOM FACE

		 0.00,  1.00,  1.00,

		 0.00,  1.00,  1.00,

		 0.00,  1.00,  1.00,

		 0.00,  1.00,  1.00,


		 // RIGHT FACE - BLUE

		 0.00,  0.00,  1.00,

		 0.00,  0.00,  1.00,

		 0.00,  0.00,  1.00,

		 0.00,  0.00,  1.00,


		 // LEFT FACE - GREEN

		 0.00,  1.00,  0.00,

		 0.00,  1.00,  0.00,

		 0.00,  1.00,  0.00,

		 0.00,  1.00,  0.00,
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

// Handling the Vertex and the Color Buffers

function initBuffers(model) {

	// Coordinates

	cubeVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model['vertices']), gl.STATIC_DRAW);
	cubeVertexPositionBuffer.itemSize = 3;
	cubeVertexPositionBuffer.numItems = model['vertices'].length / 3;
                                        // models['?']['vertices'].length

	// Colors

	cubeVertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	cubeVertexColorBuffer.itemSize = 3;
	cubeVertexColorBuffer.numItems = model['vertices'].length / 3;

	// Vertex indices

    cubeVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model['faces']), gl.STATIC_DRAW);
    cubeVertexIndexBuffer.itemSize = 1;
    cubeVertexIndexBuffer.numItems = model['faces'].length;
}

//----------------------------------------------------------------------------

//  Drawing the model

function drawModel( angleXX, angleYY, angleZZ,
					sx, sy, sz,
					tx, ty, tz,
					mvMatrix,
					primitiveType ) {

    // Pay attention to transformation order !!

	mvMatrix = mult( mvMatrix, translationMatrix( tx, ty, tz ) );

	mvMatrix = mult( mvMatrix, rotationZZMatrix( angleZZ ) );

	mvMatrix = mult( mvMatrix, rotationYYMatrix( angleYY ) );

	mvMatrix = mult( mvMatrix, rotationXXMatrix( angleXX ) );

	mvMatrix = mult( mvMatrix, scalingMatrix( sx, sy, sz ) );

	// Passing the Model View Matrix to apply the current transformation

	var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");

	gl.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));

    // Passing the buffers

	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);

    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);

    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, cubeVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);

	// Drawing the triangles --- NEW --- DRAWING ELEMENTS

	gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

//----------------------------------------------------------------------------

//  Drawing the 3D scene

function drawScene() {

	var pMatrix;
	var mvMatrix = mat4();

	// Clearing the frame-buffer and the depth-buffer
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // HERE

	// Computing the Projection Matrix
	// A standard view volume.
	// Viewer is at (0,0,0)
	// Ensure that the model is "inside" the view volume
	pMatrix = perspective( 45, 1, 0.05, 15 );

	//The viewer is on (0,0,0)
	pos_Viewer[0] = pos_Viewer[1] = pos_Viewer[2] = 0.0;
	pos_Viewer[3] = 1.0;

	// TODO - Allow the user to control the size of the view volume

	// Passing the Projection Matrix to apply the current projection
	var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	gl.uniformMatrix4fv(pUniform, false, new Float32Array(flatten(pMatrix)));

	// Passing the viewer position to the vertex shader
    gl.uniform4fv( gl.getUniformLocation(shaderProgram, "viewerPosition"), flatten(pos_Viewer) );

	// Global transformation
	globalTz = -2.5;

	// GLOBAL TRANSFORMATION FOR THE WHOLE SCENE
	mvMatrix = translationMatrix(0, 0, globalTz );
	mvMatrix = mult( mvMatrix, rotationYYMatrix( globalAngleYY ) );
	mvMatrix = mult( mvMatrix, rotationXXMatrix( globalAngleXX ) );
	mvMatrix = mult( mvMatrix, scalingMatrix( globalSx, globalSy, globalSz ) );

	// Updating the position of the light sources, if required

    // Drawing Objects
    drawEmptyMap(mvMatrix);
    drawMap(mvMatrix);
    drawMouse(mvMatrix);
    drawMarkers(mvMatrix);

	// Counting the frames
	countFrames();
}

function drawEmptyMap(mvMatrix){

    // Drawing the floor
    initBuffers(models['floor']);

	// Instantianting the current model
	drawModel( angleXX, angleYY, angleZZ,
	           sx, sy, sz,
	           tx, ty, tz,
	           mvMatrix,
	           primitiveType );


    // Drawing all the posts
    initBuffers(models['post']);

    for(var xx = -8; xx <= 8; xx++)
        for(var zz = -8; zz <= 8; zz++){
            // Instantianting the current model
            drawModel( angleXX, angleYY, angleZZ,
                       sx, sy, sz,
                       tx + (xx * 0.1245), ty, tz + (zz * 0.1245),
                       mvMatrix,
                       primitiveType );
    }
}

function drawMap(mvMatrix){}

function drawMouse(mvMatrix){}

function drawMarkers(mvMatrix){}

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
        /*
		for(var i = 0; i < lightSources.length; i++ )
	    {
			if( lightSources[i].isRotYYOn() ) {

				var angle = lightSources[i].getRotAngleYY() + lightSources[i].getRotationSpeed() * (90 * elapsed) / 1000.0;

				lightSources[i].setRotAngleYY( angle );
			}
		}
        */
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
		globalSx *= 0.9;
		globalSz = globalSy = globalSx;
	}
	// Page Down
	if (currentlyPressedKeys[34]) {
		//Zoom in
		globalSx *= 1.1;
		globalSz = globalSy = globalSx;
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

    globalAngleYY += radians( 10 * deltaX  )

    var deltaY = newY - lastMouseY;

    globalAngleXX += radians( 10 * deltaY  )

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
// Load Map
//

function loadMapData(){

	// http://stackoverflow.com/questions/23331546/how-to-use-javascript-to-read-local-text-file-and-read-line-by-line
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
		//initBuffers();

		// Reset the transformations
		tx = ty = tz = 0.0;
		angleXX = angleYY = angleZZ = 0.0;
		sx = sy = sz = 1;
	};

	// Entire file read as a string
	reader.readAsText( file );
}

function loadMap(filename){
    //https://dannywoodz.wordpress.com/2014/12/16/webgl-from-scratch-loading-a-mesh/
    $.ajax({
        url: filename,
        dataType: 'text'
      }).done(function(data) {
        loadMapData(data);
      }).fail(function() {
        alert('Faild to retrieve [' + filename + "]");
      });
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

        //Load Map

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

    models = getModels(); // Get models used

	//initBuffers();

	tick();		// Timer that controls the rendering / animation

	outputInfos();
}
