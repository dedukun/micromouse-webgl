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
var modelVertexPositionBuffer = null;
var modelVertexIndexBuffer = null;
var modelVertexNormalBuffer = null;
var modelVertexTextureCoordBuffer;

// The GLOBAL transformation parameters
var globalAngleXX = 25.0;
var globalAngleYY = 0.0;
var globalTx =  0.0;
var globalTy = -0.3;
var globalTz = -3.5;
var globalSx = 1;
var globalSy = 1;
var globalSz = 1;

// To allow choosing the way of drawing the model triangles
var primitiveType = null;

// The viewer position
var pos_Viewer = [ 0.0, 0.0, 0.0, 1.0 ];

// First Person View Camera
var firstPersonView = false;

// Block User User Inputs (Rotations)
var blockUserInput = false;

// Ambient coef.
var kAmbi = [ 1.0, 1.0, 1.0 ];

// Diffuse coef.
var kDiff = [ 0.6, 0.6, 0.6 ];

// Specular coef.
var kSpec = [ 0.7, 0.7, 0.7 ];

// Phong coef.
var nPhong = 32;

//------------------------------------
// MicroMouse variables

// Dictionary with models and variables
var simVars = null;

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

// collision aux vars
var horWalls = [];
var verWalls = [];

var col = null;
var row = null;

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

// Handling the Textures
// From www.learningwebgl.com

function handleLoadedTexture(texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);
}


// Textures variables
var floorTexture;
var wallTopTexture;
var wallSideTexture;
var postTopTexture;
var postSideTexture;
var mouseTopTexture;
var mouseSideTexture;

function initTexture() {

	floorTexture = gl.createTexture();
	floorTexture.image = new Image();
	floorTexture.image.onload = function () {
		handleLoadedTexture(floorTexture)
	}

	wallTopTexture = gl.createTexture();
	wallTopTexture.image = new Image();
	wallTopTexture.image.onload = function () {
		handleLoadedTexture(wallTopTexture)
	}

	wallSideTexture = gl.createTexture();
	wallSideTexture.image = new Image();
	wallSideTexture.image.onload = function () {
		handleLoadedTexture(wallSideTexture)
	}

	postTopTexture = gl.createTexture();
	postTopTexture.image = new Image();
	postTopTexture.image.onload = function () {
		handleLoadedTexture(postTopTexture)
	}

	postSideTexture = gl.createTexture();
	postSideTexture.image = new Image();
	postSideTexture.image.onload = function () {
		handleLoadedTexture(postSideTexture)
	}

	mouseTopTexture = gl.createTexture();
	mouseTopTexture.image = new Image();
	mouseTopTexture.image.onload = function () {
		handleLoadedTexture(mouseTopTexture)
	}

	mouseSideTexture = gl.createTexture();
	mouseSideTexture.image = new Image();
	mouseSideTexture.image.onload = function () {
		handleLoadedTexture(mouseSideTexture)
	}


	floorTexture.image.src     = simVars['floor'].texture;
	wallTopTexture.image.src   = simVars['wall'].textureTop;
	wallSideTexture.image.src  = simVars['wall'].textureSide;
	postTopTexture.image.src   = simVars['post'].textureTop;
	postSideTexture.image.src  = simVars['post'].textureSide;
	mouseTopTexture.image.src  = simVars['mouse'].textureTop;
	mouseSideTexture.image.src = simVars['mouse'].textureSide;
}

// Handling the Vertex and the Color Buffers

function initBuffers(model) {

	// Coordinates
	modelVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model['vertices']), gl.STATIC_DRAW);
	modelVertexPositionBuffer.itemSize = 3;
	modelVertexPositionBuffer.numItems = model['vertices'].length / 3;

    // Textures
    modelVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model['textureCoords']), gl.STATIC_DRAW);
    modelVertexTextureCoordBuffer.itemSize = 2;
    modelVertexTextureCoordBuffer.numItems = model['textureCoords'].length / 2;

	// Vertex indices
    modelVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, modelVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model['faces']), gl.STATIC_DRAW);
    modelVertexIndexBuffer.itemSize = 1;
    modelVertexIndexBuffer.numItems = model['faces'].length;

    // Normals
	modelVertexNormalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model['normals']), gl.STATIC_DRAW);
	modelVertexNormalBuffer.itemSize = 3;
	modelVertexNormalBuffer.numItems = model['normals'].length / 3;
}

