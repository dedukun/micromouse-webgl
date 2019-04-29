//////////////////////////////////////////////////////////////////{
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

// First Person View Camera
var firstPersonView = false;
var fPVAngle = 0.0;

// Block User User Inputs (Rotations)
var blockUserInput = false;

// Worker for AI
var worker;
var scriptMaze = null;

//------------------------------------
// MicroMouse variables

// Dictionary with models and variables
var simVars = null;

var mapLoaded = false;

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
var col = null;
var row = null;

// marks where the mouse has been (doesn't works in free control)
// Used to draw markers
var marked = [];

var controlMode = 0;
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

       document.getElementById('canvasEdge').setAttribute('data-badge', fps);
   }
}


//----------------------------------------------------------------------------
//
// Count solve time
//

var elT = 0;
var lastT = 0;
var keepScore = 0;
var stopTimer = true;
var alreadyWon = false;

function countTime() {
    if(won()&&!alreadyWon) {
        document.getElementById("timer").innerHTML =  (Math.floor((elT/1000)/60)) + ":" + ((elT/1000)%60).toFixed(3);
        score();
        stopTimer = true;
        alreadyWon = true;
        return;
    }

    if(stopTimer) return;

    var now = new Date().getTime();

    elT += (now - lastT);

    lastT = now;

    document.getElementById("timer").innerHTML = (Math.floor((elT/1000)/60)) + ":" + ((elT/1000)%60).toFixed(3);
}

function resetTimer(){

    elT = 0;
    stopTimer = true;
    alreadyWon = false;

    document.getElementById("timer").innerHTML = "00:00";
}

function startTimer(){
    lastT = new Date().getTime()
    if(!alreadyWon)
        stopTimer = false;
}

function score() {
    document.getElementById("score"+keepScore).innerHTML = (Math.floor((elT/1000)/60)) + ":" + ((elT/1000)%60).toFixed(3);
    keepScore++;
    keepScore%=10;
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
var markerTexture;

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

	markerTexture = gl.createTexture();
	markerTexture.image = new Image();
	markerTexture.image.onload = function () {
		handleLoadedTexture(markerTexture)
	}


	floorTexture.image.src     = simVars['floor'].texture;
	wallTopTexture.image.src   = simVars['wall'].textureTop;
	wallSideTexture.image.src  = simVars['wall'].textureSide;
	postTopTexture.image.src   = simVars['post'].textureTop;
	postSideTexture.image.src  = simVars['post'].textureSide;
	mouseTopTexture.image.src  = simVars['mouse'].textureTop;
	mouseSideTexture.image.src = simVars['mouse'].textureSide;
	markerTexture.image.src = simVars['marker'].texture;
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
var first = true;
//  Drawing the model
function drawModel( angleXX, angleYY, angleZZ,
					tx, ty, tz,
					mvMatrix,
                    isMouse,
                    dualTextureMode,
                    modelTexture,
                    modelTexture2 = null) {

    if(firstPersonView){ // First Person View
        mvMatrix = mult( mvMatrix, translationMatrix(simVars['mouse'].tx, 0, simVars['mouse'].tz ) );

        mvMatrix = mult( mvMatrix, rotationYYMatrix( fPVAngle ));

        mvMatrix = mult( mvMatrix, translationMatrix(-simVars['mouse'].tx, 0, -simVars['mouse'].tz ) );
    }

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
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, new Float32Array(flatten(mvMatrix)));

    // Passing the Normal Matrix
    var normalMatrix;
    if(!isMouse){
        normalMatrix = mat3.create();
        mat4.toInverseMat3(flatten(mvMatrix), normalMatrix);
        mat3.transpose(normalMatrix);
    }
    else{
        // dont change mouse ilumination with its rotation
        normalMatrix = flatten(mat3(1));
    }
    gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);

    // Passing the buffers
	gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, modelVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, modelVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexNormalBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, modelVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // Textures
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(shaderProgram.samplerUniform, 0);

    // The vertex indices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, modelVertexIndexBuffer);

    if(!dualTextureMode){
        gl.bindTexture(gl.TEXTURE_2D, modelTexture);
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
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	pMatrix = perspective( 45, 1, 0.05, 15 );

	// Passing the Projection Matrix to apply the current projection
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, new Float32Array(flatten(pMatrix)));

    // Lighting
    var lighting = document.getElementById("lighting").checked;
    gl.uniform1i(shaderProgram.useLightingUniform, lighting);
    if(lighting){
        gl.uniform3f(
            shaderProgram.ambientColorUniform,
            parseFloat(0.4),
            parseFloat(0.4),
            parseFloat(0.4)
        );
        gl.uniform3f(
            shaderProgram.pointLightingLocationUniform,
            parseFloat( 0.0),
            parseFloat(10.0),
            parseFloat(-3.5)
        );
        gl.uniform3f(
            shaderProgram.pointLightingColorUniform,
            parseFloat(0.9),
            parseFloat(0.9),
            parseFloat(0.9)
        );
    }

	// GLOBAL TRANSFORMATION FOR THE WHOLE SCENE
    mvMatrix = translationMatrix(globalTx, globalTy, globalTz );
    mvMatrix = mult( mvMatrix, rotationXXMatrix( globalAngleXX ) );
    mvMatrix = mult( mvMatrix, rotationYYMatrix( globalAngleYY ) );
    mvMatrix = mult( mvMatrix, scalingMatrix( globalSx, globalSy, globalSz ) );

    // Drawing Objects
    drawEmptyMap(mvMatrix);
    drawWalls(mvMatrix);

    if(document.getElementById("flag").checked)
        drawMarkers(mvMatrix);

    if(!firstPersonView)
        drawMouse(mvMatrix);

	// Counting the frames
	countFrames();

    //timer
    if(!stopTimer)
        countTime();
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
			 false,
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
			drawModel(null, -180, null,
					x, 0, z,
					mvMatrix,
					false,
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
                drawModel(null, 180, null,
                        simVars['wall']['hor'][iRow][iCol][0], 0, simVars['wall']['hor'][iRow][iCol][1],
                        mvMatrix,
                        false,
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
                        false,
                        true,
                        wallSideTexture,
                        wallTopTexture);
            }
        }
    }
}

