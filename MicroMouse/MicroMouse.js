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
var globalAngleXX = 25.0;
var globalAngleYY = 0.0;
var globalSz = 1;
var globalSy = 1;
var globalSx = 1;

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

// Dictionary with models and variables
var simVars = null;

//------------------------------------
// MicroMouse variables

var walls = null;
var visited = null;

var halfThicknessOfPost = 1.2/288;

// lateral of floor minus post offsets
var lateral = 2-2*halfThicknessOfPost;

// center post on edge
var postOffset = -1+halfThicknessOfPost;

// place 1st wall after post
var wallOffset = -1+2*halfThicknessOfPost;

// half the wall, ~0.116
var halfWallLateral = (2-17*2*halfThicknessOfPost)/32;

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

	// Colors
    if('colors' in model){
        cubeVertexColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model['colors']), gl.STATIC_DRAW);
        cubeVertexColorBuffer.itemSize = 3;
        cubeVertexColorBuffer.numItems = model['vertices'].length / 3;
    }
    else{ // REMOVE
        cubeVertexColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
        cubeVertexColorBuffer.itemSize = 3;
        cubeVertexColorBuffer.numItems = model['vertices'].length / 3;
    }

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
					tx, ty, tz,
					mvMatrix,
					primitiveType ) {

    // Pay attention to transformation order !!
    if(tx != null)
    	mvMatrix = mult( mvMatrix, translationMatrix( tx, ty, tz ) );

    if(angleZZ != null)
    	mvMatrix = mult( mvMatrix, rotationZZMatrix( angleZZ ) );

    if(angleYY != null)
    	mvMatrix = mult( mvMatrix, rotationYYMatrix( angleYY ) );

    if(angleXX != null)
    	mvMatrix = mult( mvMatrix, rotationXXMatrix( angleXX ) );

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

	// GLOBAL TRANSFORMATION FOR THE WHOLE SCENE
	mvMatrix = translationMatrix(0, -0.3, -3.5 );
	mvMatrix = mult( mvMatrix, rotationYYMatrix( globalAngleYY ) );
	mvMatrix = mult( mvMatrix, rotationXXMatrix( globalAngleXX ) );
	mvMatrix = mult( mvMatrix, scalingMatrix( globalSx, globalSy, globalSz ) );

	// Updating the position of the light sources, if required

    // Drawing Objects
    drawEmptyMap(mvMatrix);
    drawWalls(mvMatrix);
    drawMouse(mvMatrix);
    drawMarkers(mvMatrix);

	// Counting the frames
	countFrames();
}

//----------------------------------------------------------------------------

// Drawing the empty Map (floor and posts)
function drawEmptyMap(mvMatrix){

	// Drawing the floor
	initBuffers(simVars['floor']);

	// Instantianting the current model
	drawModel( null, null, null,
			 null, null, null,
			 mvMatrix,
			 primitiveType );

    /////////////////////////////////////////////////////////

	// drawing posts
	initBuffers(simVars['post']);
	var x;
	var z;
	for(var i=0; i<=16; i++)
		for(var j=0; j<=16; j++){
		    // each of 16 segments
			x = postOffset + lateral/16 * i;
			z = postOffset + lateral/16 * j;
			drawModel(null, null, null,
					x, 0, z,
					mvMatrix,
					primitiveType );
	}
}

function drawWalls(mvMatrix){

	// drawing horizontal walls
	initBuffers(simVars['wall']);
	for(var row = 0; row < simVars['wall']['hor'].length; row++){
        for(var col = 0; col < simVars['wall']['hor'][row].length; col++){
            if(simVars['wall']['hor'][row][col]){
                //	one post offset 				 each of 16 segments
                var x = wallOffset + halfWallLateral + lateral/16 * col;
                var z = postOffset + lateral/16 * row;
                // front wall
                drawModel(null, null, null,
                        x, 0, z,
                        mvMatrix,
                        primitiveType );
            }
        }
	}
    // drawing vertical walls
	for(var row = 0; row < simVars['wall']['ver'].length; row++){
        for(var col = 0; col < simVars['wall']['ver'][row].length; col++){
            if(simVars['wall']['ver'][row][col]){
                //	one post offset					 each of 16 segments
                var x = postOffset + lateral/16 * col
                var z = wallOffset + halfWallLateral + lateral/16 * row;
                // right wall
                drawModel(null, 90, null,
                        x, 0, z,
                        mvMatrix,
                        primitiveType );
            }
        }
	}

}

function drawMouse(mvMatrix){
    // Drawing the mouse
    initBuffers(simVars['mouse']);

	// Instantianting the current model
	drawModel( null, simVars['mouse'].angleYY, null,
	           simVars['mouse'].tx, 0, simVars['mouse'].tz,
	           mvMatrix,
	           primitiveType );
}

function drawMarkers(mvMatrix){}


//----------------------------------------------------------------------------

// Timer