//----------------------------------------------------------------------------

//  Drawing the model

function drawModel( angleXX, angleYY, angleZZ,
					tx, ty, tz,
					mvMatrix,
					primitiveType,
                    dualTextureMode,
                    modelTexture,
                    modelTexture2 = null) {

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
	gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, modelVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, modelVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexNormalBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, modelVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// Material properties
	gl.uniform3fv( gl.getUniformLocation(shaderProgram, "k_ambient"), flatten(kAmbi) );
    gl.uniform3fv( gl.getUniformLocation(shaderProgram, "k_diffuse"), flatten(kDiff) );
    gl.uniform3fv( gl.getUniformLocation(shaderProgram, "k_specular"), flatten(kSpec) );
	gl.uniform1f( gl.getUniformLocation(shaderProgram, "shininess"), nPhong );

    // Light Sources
	var numLights = 1;
	gl.uniform1i( gl.getUniformLocation(shaderProgram, "numLights"), numLights );

	//Light Sources
	for(var i = 0; i < lightSources.length; i++ )
	{
		gl.uniform4fv( gl.getUniformLocation(shaderProgram, "allLights[" + String(i) + "].position"),
			flatten(lightSources[i].getPosition()) );

		gl.uniform3fv( gl.getUniformLocation(shaderProgram, "allLights[" + String(i) + "].intensities"),
			flatten(lightSources[i].getIntensity()) );
    }


    // Textures
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(shaderProgram.samplerUniform, 0);

    // The vertex indices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, modelVertexIndexBuffer);

    if(!dualTextureMode){
        gl.bindTexture(gl.TEXTURE_2D, modelTexture);
        // Drawing the triangles --- NEW --- DRAWING ELEMENTS
        gl.drawElements(gl.TRIANGLES, modelVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    }
    else{
        // Not Drawing the bottom

        // Side Textures
        gl.bindTexture(gl.TEXTURE_2D, modelTexture);
        gl.drawElements(gl.TRIANGLES, 24, gl.UNSIGNED_SHORT, 0);

        // Top Texture
        gl.bindTexture(gl.TEXTURE_2D, modelTexture2);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 48);
    }
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
	pos_Viewer[0] = pos_Viewer[1] = pos_Viewer[2] = 10.0;
	pos_Viewer[3] = 1.0;

	// Passing the Projection Matrix to apply the current projection
	var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	gl.uniformMatrix4fv(pUniform, false, new Float32Array(flatten(pMatrix)));

	// Passing the viewer position to the vertex shader
    gl.uniform4fv( gl.getUniformLocation(shaderProgram, "viewerPosition"), flatten(pos_Viewer) );


    // Check if lighting is on
    var lighting = document.getElementById("lighting").checked;
    gl.uniform1i(shaderProgram.useLightingUniform, lighting);

	// GLOBAL TRANSFORMATION FOR THE WHOLE SCENE
	mvMatrix = translationMatrix(globalTx, globalTy, globalTz );
	mvMatrix = mult( mvMatrix, rotationXXMatrix( globalAngleXX ) );
	mvMatrix = mult( mvMatrix, rotationYYMatrix( globalAngleYY ) );
	mvMatrix = mult( mvMatrix, scalingMatrix( globalSx, globalSy, globalSz ) );

    // Drawing Objects
    drawEmptyMap(mvMatrix);
    drawWalls(mvMatrix);

    //if(!firstPersonView)
    drawMouse(mvMatrix);

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
			 primitiveType,
             false,
             floorTexture);

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
					primitiveType,
                    true,
                    postSideTexture,
                    postTopTexture);
	}
}

