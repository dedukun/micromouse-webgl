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

	for (var i = 0; i <= 5; i++) {
		if (horWalls[i] == 10) continue;
		if( isInside([x,z], [horWalls[i][0],horWalls[i][1]], [horWalls[i][2],horWalls[i][3]], [horWalls[i][4],horWalls[i][5]], [horWalls[i][6],horWalls[i][7]]))
			return true;
	}

	for (var i = 0; i <= 5; i++) {
		if (verWalls[i] == 10) continue;
		if( isInside([x,z], [verWalls[i][0],verWalls[i][1]], [verWalls[i][2],verWalls[i][3]], [verWalls[i][4],verWalls[i][5]], [verWalls[i][6],verWalls[i][7]]))
			return true;
	}

	return false;
}

function goW(){
	var angleY = simVars['mouse'].angleYY;
    var x = simVars['mouse'].tx + 0.0075 * Math.cos( radians(angleY) );
    var z = simVars['mouse'].tz - 0.0075 * Math.sin( radians(angleY) );

    if(!subW(angleY,x,z)) {
    	x = simVars['mouse'].tx;
    	if(!subW(angleY,x,z)) {
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
    var x3 = x 	+ 0.042 * Math.cos( radians(angleY) );
    var z3 = z 	- 0.042 * Math.sin( radians(angleY) );

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
    }
}