function drawMarkers(mvMatrix){
    // Drawing the mouse
    initBuffers(simVars['marker']);

    var x = wallOffset + halfWallLateral;
    var z =  wallOffset + halfWallLateral;
    for(var m = 0; m < marked.length; m++){
        // Instantianting the current model
        drawModel( null, null, null,
                   x + lateral/16*(marked[m]['col']), 0, z +  lateral/16*marked[m]['row'],
                   mvMatrix,
                   true,
                   false,
                   markerTexture);
    }
}

function drawMouse(mvMatrix){
    // Drawing the mouse
    initBuffers(simVars['mouse']);

    // Instantianting the current model
    drawModel( null, simVars['mouse'].angleYY, null,
               simVars['mouse'].tx, 0, simVars['mouse'].tz,
               mvMatrix,
               true,
               true,
               mouseSideTexture,
               mouseTopTexture);
}

//----------------------------------------------------------------------------

var lastAnimateTime = 0;
var animationSpeed = 3;
var animationInProg = false;
var newAnimation = true;
var animationType;
var animationAux = 0;
var animationXAxis = true;
function animate(){

    var now = new Date().getTime();
    if(lastAnimateTime != 0){

        // Seconds since last call
        var elapsedSec = (now - lastAnimateTime) / 1000;

        var tmpVar;
        if(animationType == 0){ // rotate + 90
            if(newAnimation){
                animationAux = -90;
                newAnimation = false;
            }

            tmpVar = -90 * animationSpeed * elapsedSec;

            simVars['mouse'].angleYY += tmpVar;

            animationAux -= tmpVar;

            if(animationAux > 0){ // Offset
                simVars['mouse'].angleYY += animationAux;
                simVars['mouse'].angleYY = Math.round(simVars['mouse'].angleYY);
                resetAnimation();
            }

            // First Person View Camera Angle
            fPVAngle = -(simVars['mouse'].angleYY-90);
        }
        else if(animationType == 1){ // rotate - 90
            if(newAnimation){
                animationAux = 90;
                newAnimation = false;
            }

            tmpVar = 90 * animationSpeed * elapsedSec;

            simVars['mouse'].angleYY += tmpVar;

            animationAux -= tmpVar;

            if(animationAux < 0){ // Offset
                simVars['mouse'].angleYY += animationAux;
                simVars['mouse'].angleYY = Math.round(simVars['mouse'].angleYY);
                resetAnimation();
            }

            // First Person View Camera Angle
            fPVAngle = -(simVars['mouse'].angleYY-90);
        }
        else if(animationType == 2){ // Move forward

            if(newAnimation){
                animationAux = lateral/16;
                newAnimation = false;

                if(Math.abs(Math.sin(radians(simVars['mouse'].angleYY))) == 1)
                    animationXAxis = false;
            }

            tmpVar = (lateral/16) * animationSpeed * elapsedSec;

            if(animationXAxis){
                simVars['mouse'].tx += tmpVar * Math.cos(radians(simVars['mouse'].angleYY));
            }
            else{
                simVars['mouse'].tz -= tmpVar * Math.sin(radians(simVars['mouse'].angleYY));
            }

            animationAux -= tmpVar;

            if(animationAux < 0){
                if(animationXAxis){ // Offset
                    simVars['mouse'].tx += animationAux * Math.cos(radians(simVars['mouse'].angleYY));
                }
                else{
                    simVars['mouse'].tz -= animationAux * Math.sin(radians(simVars['mouse'].angleYY));
                }

                // reset
                resetAnimation();
            }

            if(firstPersonView){ // First Persion View Camera
                globalTx = - simVars['mouse'].tx;
                globalTz = - 0.05 - simVars['mouse'].tz;
            }
        }
        else if(animationType == 3){ // Move Backwards
            if(newAnimation){
                animationAux = lateral/16;
                newAnimation = false;

                if(Math.abs(Math.sin(radians(simVars['mouse'].angleYY))) == 1)
                    animationXAxis = false;
            }

            tmpVar = (lateral/16) * animationSpeed * elapsedSec;

            if(animationXAxis){
                simVars['mouse'].tx -= tmpVar * Math.cos(radians(simVars['mouse'].angleYY));
            }
            else{
                simVars['mouse'].tz += tmpVar * Math.sin(radians(simVars['mouse'].angleYY));
            }

            animationAux -= tmpVar;

            if(animationAux < 0){
                if(animationXAxis){ // Offset
                    simVars['mouse'].tx -= animationAux * Math.cos(radians(simVars['mouse'].angleYY));
                }
                else{
                    simVars['mouse'].tz += animationAux * Math.sin(radians(simVars['mouse'].angleYY));
                }

                // reset
                resetAnimation();
            }

            if(firstPersonView){ // First Persion View Camera
                globalTx = - simVars['mouse'].tx;
                globalTz = - 0.05 - simVars['mouse'].tz;
            }

        }
    }
    lastAnimateTime = now;
}