function drawWalls(mvMatrix){

    // drawing horizontal walls
    initBuffers(simVars['wall']);
    for(var iRow = 0; iRow < simVars['wall']['hor'].length; iRow++){
        for(var iCol = 0; iCol < simVars['wall']['hor'][iRow].length; iCol++){
            if(simVars['wall']['hor'][iRow][iCol] != 10){     //there's a wall
                
                // draw
                drawModel(null, null, null,
                        simVars['wall']['hor'][iRow][iCol][0], 0, simVars['wall']['hor'][iRow][iCol][1],
                        mvMatrix,
                        primitiveType,
                        true,
                        wallSideTexture,
                        wallTopTexture);
            }
        }
    }

    // drawing vertical walls
    for(var iRow = 0; iRow < simVars['wall']['ver'].length; iRow++){
        for(var iCol = 0; iCol < simVars['wall']['ver'][iRow].length; iCol++){
            if(simVars['wall']['ver'][iRow][iCol] != 10){

                //draw
                drawModel(null, 90, null,
                        simVars['wall']['ver'][iRow][iCol][0], 0, simVars['wall']['ver'][iRow][iCol][1],
                        mvMatrix,
                        primitiveType,
                        true,
                        wallSideTexture,
                        wallTopTexture);            
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
               primitiveType,
               true,
               mouseSideTexture,
               mouseTopTexture);
}


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

    // W or w
    if ((currentlyPressedKeys[87] || currentlyPressedKeys[119])){

    	goW();

        if(firstPersonView){
            globalTx = - simVars['mouse'].tx;
            globalTz = - 0.25 -simVars['mouse'].tz;
        }
    }
    // A or a
    if (currentlyPressedKeys[65] || currentlyPressedKeys[97]){

        goA();

        if(firstPersonView)
            globalAngleYY -= 2.0;
    }
    // S or s
    if (currentlyPressedKeys[83] || currentlyPressedKeys[115]){

    	goS();

        if(firstPersonView){
            globalTx = - simVars['mouse'].tx;
            globalTz = - 0.25 - simVars['mouse'].tz;
        }
    }
    // D or d
    if (currentlyPressedKeys[68] || currentlyPressedKeys[100]){

        goD();

        if(firstPersonView)
            globalAngleYY += 2.0;
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

    if (!mouseDown || blockUserInput) {

      return;
    }

    // Rotation angles proportional to cursor displacement

    var newX = event.clientX;

    var newY = event.clientY;

    var deltaX = newX - lastMouseX;

    globalAngleYY += radians( 5 * deltaX  );

    var deltaY = newY - lastMouseY;

    if(!firstPersonView)
        globalAngleXX += radians( 5 * deltaY  );

    lastMouseX = newX;

    lastMouseY = newY;
}

//https://www.sitepoint.com/html5-javascript-mouse-wheel/
function handleMouseWheel(event){

    // cross-browser wheel delta
	var event = window.event || event; // old IE support
	var delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));

    //Zoom out
    if (delta < 0 && !blockUserInput) {
        globalSx *= 0.9;
        globalSz = globalSy = globalSx;
    }

    //Zoom in
    if (delta > 0 && !blockUserInput) {
        globalSx *= 1.1;
        globalSz = globalSy = globalSx;
    }
}

//----------------------------------------------------------------------------

function setEventListeners( canvas ){

    // Mouse + Keyboard Events
    canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;

    // IE9, Chrome, Safari, Opera
	document.addEventListener("mousewheel", handleMouseWheel, false);
	// Firefox
	document.addEventListener("DOMMouseScroll", handleMouseWheel, false);

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

	// Dropdown list
	var camera = document.getElementById("camera-selection");

	camera.addEventListener("click", function(){
		// Getting the selection
		var c = camera.selectedIndex;

        blockUserInput = false;
        firstPersonView = false;
        resetGlobalVars();

		switch(c){
			case 0: // Free Camera
                globalAngleXX = 25.0;
                globalTy = -0.3;
                globalTz = -3.5;
				break;

			case 1: // Top View
                globalAngleXX = 90.0;
                globalTz = -2.5;
                blockUserInput = true;
				break;

			case 2: // First Person View
                globalTx = - simVars['mouse'].tx;
                globalTy = -0.04;
                globalTz = - 0.25 - simVars['mouse'].tz;
                firstPersonView = true;
				break;
		}
	});

    document.getElementById("reset-button").onclick = function(){

        resetMap();

        if(firstPersonView){ // reset camera
            resetGlobalVars();
            globalTx = - simVars['mouse'].tx;
            globalTy = -0.04;
            globalTz = -0.25 - simVars['mouse'].tz;
        }
    };
}

