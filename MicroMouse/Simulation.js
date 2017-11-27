function resetMap(){
    // reset Mouse
    simVars['mouse'].tx = -0.94;
    simVars['mouse'].tz =  0.94;
    simVars['mouse'].angleYY = 90.0;
}

function isInside(point, verA, verB, verC, verD){
	return(
		 (point[0] >= verA[0] &&  point[1] <= verA[1])&&
	     (point[0] <= verB[0] &&  point[1] <= verB[1])&&
	     (point[0] <= verC[0] &&  point[1] >= verC[1])&&
	     (point[0] >= verD[0] &&  point[1] >= verD[1])
	)
}

function detectCollision(x, z){
    var row = Math.floor((simVars['mouse'].tz+1)/(2/16));
    var col = Math.floor((simVars['mouse'].tx+1)/(2/16));
    var horWalls = simVars['wall']['hor'];
    var verWalls = simVars['wall']['ver'];

    for (var i = 0; i <= 1; i++) {
        for (var j = -1; j <= 1; j++) {
            if(col+j<0 || col+j>15) continue;
            if(horWalls[row+i][col+j] == 10) continue;
            if( isInside([x, z], [horWalls[row+i][col+j][2],horWalls[row+i][col+j][3]], [horWalls[row+i][col+j][4],horWalls[row+i][col+j][5]], [horWalls[row+i][col+j][6],horWalls[row+i][col+j][7]], [horWalls[row+i][col+j][8],horWalls[row+i][col+j][9]]) )
                return true;
        }
    }

    for (var i = -1; i <= 1; i++) {
        for (var j = 0; j <= 1; j++) {
            if(row+i<0 || row+i>15) continue;
            if(verWalls[row+i][col+j] == 10) continue;
            if( isInside([x, z], [verWalls[row+i][col+j][2],verWalls[row+i][col+j][3]], [verWalls[row+i][col+j][4],verWalls[row+i][col+j][5]], [verWalls[row+i][col+j][6],verWalls[row+i][col+j][7]], [verWalls[row+i][col+j][8],verWalls[row+i][col+j][9]]) )
                return true;
        }
    }

    return false;
}

function wayIsClear(x, z){
    var check = true;
    row = Math.floor((simVars['mouse'].tz+1)/(2/16));
    col = Math.floor((simVars['mouse'].tx+1)/(2/16));
    horWalls = simVars['wall']['hor'];
    verWalls = simVars['wall']['ver'];

    if ( Math.round(simVars['mouse'].tx*1000)>Math.round(x*1000) && verWalls[row][col] != 10) {
        check = false;
    }
    if ( Math.round(simVars['mouse'].tx*1000)<Math.round(x*1000) && verWalls[row][col+1] != 10) {
        check = false;
    }

    if ( Math.round(simVars['mouse'].tz*1000)>Math.round(z*1000) && horWalls[row][col] != 10) {
        check = false;
    }
    if ( Math.round(simVars['mouse'].tz*1000)<Math.round(z*1000) && horWalls[row+1][col] != 10) {
        check = false;
    }
    return check;
}


// Returns if there is a wall at the left, front or right side of the mouse
function checkWalls(){
    var walls = [];
    if(!animationInProg){
        var angleY = simVars['mouse'].angleYY;
        var tX = simVars['mouse'].tx;
        var tZ = simVars['mouse'].tz;

        // check left wall
        walls[0] = wayIsClear(tX + (2/16) * Math.cos( radians(angleY + 90) ),
                              tZ - (2/16) * Math.sin( radians(angleY + 90) ));
        // check front wall
        walls[1] = wayIsClear(tX + (2/16) * Math.cos( radians(angleY) ),
                              tZ - (2/16) * Math.sin( radians(angleY) ));
        // check right wall
        walls[2] = wayIsClear(tX + (2/16) * Math.cos( radians(angleY - 90) ),
                              tZ - (2/16) * Math.sin( radians(angleY - 90) ));
    }
    return walls;
}

function constGoW(){
    mouseMoveFoward();
}
function constGoS(){
    mouseMoveBackwards();
}
function constGoA(){
    mouseRotate90(false);
}
function constGoD(){
    mouseRotate90(true);
}

//////////////////////////////////////////////////////////////////////////


function goW(){
    var angleY = simVars['mouse'].angleYY;
    var x = simVars['mouse'].tx + 0.0075 * Math.cos( radians(angleY) );
    var z = simVars['mouse'].tz - 0.0075 * Math.sin( radians(angleY) );

    if(!subW(angleY,x,z)) {      //if can't add both components to position
        x = simVars['mouse'].tx; //try adding only x
        if(!subW(angleY,x,z)) {  //if can't add x, add only y
            x = simVars['mouse'].tx + 0.0075 * Math.cos( radians(angleY) );
            z = simVars['mouse'].tz;
            subW(angleY,x,z);
        }
    }
}

function subW(angleY,x,z){

    var x1 = x + 0.028 * Math.cos( radians(angleY) );
    var z1 = z - 0.028 * Math.sin( radians(angleY) );
    x1 += 0.014 * Math.sin( radians(angleY) );
    z1 -= 0.014 * Math.cos( radians(angleY) );

    //
    var x2 = x + 0.028 * Math.cos( radians(angleY) );
    var z2 = z - 0.028 * Math.sin( radians(angleY) );
    x2 -= 0.014 * Math.sin( radians(angleY) );
    z2 += 0.014 * Math.cos( radians(angleY) );

    //
    var x3 = x + 0.042 * Math.cos( radians(angleY) );
    var z3 = z - 0.042 * Math.sin( radians(angleY) );

    if(!detectCollision(x1,z1)&&!detectCollision(x2,z2)&&!detectCollision(x3,z3)){
        // go up
        simVars['mouse'].tx = x;
        simVars['mouse'].tz = z;
        return true;
    }
    return false;
}