function resetAnimation(){

    animationAux = 0;
    animationType = -1;
    lastAnimateTime = 0;
    newAnimation = true;
    animationXAxis = true;
    animationInProg = false;

    if(controlMode == 2){
        if(worker){
            var walls = checkWalls();
            worker.postMessage(walls); // Send data to worker
        }
    }
}

function mouseRotate90(positive){
    if(!animationInProg){
        animationInProg = true;
        if(positive)
            animationType = 0;
        else
            animationType = 1;
    }
}

function mouseMoveForward(){
    if(!animationInProg){
        var angleY = simVars['mouse'].angleYY;
        var x = simVars['mouse'].tx + (2/16) * Math.cos( radians(angleY) );
        var z = simVars['mouse'].tz - (2/16) * Math.sin( radians(angleY) );

        if( wayIsClear(x, z) ) {
            animationInProg = true;
            animationType = 2;
        }
    }
}

function mouseMoveBackwards(){
    if(!animationInProg){
        var angleY = simVars['mouse'].angleYY;
        var x = simVars['mouse'].tx - (2/16) * Math.cos( radians(angleY) );
        var z = simVars['mouse'].tz + (2/16) * Math.sin( radians(angleY) );

        if( wayIsClear(x, z) ) {
            animationInProg = true;
            animationType = 3;
        }
    }
}

//----------------------------------------------------------------------------

