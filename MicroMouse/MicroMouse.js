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
var cubeVertexIndexBuffer = null;
var cubeVertexTextureCoordBuffer;

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
	cubeVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model['vertices']), gl.STATIC_DRAW);
	cubeVertexPositionBuffer.itemSize = 3;
	cubeVertexPositionBuffer.numItems = model['vertices'].length / 3;

    // Textures
    cubeVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model['textureCoords']), gl.STATIC_DRAW);
    cubeVertexTextureCoordBuffer.itemSize = 2;
    cubeVertexTextureCoordBuffer.numItems = 24;

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
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);

    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, cubeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // Textures
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(shaderProgram.samplerUniform, 0);


    if(!dualTextureMode){
        gl.bindTexture(gl.TEXTURE_2D, modelTexture);
        // Drawing the triangles --- NEW --- DRAWING ELEMENTS
        gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
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
    // The vertex indices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
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
	mvMatrix = translationMatrix(globalTx, globalTy, globalTz );
	mvMatrix = mult( mvMatrix, rotationYYMatrix( globalAngleYY ) );
	mvMatrix = mult( mvMatrix, rotationXXMatrix( globalAngleXX ) );
	mvMatrix = mult( mvMatrix, scalingMatrix( globalSx, globalSy, globalSz ) );

	// Updating the position of the light sources, if required

    // Drawing Objects
    drawEmptyMap(mvMatrix);
    drawWalls(mvMatrix);
    drawMarkers(mvMatrix);

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

    horWalls = [];
    verWalls = [];
    row = Math.floor((simVars['mouse'].tz+1)/(2/16));
    col = Math.floor((simVars['mouse'].tx+1)/(2/16));

    // drawing horizontal walls
    initBuffers(simVars['wall']);
    for(var iRow = 0; iRow < simVars['wall']['hor'].length; iRow++){
        for(var iCol = 0; iCol < simVars['wall']['hor'][iRow].length; iCol++){
            if(simVars['wall']['hor'][iRow][iCol]){     //there's a wall

                //  one post offset                  each of 16 segments
                var x = wallOffset + halfWallLateral + lateral/16 * iCol;
                var z = postOffset + lateral/16 * iRow;
       
               	// save the coords for collision
               	var coords = [x - 0.062, z + 0.004, x + 0.062, z + 0.004, x + 0.062, z - 0.004, x - 0.062, z - 0.004 ];
                if( (iRow == row) && (iCol == col-1) )  { horWalls[0] = coords; }   //up left
                if( (iRow == row) && (iCol == col) )    { horWalls[1] = coords; }   //up
                if( (iRow == row) && (iCol == col+1) )  { horWalls[2] = coords; }   //up right

                if( (iRow == row+1) && (iCol == col-1) ) { horWalls[3] = coords; }  //down left
                if( (iRow == row+1) && (iCol == col) )   { horWalls[4] = coords; }  //down
                if( (iRow == row+1) && (iCol == col+1) ) { horWalls[5] = coords; }  //down right
                
                // draw
                drawModel(null, null, null,
                        x, 0, z,
                        mvMatrix,
                        primitiveType,
                        true,
                        wallSideTexture,
                        wallTopTexture);
            }
            else{	//no wall there
            	if( (iRow == row) && (iCol == col-1) ) { horWalls[0] = 10; } 	//up left
                if( (iRow == row) && (iCol == col) ) { horWalls[1] = 10; }		//up
                if( (iRow == row) && (iCol == col+1) ) { horWalls[2] = 10; }	//up right

            	if( (iRow == row+1) && (iCol == col-1)) { horWalls[3] = 10; }	//down left 
                if( (iRow == row+1) && (iCol == col)) { horWalls[4] = 10; }		//down
            	if( (iRow == row+1) && (iCol == col+1)) { horWalls[5] = 10; }	//down right
            }
        }
    }
    //outside of the map
    if( col == 0 )  { horWalls[0] = 10; }
    if( col == 15)  { horWalls[2] = 10; }
    if( col == 0 )  { horWalls[3] = 10; }
    if( col == 15)  { horWalls[5] = 10; }

    // drawing vertical walls
    for(var iRow = 0; iRow < simVars['wall']['ver'].length; iRow++){
        for(var iCol = 0; iCol < simVars['wall']['ver'][iRow].length; iCol++){
            if(simVars['wall']['ver'][iRow][iCol]){

                //  one post offset                  each of 16 segments
                var x = postOffset + lateral/16 * iCol
                var z = wallOffset + halfWallLateral + lateral/16 * iRow;

                // save the coords for collision
                var coords = [x - 0.004, z + 0.062, x + 0.004, z + 0.062, x + 0.004, z - 0.062, x - 0.004, z - 0.062 ];
                if( (iRow == row-1) && (iCol == col) )  { verWalls[0] = coords; }   //left up
                if( (iRow == row) && (iCol == col) )    { verWalls[1] = coords; }   //left
                if( (iRow == row+1) && (iCol == col) )  { verWalls[2] = coords; }   //left down

                if( (iRow == row-1) && (iCol == col+1) ) { verWalls[3] = coords; }  //right up
                if( (iRow == row) && (iCol == col+1) )   { verWalls[4] = coords; }  //right
                if( (iRow == row+1) && (iCol == col+1) ) { verWalls[5] = coords; }  //right down

                //draw
                drawModel(null, 90, null,
                        x, 0, z,
                        mvMatrix,
                        primitiveType,
                        true,
                        wallSideTexture,
                        wallTopTexture);            
	        }
            else{
            	if( (iRow == row-1) && (iCol == col) ) { verWalls[0] = 10; } 	//left up
                if( (iRow == row) && (iCol == col) ) { verWalls[1] = 10; }		//left
                if( (iRow == row+1) && (iCol == col) ) { verWalls[2] = 10; }	//left down

            	if( (iRow == row-1) && (iCol == col+1) ) { verWalls[3] = 10; }	//right up
                if( (iRow == row) && (iCol == col+1) ) { verWalls[4] = 10; }	//right
            	if( (iRow == row+1) && (iCol == col+1) ) { verWalls[5] = 10; }	//right down
        	}
        }
    }
    //outside of the map
    if( row == 0 )  { verWalls[0] = 10; }
    if( row == 15)  { verWalls[2] = 10; }
    if( row == 0 )  { verWalls[3] = 10; }
    if( row == 15)  { verWalls[5] = 10; }
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

    initTexture();

    //initBuffers();

    tick();     // Timer that controls the rendering / animation

    outputInfos();
}