// reset Camera/global values;
function resetGlobalVars(){
    globalAngleXX = 0.0;
    globalAngleYY = 0.0;
    globalTx = 0.0;
    globalTy = 0.0;
    globalTz = 0.0;
    globalSx = 1;
    globalSy = 1;
    globalSz = 1;
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

    var x;
    var z;

    // Horizontal walls
    for(var line = 0; line < 33; line+=2){
        var tmpWalls = [];
        for(var col = 0; col < 31; col+=2){
            if (mapStringArray[line][col+1] == '#') {
                x = wallOffset + halfWallLateral + lateral/16*(col/2);
                z = postOffset + lateral/16*(line/2);
                tmpWalls[col/2] = [x, z, x - 0.062, z + 0.004, x + 0.062, z + 0.004, x + 0.062, z - 0.004, x - 0.062, z - 0.004 ];
            }
            else {
                tmpWalls[col/2] = 10;
            }
        }
        simVars['wall']['hor'][line/2] = tmpWalls;
    }

    // Vertical walls
    for(var line = 0; line < 32; line+=2){
        var tmpWalls = [];
        for(var col = 0; col < 33; col+=2){
            if (mapStringArray[line+1][col] == '#') {
                x =postOffset + lateral/16*(col/2);
                z = wallOffset + halfWallLateral + lateral/16*(line/2);
                tmpWalls[col/2] = [x, z, x - 0.004, z + 0.062, x + 0.004, z + 0.062, x + 0.004, z - 0.062, x - 0.004, z - 0.062 ];
            }
            else {
                tmpWalls[col/2] = 10;
            }
        }
        simVars['wall']['ver'][line/2] = tmpWalls;
    }

    console.log(simVars['wall']['hor'].length) //17
    console.log(simVars['wall']['hor'][0].length) //16
    console.log(simVars['wall']['ver'].length) //16
    console.log(simVars['wall']['ver'][0].length) //17
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

    var x;
    var y;

    // Horizontal walls
    for(var line = 0; line < 17; line++){
        var tmpWalls = [];
        for(var row = 0; row < 32; row+=2){
            if(mapStringArray[line][row+1] == '_') {
                x = wallOffset + halfWallLateral + lateral/16*(col/2);
                z = postOffset + lateral/16*(line/2);
                tmpWalls[col/2] = [x, z, x - 0.062, z + 0.004, x + 0.062, z + 0.004, x + 0.062, z - 0.004, x - 0.062, z - 0.004 ];
            }
            else {
                tmpWalls[col/2] = 10;
            }
        }

        simVars['wall']['hor'][line] = tmpWalls;
    }

    // Vertical walls
    for(var line = 0; line < 16; line++){
        var tmpWalls = [];
        for(var row = 0; row < 33; row+=2){
            if (mapStringArray[line+1][row] == '|') {
                x =postOffset + lateral/16*(col/2);
                z = wallOffset + halfWallLateral + lateral/16*(line/2);
                tmpWalls[col/2] = [x, z, x - 0.004, z + 0.062, x + 0.004, z + 0.062, x + 0.004, z - 0.062, x - 0.004, z - 0.062 ];
            }
            else {
                tmpWalls[col/2] = 10;
            }
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

 //   calculateNormals( simVars );

    initTexture();

    tick();     // Timer that controls the rendering / animation

    outputInfos();
}