function goS(){
    var angleY = simVars['mouse'].angleYY
    var x = simVars['mouse'].tx - 0.0075 * Math.cos( radians(angleY) );
    var z = simVars['mouse'].tz + 0.0075 * Math.sin( radians(angleY) );

    if(!subS(angleY,x,z)) {
        x = simVars['mouse'].tx;
        if(!subS(angleY,x,z)) {
            x = simVars['mouse'].tx - 0.0075 * Math.cos( radians(angleY) );
            z = simVars['mouse'].tz;
            subS(angleY,x,z);
        }
    }

}

function subS(angleY,x,z){

    var x1 = x - 0.035 * Math.cos( radians(angleY) );
    var z1 = z + 0.035 * Math.sin( radians(angleY) );
    x1 -= 0.021 * Math.sin( radians(angleY) );
    z1 += 0.021 * Math.cos( radians(angleY) );

    //
    var x2 = x - 0.035 * Math.cos( radians(angleY) );
    var z2 = z + 0.035 * Math.sin( radians(angleY) );
    x2 += 0.021 * Math.sin( radians(angleY) );
    z2 -= 0.021 * Math.cos( radians(angleY) );

    //
    var x3 = x + 0.042 * Math.cos( radians(angleY) );
    var z3 = z + 0.042 * Math.sin( radians(angleY) );

    if(!detectCollision(x1,z1)&&!detectCollision(x2,z2)&&!detectCollision(x3,z3)){
        // go down
        simVars['mouse'].tx = x ;
        simVars['mouse'].tz = z ;
        return true;
    }
    return false;
}

function goA(){
    var angleY = simVars['mouse'].angleYY+2.0
    var x = simVars['mouse'].tx;
    var z = simVars['mouse'].tz;

    //
    var x1 = x + 0.028 * Math.cos( radians(angleY) );
    var z1 = z - 0.028 * Math.sin( radians(angleY) );
    x1 += 0.014 * Math.sin( radians(angleY) );
    z1 -= 0.014 * Math.cos( radians(angleY) );

    //
    var x2 = x + 0.028 * Math.cos( radians(angleY) );
    var z2 = z - 0.028 * Math.sin( radians(angleY) );
    x2 -= 0.014 * Math.sin( radians(angleY) );
    z2 += 0.014 * Math.cos( radians(angleY) );

    //
    var x3 = x - 0.035 * Math.cos( radians(angleY) );
    var z3 = z + 0.035 * Math.sin( radians(angleY) );
    x3 -= 0.021 * Math.sin( radians(angleY) );
    z3 += 0.021 * Math.cos( radians(angleY) );

    //
    var x4 = x - 0.035 * Math.cos( radians(angleY) );
    var z4 = z + 0.035 * Math.sin( radians(angleY) );
    x4 += 0.021 * Math.sin( radians(angleY) );
    z4 -= 0.021 * Math.cos( radians(angleY) );

    if(!detectCollision(x1,z1)&&!detectCollision(x2,z2)&&!detectCollision(x3,z3)&&!detectCollision(x4,z4)){
        simVars['mouse'].angleYY += 2.0;
        if(Math.abs(simVars['mouse'].angleYY) > 360)
            simVars['mouse'].angleYY %= 360;
    }
}

function goD(){
    var angleY = simVars['mouse'].angleYY-2.0
    var x = simVars['mouse'].tx;
    var z = simVars['mouse'].tz;

    //
    var x1 = x  + 0.028 * Math.cos( radians(angleY) );
    var z1 = z  - 0.028 * Math.sin( radians(angleY) );
    x1 += 0.014 * Math.sin( radians(angleY) );
    z1 -= 0.014 * Math.cos( radians(angleY) );

    //
    var x2 = x + 0.028 * Math.cos( radians(angleY) );
    var z2 = z - 0.028 * Math.sin( radians(angleY) );
    x2 -= 0.014 * Math.sin( radians(angleY) );
    z2 += 0.014 * Math.cos( radians(angleY) );

    //
    var x3 = x - 0.035 * Math.cos( radians(angleY) );
    var z3 = z + 0.035 * Math.sin( radians(angleY) );
    x3 -= 0.021 * Math.sin( radians(angleY) );
    z3 += 0.021 * Math.cos( radians(angleY) );

    //
    var x4 = x - 0.035 * Math.cos( radians(angleY) );
    var z4 = z + 0.035 * Math.sin( radians(angleY) );
    x4 += 0.021 * Math.sin( radians(angleY) );
    z4 -= 0.021 * Math.cos( radians(angleY) );

    if(!detectCollision(x1,z1)&&!detectCollision(x2,z2)&&!detectCollision(x3,z3)&&!detectCollision(x4,z4)){
        simVars['mouse'].angleYY -= 2.0;
        if(Math.abs(simVars['mouse'].angleYY) > 360)
            simVars['mouse'].angleYY %= 360;
    }
}