// Timer
function tick() {

    requestAnimFrame(tick);

    resizeCanvas(gl.canvas);
    gl.viewport(0,0, gl.canvas.width, gl.canvas.height);

    if(controlMode != 2) // not AI
        if(!animationInProg)
            handleKeys();

    if(controlMode != 1) // not free control
        animate();

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

    if(!mapLoaded) return;

    // W or w
    if ((currentlyPressedKeys[87] || currentlyPressedKeys[119])){

        if(stopTimer) startTimer();

        if ( controlMode  == 0 ) {
            constGoW();
        }
        else {
            goW();

            if(firstPersonView){
                globalTx = - simVars['mouse'].tx;
                globalTz = - 0.05 - simVars['mouse'].tz;
            }
        }
    }

    // A or a
    if (currentlyPressedKeys[65] || currentlyPressedKeys[97]){

        if(stopTimer) startTimer();

        if ( controlMode == 0 ) {
            constGoA();
        }
        else {
            goA();

            if(firstPersonView)
                fPVAngle = -(simVars['mouse'].angleYY-90);
        }
    }

    // S or s
    if (currentlyPressedKeys[83] || currentlyPressedKeys[115]){

        if(stopTimer) startTimer();

    	if ( controlMode == 0 ) {
            constGoS();
        }
        else {
            goS();

            if(firstPersonView){
                globalTx = - simVars['mouse'].tx;
                globalTz = - 0.05 - simVars['mouse'].tz;
            }
        }
    }

    // D or d
    if (currentlyPressedKeys[68] || currentlyPressedKeys[100]){

        if(stopTimer) startTimer();

        if ( controlMode == 0 ) {
            constGoD();
        }
        else {
            goD();

            if(firstPersonView)
                fPVAngle = -(simVars['mouse'].angleYY-90);
        }
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

    // Check if Shift is pressed
    if (currentlyPressedKeys[16] == true) {

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

    document.getElementById("slider").onchange = function(){
        animationSpeed = document.getElementById("slider").value;
    }

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

    var camera0 = document.getElementById("camera-0");
    var camera1 = document.getElementById("camera-1");
    var camera2 = document.getElementById("camera-2");

    camera0.addEventListener("click", function(){

        resetGlobalVars();
        // Free Camera
        globalAngleXX = 25.0;
        globalTy = -0.3;
        globalTz = -3.5;
        blockUserInput = false;
        firstPersonView = false;
    });
    camera1.addEventListener("click", function(){

        resetGlobalVars();
        // Top View
        globalAngleXX = 90.0;
        globalTz = -2.5;
        firstPersonView = false;
        blockUserInput = true;
    });
    camera2.addEventListener("click", function(){

        resetGlobalVars();
        // First Person View
        globalTx = - simVars['mouse'].tx;
        globalTy = -0.03;
        globalTz = - 0.05 - simVars['mouse'].tz;
        fPVAngle = -(simVars['mouse'].angleYY-90);
        blockUserInput = true;
        firstPersonView = true;
    });

    var control1 = document.getElementById("option-1");
    var control2 = document.getElementById("option-2");
    var control3 = document.getElementById("option-3");

    control1.addEventListener("click", function(){
        document.getElementById("run-button").disabled = true;
        document.getElementById("sample5").disabled = true;

        if(worker) {
            worker.terminate();
            worker = undefined;
        }

        controlMode = 0;
        resetTimer();
        resetAll();
    });


    control2.addEventListener("click", function(){
        document.getElementById("run-button").disabled = true;
        document.getElementById("sample5").disabled = true;

        if(worker) {
            worker.terminate();
            worker = undefined;
        }

        controlMode = 1;
        animationInProg = false;
    });

    control3.addEventListener("click", function(){
        document.getElementById("run-button").disabled = false;
        document.getElementById("sample5").disabled = false;

        controlMode = 2;
        resetAll();
    });

    document.getElementById("reset-button").onclick = function(){
        //Timer vars
        resetTimer();

        resetAll();
    };


    //https://stackoverflow.com/questions/10343913/how-to-create-a-web-worker-from-a-string
    document.getElementById("run-button").onclick = function(){

        if(mapLoaded && controlMode == 2){
            resetAll();

            resetTimer();
            if(stopTimer) startTimer();

            var script = document.getElementById("sample5").value;

            if(typeof(Worker) !== "undefined") {

                if(typeof(worker) != "undefined") {
                    worker.terminate();
                    worker = undefined;
                }

                var dataObj = `(
                    function workerFunction() {
                        function forward(){
                            self.postMessage({ move: "f", maze: maze });
                        }
                        function back(){
                            self.postMessage({ move: "b", maze: maze });
                        }
                        function left(){
                            self.postMessage({ move: "l", maze: maze });
                        }
                        function right(){
                            self.postMessage({ move: "r", maze: maze });
                        }
                        var self = this;
                        var maze = `+ JSON.stringify(scriptMaze) +`;
                        self.onmessage = function(e) {
                            var pathIsClear = e.data;
                            if(pathIsClear instanceof Array){
                                `+ script +`
                            }
                            self.postMessage({ move: "c", maze: maze });
                        }
                    })();`; // here is the trick to convert the above fucntion to string
                var blob = new Blob([dataObj.replace('"use strict";', '')]); // firefox adds "use strict"; to any function which might block worker execution so knock it off
                var blobURL = (window.URL ? URL : webkitURL).createObjectURL(blob, {
                    type: 'application/javascript; charset=utf-8'
                });

                worker = new Worker(blobURL);

                worker.onmessage = function(e) {
                    var val = e.data.move; // message received from worker
                    scriptMaze = e.data.maze;
                    if(val == 'f')
                        mouseMoveForward();
                    if(val == 'b')
                        mouseMoveBackwards();
                    if(val == 'r')
                        mouseRotate90(true);
                    if(val == 'l')
                        mouseRotate90(false);
                };
                worker.postMessage(checkWalls()); // Send data to our worker.

            } else {
                alert("Sorry, your browser does not support Web Workers...");
            }
        }
    };
}

function resetAll(){
    resetMap();
    resetAnimation();

    //reset Worker
    if(typeof(worker) != "undefined") {
        worker.terminate();
        worker = undefined;
    }

    marked = [];
    if(firstPersonView){ // reset camera
        resetGlobalVars();
        globalTx = - simVars['mouse'].tx;
        globalTy = - 0.03;
        globalTz = - 0.05 - simVars['mouse'].tz;
        fPVAngle = -(simVars['mouse'].angleYY-90);
    }
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
                tmpWalls[col/2] = [x, z, x - 0.066, z + 0.008, x + 0.066, z + 0.008, x + 0.066, z - 0.008, x - 0.066, z - 0.008 ];
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
                tmpWalls[col/2] = [x, z, x - 0.008, z + 0.066, x + 0.008, z + 0.066, x + 0.008, z - 0.066, x - 0.008, z - 0.066 ];
            }
            else {
                tmpWalls[col/2] = 10;
            }
        }
        simVars['wall']['ver'][line/2] = tmpWalls;
    }

    mapLoaded = true;
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
                x = wallOffset + halfWallLateral + lateral/16*(row/2);
                z = postOffset + lateral/16*line;
                tmpWalls[row/2] = [x, z, x - 0.066, z + 0.008, x + 0.066, z + 0.008, x + 0.066, z - 0.008, x - 0.066, z - 0.008 ];
            }
            else {
                tmpWalls[row/2] = 10;
            }
        }

        simVars['wall']['hor'][line] = tmpWalls;
    }

    // Vertical walls
    for(var line = 0; line < 16; line++){
        var tmpWalls = [];
        for(var row = 0; row < 33; row+=2){
            if (mapStringArray[line+1][row] == '|') {
                x =postOffset + lateral/16*(row/2);
                z = wallOffset + halfWallLateral + lateral/16*line;
                tmpWalls[row/2] = [x, z, x - 0.008, z + 0.066, x + 0.008, z + 0.066, x + 0.008, z - 0.066, x - 0.008, z - 0.066 ];
            }
            else {
                tmpWalls[row/2] = 10;
            }
        }

        simVars['wall']['ver'][line] = tmpWalls;
    }

    mapLoaded = true;
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
        gl.clearColor(0, 0, 0, 0.03);

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

    tick();     // Timer that controls the rendering / animation

    outputInfos();
}