function tick() {

	requestAnimFrame(tick);

	resizeCanvas(gl.canvas);
	gl.viewport(0,0, gl.canvas.width, gl.canvas.height);

    handleKeys();

	drawScene();
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

	// -
	if (currentlyPressedKeys[109]) {
		//Zoom out
		globalSx *= 0.9;
		globalSz = globalSy = globalSx;
	}
	// +
	if (currentlyPressedKeys[107]) {
		//Zoom in
		globalSx *= 1.1;
		globalSz = globalSy = globalSx;
	}
	// W or w
	if (currentlyPressedKeys[87] || currentlyPressedKeys[119]) {
		// go up
		simVars['mouse'].tx += 0.0075 * Math.cos(simVars['mouse'].angleYY/180*Math.PI);
		simVars['mouse'].tz -= 0.0075 * Math.sin(simVars['mouse'].angleYY/180*Math.PI);
	}
	// A or a
	if (currentlyPressedKeys[65] || currentlyPressedKeys[97]) {
		// go left
		simVars['mouse'].angleYY += 2.0;
	}
	// S or s
	if (currentlyPressedKeys[83] || currentlyPressedKeys[115]) {
		// go down
		simVars['mouse'].tx -= 0.0075 * Math.cos(simVars['mouse'].angleYY/180*Math.PI);
		simVars['mouse'].tz += 0.0075 * Math.sin(simVars['mouse'].angleYY/180*Math.PI);
	}
	// D or d
	if (currentlyPressedKeys[68] || currentlyPressedKeys[100]) {
		// go right
		simVars['mouse'].angleYY -= 2.0;
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

	document.getElementById("file").onchange = function(){

        // http://stackoverflow.com/questions/23331546/how-to-use-javascript-to-read-local-text-file-and-read-line-by-line
        var file = this.files[0];
        var reader = new FileReader();
        reader.onload = function( progressEvent ){
            // Entire file read as a string

            // test if given file only has ' ', '-' and '#'
            if(/^[\#\s-]+$/.test(this.result))
               loadMapDataA(this.result);
            // test if given file only has ' ', '|' and '_'
            else if(/^[|_\s]+$/.test(this.result))
               loadMapDataB(this.result);
            else
                alert("Given map has invalid characters");
        };

        // Entire file read as a string
        reader.readAsText( file );
    }

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

function loadMapDataA(file){

    var mapString = file.replace(/ /g,'');

    // map in array by lines
    var mapStringArray = mapString.split(/\r\n|\r|\n/g);

    // ----------
    // Validation

    if(mapStringArray.length != 34){
        alert("Given map has the wrong number of lines");
        return;
    }

    // check that top and bottom lines are all #
    if(!(/^[#]{33}/.test(mapStringArray[0]) && /^[#]{33}/.test(mapStringArray[32]))){
        alert("Top and bottom lines need to be all walls and posts");
        return;
    }

    // check if wall and post are valid
    for(var i = 1; i <= 31; i+=2){
        if(!/^#-([-#]-){15}#/.test(mapStringArray[i])){
            alert("Invalid wall or post in line " + (i+1));
            return;
        }
    }
    for(var i = 2; i <= 30; i+=2){
        if(!/^#([-#]#){16}/.test(mapStringArray[i])){
            alert("Invalid wall or post in line " + (i+1));
            return;
        }
    }

    // ------------------------------------------
    // Loading walls and post position to simVars

    // Horizontal walls
    for(var line = 0; line < 33; line+=2){
        var tmpWalls = [];
        for(var x = 0; x < 31; x+=2){
            tmpWalls[x/2] = (mapStringArray[line][x+1] == '#') | 0;
        }

        simVars['wall']['hor'][line/2] = tmpWalls;
    }

    // Vertical walls
    for(var line = 0; line < 32; line+=2){
        var tmpWalls = [];
        for(var x = 0; x < 33; x+=2){
            tmpWalls[x/2] = (mapStringArray[line+1][x] == '#') | 0;
        }

        simVars['wall']['ver'][line/2] = tmpWalls;
    }
}

function loadMapDataB(file){

    // removes whitespaces at the end of the lines
    var mapString = file.replace(/\s+$/g,'');

     // map in array by lines
    var mapStringArray = mapString.split(/\r\n|\r|\n/g);

    // ----------
    // Validation

    if(mapStringArray.length != 17){
        alert("Given map has the wrong number of lines");
        return;
    }

    // Check top line
    if(!(/^(\s_){16}$/.test(mapStringArray[0]))){
        alert("The top line needs to be all walls");
        return;
    }

    // check middle lines
    for(var i = 1; i < 16; i++){
        if(!(/^\|([_\s][|\s]){15}[_\s]\|$/).test(mapStringArray[i])){
            alert("Invalid wall at line " + (i+1));
            return;
        }
    }

    // check bottom line
    if(!(/^\|(_[|\s]){15}[_\s]\|$/.test(mapStringArray[16]))){
        alert("The botton line is invalid");
        return;
    }

    // ------------------------------------------
    // Loading walls and post position to simVars

    // Horizontal walls
    for(var line = 0; line < 17; line++){
        var tmpWalls = [];
        for(var x = 0; x < 32; x+=2){
            tmpWalls[x/2] = (mapStringArray[line][x+1] == '_') | 0;
        }

        simVars['wall']['hor'][line] = tmpWalls;
    }

    // Vertical walls
    for(var line = 0; line < 16; line++){
        var tmpWalls = [];
        for(var x = 0; x < 33; x+=2){
            tmpWalls[x/2] = (mapStringArray[line+1][x] == '|') | 0;
        }

        simVars['wall']['ver'][line] = tmpWalls;
    }
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

    simVars = getSimulationVars(); // Get models and variables used

	//initBuffers();

	tick();		// Timer that controls the rendering / animation

	outputInfos();
}
