(function() {

    function saveTextAsFile(fileNameToSaveAs, textToSave) {
	var textToSaveAsBlob = new Blob([textToSave], {type:"text/plain"});
	var textToSaveAsURL = window.URL.createObjectURL(textToSaveAsBlob);

	var downloadLink = document.createElement("a");
	downloadLink.download = fileNameToSaveAs;
	downloadLink.innerHTML = "Download File";
	downloadLink.href = textToSaveAsURL;
	downloadLink.onclick = function destroyClickedElement(event) {
	    document.body.removeChild(event.target);
	};
	downloadLink.style.display = "none";
	document.body.appendChild(downloadLink);

	downloadLink.click();
    }
    function loadFileAsText(fileToLoad, onload) {
	var fileReader = new FileReader();
	fileReader.onload = onload;
	fileReader.readAsText(fileToLoad, "UTF-8");
    }

    function sortObj(obj) {
	var temp_array = [];
	for (var key in obj) {
	    if (obj.hasOwnProperty(key)) {
		temp_array.push(key);
	    }
	}
	temp_array.sort();
	var temp_obj = {};
	for (var i=0; i<temp_array.length; i++) {
	    temp_obj[temp_array[i]] = obj[temp_array[i]];
	}
	return temp_obj;
    };

    var svgSpriteLever = "c 0,0 24.392087,19.72517 36.180844,54.66167 0,0 48.236745,-30.38694 50.617265,-27.46066 13.22774,16.26033 -2.13336,46.45082 -1.94161,63.80264 0.14492,13.11371 2.54331,25.66832 12.12811,41.90993 2.16927,3.67587 6.06061,-1.1205 4.33431,-4.78877 -3.63415,-7.7223 -17.6519,-25.84293 -0.90925,-64.0124 6.02747,-13.74129 1.27891,-27.63638 1.03513,-39.83038 -0.25802,-12.90538 4.23583,-16.17481 4.0553,-27.93207 -0.17944,-11.686206 -4.60483,-28.102606 -7.97309,-30.333313 -3.07478,-2.036354 -9.1407,-2.063158 -12.07717,-0.758219 -7.23781,3.216404 -8.52361,17.896966 -16.42196,28.01355 -3.415642,4.374902 -10.491978,9.350212 -22.103999,8.780002 -13.58177,0.24058 -27.395276,-5.03101 -46.92388,-2.05198 z";

    var glob = {
	bike: {
	    // xy measurements
	    //"offsetX": 100, //
	    //"offsetY": 100, //
	    //"bottomBracketY": , //
	    //"bottomBracketX": , //
	    //"seatTubeTopCenterY": 789, //
	    //"seatTubeTopCenterX": 588, //
	    //"saddleTopY": 988, //
	    //"saddleBackX": 401, //
	    //"hubY": 0, //
	    //"backHubX": , //
	    //"frontHubX": , //
	    //"headTubeTopCenterY": 790, //
	    //"headTubeTopCenterX": 1200, //
	    //"headTubeBottomCenterY": 690, //
	    //"headTubeBottomCenterX": 1220, //
	    //"handlebarTopY": 905,
	    //"handlebarBackX": 1200,
	    //"hoodsRestTopX": 1344, //
	    //"hoodsRestTopY": 866, //

	    // geometry chart measurements
	    //"topTubeHorizontal": 545, //
	    "wheelBase": 991, //
	    //"bottomBracketToFrontHub": , //
	    //"stack": , //
	    //"reach": , //
	    "bottomBracketDrop": 66, //
	    //"bottomBracketHeight": , //

	    // fit measurements
	    //"saddleTopToBottomBracket": 747, //

	    // component measurements
	    "wheelRadius": 340, //
	    "handlebarDiameter": 31.8, //
	    //"stemToHoodsAngle": , //
	    //"handlebarAndHoodsReach": , //
	    "stemLength": 110,
	    "stemAngle": 6,
	    "stemStack": 40,
	    "headsetBottomStack": 10, //
	    "headsetTopStack": 20,
	    "headsetSpacersStack": 10,
	    "saddleLength": 275, //
	    "saddleStack": 40, //
	    "saddleAngle": 2, //
	    //"saddleFrontToCenter": 150, //
	    "seatpostSetback": 25, //

	    // fork
	    "forkLength": 350, //
	    "forkRake": 45, //

	    // tube measurements
	    "topTubeCenterToCenter": 545,
	    "seatTubeCenterToTop": 540, //
	    "headTubeLength": 125,
	    "chainStayLength": 406, //
	    "seatTubeTopToTopTubeCenter": 70, //
	    "headTubeTopToTopTubeCenter": 30, //

	    //"trail": 0, //

	    "seatTubeAngle": 74, //
	    "headTubeAngle": 72, //
	    "crankLength": 172.5 //
	},
	undoHistory: [],
	shadowUndoHistory: [],
	shadowBike: {},
	lastHashBike: undefined,
	suppressHashChange: 0,
    };

    function normalizeBikeMeasurements(b) {
	var tx, ty, th;

	// wheels and bottom bracket
	if (b.backHubX === undefined) {
	    if (b.offsetX === undefined) {
		b.offsetX = 0;
	    }
	    if (b.wheelRadius === undefined) {
		b.wheelRadius = 340;
	    }
	    b.backHubX = b.offsetX + b.wheelRadius;
	}
	if (b.offsetX === undefined) {
	    if (b.wheelRadius === undefined) {
		b.wheelRadius = b.backHubX;
	    }
	    b.offsetX = b.backHubX - b.wheelRadius;
	}
	b.wheelRadius = b.backHubX - b.offsetX;
	if (b.hubY === undefined) {
	    if (b.offsetY === undefined) {
		b.offsetY = 4;
	    }
	    b.hubY = b.offsetX + b.wheelRadius;
	}
	if (b.offsetY === undefined) {
	    b.offsetY = b.hubY - b.wheelRadius;
	}

	if (!b.bottomBracketY) {
	    if (b.bottomBracketDrop === undefined) {
		if (b.bottomBracketHeight === undefined) {
		    b.bottomBracketDrop = 70;
		} else {
		    b.bottomBracketDrop = b.hubY - b.bottomBracketHeight - b.offsetY;
		}
	    }
	    b.bottomBracketY = b.hubY - b.bottomBracketDrop;
	}
	b.bottomBracketDrop = b.hubY - b.bottomBracketY;
	b.bottomBracketHeight = b.hubY - b.bottomBracketDrop - b.offsetY;
	if (!b.bottomBracketX) {
	    if (b.chainStayLength === undefined) {
		b.chainStayLength = 410;
	    }
	    b.bottomBracketX = b.backHubX + Math.sqrt(b.chainStayLength * b.chainStayLength - b.bottomBracketDrop * b.bottomBracketDrop);
	}
	tx = b.bottomBracketX - b.backHubX;
	b.chainStayLength = Math.sqrt(tx * tx + b.bottomBracketDrop * b.bottomBracketDrop);

	// seattube and saddle
	if (b.seatTubeTopCenterX === undefined) {
	    if (b.seatTubeAngle === undefined) {
		b.seatTubeAngle = 74;
	    }
	    if (b.seatTubeCenterToTop === undefined) {
		b.seatTubeCenterToTop = 520;
	    }
	    var cosSTAngle = Snap.cos(b.seatTubeAngle);
	    b.seatTubeTopCenterX = b.bottomBracketX - b.seatTubeCenterToTop * cosSTAngle;
	}
	if (b.seatTubeTopCenterY === undefined) {
	    if (b.seatTubeAngle !== undefined) {
		tx = b.bottomBracketX - b.seatTubeTopCenterX;
		var tanSTAngle = Snap.tan(b.seatTubeAngle);
		ty = tanSTAngle * tx;
		b.seatTubeTopCenterY = ty + b.bottomBracketY;
	    } else if (b.seatTubeCenterToTop !== undefined) {
		tx = b.bottomBracketX - b.seatTubeTopCenterX;
		th = b.seatTubeCenterToTop;
		ty = Math.sqrt(th * th - tx * tx);
		b.seatTubeTopCenterY = ty + b.bottomBracketY;
	    }
	}
	tx = b.bottomBracketX - b.seatTubeTopCenterX;
	ty = b.seatTubeTopCenterY - b.bottomBracketY;
	b.seatTubeAngle = Snap.deg(Math.atan2(ty, tx));
	if (b.seatTubeCenterToTop === undefined) {
	    tx = b.bottomBracketX - b.seatTubeTopCenterX;
	    ty = b.seatTubeTopCenterY - b.bottomBracketY;
	    b.seatTubeCenterToTop = Math.sqrt(ty * ty + tx * tx);
	}
	if (b.seatpostSetback === undefined) {
	    b.seatpostSetback = 25;
	}
	if (b.saddleLength === undefined) {
	    b.saddleLength = 280;
	}
	if (b.saddleStack === undefined) {
	    b.saddleStack = 40;
	}
	if (b.saddleAngle === undefined) {
	    b.saddleAngle = 0;
	}
	if (b.saddleFrontToCenter === undefined) {
	    b.saddleFrontToCenter = Math.round(b.saddleLength * 0.55 / 10) * 10;
	}
	var saddleCToBack = b.saddleLength - b.saddleFrontToCenter;
	var cosSAngle = Snap.cos(b.saddleAngle);
	var saddleCX;
	if (b.saddleBackX === undefined) {
	    // assume saddle center is on axis of seat tube
	    if (b.saddleTopY === undefined) {
		if (b.saddleTopToBottomBracket === undefined) {
		    b.saddleTopToBottomBracket = b.seatTubeCenterToTop + 210;
		}
		b.saddleTopY = Snap.sin(b.seatTubeAngle) * b.saddleTopToBottomBracket + b.bottomBracketY;
	    }
	    saddleCX = b.bottomBracketX - Snap.cos(b.seatTubeAngle) * b.saddleTopToBottomBracket;
	    b.saddleBackX = saddleCX - Snap.cos(b.saddleAngle) * saddleCToBack;
	}
	saddleCX = b.saddleBackX + cosSAngle * saddleCToBack;
	if (b.saddleTopY === undefined) {
	    if (b.saddleTopToBottomBracket === undefined) {
		// assume saddle center is on axis of seat tube
		var tanSTAngle = Snap.tan(b.seatTubeAngle);
		var seatTubeFloorX = b.bottomBracketX + b.bottomBracketY / tanSTAngle;
		tx = seatTubeFloorX - saddleCX;
		b.saddleTopY = tanSTAngle * tx;
	    } else {
		tx = b.bottomBracketX - saddleCX;
		th = b.saddleTopToBottomBracket;
		b.saddleTopY = b.bottomBracketY + Math.sqrt(th * th - tx * tx);
	    }
	}
	tx = b.bottomBracketX - saddleCX;
	ty = b.saddleTopY - b.bottomBracketY;
	b.saddleTopToBottomBracket = Math.sqrt(ty * ty + tx * tx);

	// wheelbase
	if (b.frontHubX === undefined) {
	    if (b.wheelBase === undefined) {
		if (b.bottomBracketToFrontHub === undefined) {
		    b.wheelBase = 995;
		} else {
		    ty = b.bottomBracketDrop;
		    th = b.bottomBracketToFrontHub;
		    b.wheelBase = b.bottomBracketX - b.backHubX + Math.sqrt(th * th - ty * ty);
		}
	    }
	    b.frontHubX = b.backHubX + b.wheelBase;
	}
	b.wheelBase = b.frontHubX - b.backHubX;
	if (b.bottomBracketToFrontHub === undefined) {
	    ty = b.bottomBracketDrop;
	    tx = b.frontHubX - b.bottomBracketX;
	    b.bottomBracketToFrontHub = Math.sqrt(tx * tx + ty * ty);
	}

	// toptube, headtube and fork
	if (b.seatTubeTopToTopTubeCenter == undefined) {
	    b.seatTubeTopToTopTubeCenter = 30;
	}
	if (b.headTubeTopToTopTubeCenter == undefined) {
	    b.headTubeTopToTopTubeCenter = 30;
	}

	if ((b.headTubeTopCenterX === undefined || b.headTubeTopCenterY === undefined) &&
	    b.reach !== undefined && b.stack !== undefined)
	{
	    b.headTubeTopCenterX = b.bottomBracketX + b.reach;
	    b.headTubeTopCenterY = b.bottomBracketY + b.stack;
	}

	function assignHeadLengths(totLen) {
	    if (b.headTubeLength !== undefined && b.forkLength !== undefined && b.headsetBottomStack !== undefined) {
		b.headsetBottomStack = undefined;
	    }
	    if (b.headTubeLength === undefined) {
		if (b.headsetBottomStack === undefined) {
		    b.headsetBottomStack = 2;
		}
		if (b.forkLength !== undefined) {
		    b.headTubeLength = totLen - b.forkLength - b.headsetBottomStack;
		}
	    }
	    if (b.forkLength === undefined) {
		if (b.headsetBottomStack === undefined) {
		    b.headsetBottomStack = 2;
		}
		b.forkLength = totLen - b.headTubeLength - b.headsetBottomStack;
	    }
	    if (b.headsetBottomStack === undefined) {
		b.headsetBottomStack = totLen - b.forkLength - b.headTubeLength;
		if (b.headsetBottomStack < 0) {
		    b.headsetBottomStack = 0;
		    b.forkLength = totLen - b.headTubeLength - b.headsetBottomStack;
		    if (b.forkLength < 0) {
			b.forkLength = 0.5 * totLen;
			b.headTubeLength = 0.5 * totLen;
		    }
		}
	    }
	}

	if (b.headTubeTopCenterX === undefined) {
	    if (b.topTubeHorizontal !== undefined) {
		b.headTubeTopCenterX = b.seatTubeTopCenterX + b.topTubeHorizontal;
	    } else if (b.topTubeCenterToCenter !== undefined) {
		b.headTubeTopCenterX = b.seatTubeTopCenterX + b.topTubeCenterToCenter;
	    }
	    if (b.headTubeTopCenterX === undefined && b.headTubeTopCenterY === undefined) {
		if (b.headTubeLength === undefined) {
		    b.headTubeLength = 140;
		}
		if (b.headTubeAngle === undefined) {
		    b.headTubeAngle = 72;
		}
		if (b.forkLength === undefined) {
		    b.forkLength = 370;
		}
		if (b.forkRake === undefined) {
		    b.forkRake = 45;
		}
		if (b.headsetBottomStack === undefined) {
		    b.headsetBottomStack = 2;
		}
		var angle = 90 - b.headTubeAngle;
		var totLen = b.forkLength + b.headsetBottomStack + b.headTubeLength;
		th = b.forkRake;
		tx = th * Snap.cos(angle);
		ty = th * Snap.sin(angle);
		var x = b.frontHubX - tx;
		var y = b.hubY - ty;
		tx = totLen * Snap.cos(b.headTubeAngle);
		ty = totLen * Snap.sin(b.headTubeAngle);
		b.headTubeTopCenterX = x - tx;
		b.headTubeTopCenterY = y + ty;
		totLen = b.forkLength + b.headsetBottomStack;
		tx = totLen * Snap.cos(b.headTubeAngle);
		ty = totLen * Snap.sin(b.headTubeAngle);
		b.headTubeBottomCenterX = x - tx;
		b.headTubeBottomCenterY = y + ty;
	    } else if (b.headTubeTopCenterY === undefined) {
		tx = b.frontHubX - b.headTubeTopCenterX;
		if (b.headTubeAngle === undefined) {
		    if (b.headTubeLength === undefined) {
			b.headTubeLength = 125;
		    }
		    if (b.headsetBottomStack === undefined) {
			b.headsetBottomStack = 2;
		    }
		    if (b.forkLength === undefined) {
			b.forkLength = 370;
		    }
		    var totLen = b.headTubeLength + b.headsetBottomStack + b.forkLength;
		    if (b.forkRake === undefined) {
			b.forkRake = 45;
		    }
		    th = Math.sqrt(totLen * totLen + b.forkRake * b.forkRake);
		    var ty = Math.sqrt(th*th-tx*tx);
		    var a2 = Snap.deg(Math.atan2(tx, ty));
		    var a1 = Snap.asin(b.forkRake / th);
		    b.headTubeAngle = 90 - (a2 - a1);
		    b.headTubeTopCenterY = ty + b.hubY;
		} else if (b.forkRake === undefined) {
		    if (b.headTubeLength === undefined) {
			b.headTubeLength = 125;
		    }
		    if (b.headsetBottomStack === undefined) {
			b.headsetBottomStack = 2;
		    }
		    if (b.forkLength === undefined) {
			b.forkLength = 370;
		    }
		    var totLen = b.headTubeLength + b.headsetBottomStack + b.forkLength;
		    //T*T+r*r=x*x+y*y,T*sin(a)=r*sin(%pi/2-a)+y
		    var T = totLen;
		    var cos_a = Snap.cos(b.headTubeAngle);
		    var cos_a_sq = cos_a * cos_a;
		    var sin_a = Snap.sin(b.headTubeAngle);
		    var sin_a_sq = sin_a * sin_a;
		    var x = tx;
		    b.forkRake = -(Math.sqrt((1-cos_a_sq)*x*x+T*T*sin_a_sq+T*T*cos_a_sq-T*T)-T*cos_a*sin_a)/(cos_a_sq-1);
		    ty = -(T*sin_a-cos_a*Math.sqrt((-cos_a_sq*x*x)+x*x+T*T*sin_a_sq+T*T*cos_a_sq-T*T))/(cos_a_sq-1)
		    b.headTubeTopCenterY = ty + b.hubY;
		} else {
		    var cos_a = Snap.cos(b.headTubeAngle);
		    var cos_a_sq = cos_a * cos_a;
		    var sin_a = Snap.sin(b.headTubeAngle);
		    var sin_a_sq = sin_a * sin_a;
		    var r = b.forkRake;
		    var x = tx;
		    var totLen = -(Math.sqrt((1-sin_a_sq)*x*x+(sin_a_sq+cos_a_sq-1)*r*r)-cos_a*sin_a*r)/(sin_a_sq-1);
		    ty = (cos_a*r-sin_a*Math.sqrt((-sin_a_sq*x*x)+x*x+sin_a_sq*r*r+cos_a_sq*r*r-r*r))/(sin_a_sq-1);
		    b.headTubeTopCenterY = ty + b.hubY;
		    assignHeadLengths(totLen);
		}
	    }
	}

	// we require headtube coordinates to be set both X and Y if set
	if (b.headTubeTopCenterX !== undefined && b.headTubeTopCenterY !== undefined) {
	    if (b.headTubeBottomCenterX !== undefined && b.headTubeBottomCenterY !== undefined) {
		tx = b.headTubeBottomCenterX - b.headTubeTopCenterX;
		ty = b.headTubeTopCenterY - b.headTubeBottomCenterY;
		b.headTubeLength = Math.sqrt(tx * tx + ty * ty);
		b.headTubeAngle = Snap.deg(Math.atan2(ty, tx));
		b.forkRake = undefined;
	    } else {
		b.headTubeBottomCenterX = undefined;
		b.headTubeBottomCenterY = undefined;
	    }
	    tx = b.frontHubX - b.headTubeTopCenterX;
	    ty = b.headTubeTopCenterY - b.hubY;
	    th = Math.sqrt(tx*tx+ty*ty);
	    var a2 = Snap.deg(Math.atan2(tx, ty));
	    if (b.headTubeAngle === undefined) {
		if (b.forkRake === undefined) {
		    b.forkRake = 45;
		}
		var a1 = Snap.asin(b.forkRake / th);
		b.headTubeAngle = 90 - (a2 - a1);
	    }
	    var a3 = a2 - (90 - b.headTubeAngle);
	    if (b.forkRake === undefined) {
		var ttx = ty / Snap.tan(b.headTubeAngle);
		b.forkRake = (tx - ttx) * Snap.cos(90 - b.headTubeAngle);
		b.forkRake = th * Snap.sin(a3);
	    }
	    var totLen = th * Snap.cos(a3);
	    assignHeadLengths(totLen);
	}
	if (b.headTubeBottomCenterX === undefined || b.headTubeBottomCenterY === undefined) {
	    tx = b.headTubeLength * Snap.cos(b.headTubeAngle);
	    ty = b.headTubeLength * Snap.sin(b.headTubeAngle);
	    b.headTubeBottomCenterX = b.headTubeTopCenterX + tx;
	    b.headTubeBottomCenterY = b.headTubeTopCenterY - ty;
	}

	{
	    b.stack = b.headTubeTopCenterY - b.bottomBracketY;
	    b.reach = b.headTubeTopCenterX - b.bottomBracketX;
	    var angle = 90 - b.seatTubeAngle;
	    ty = b.headTubeTopCenterY - b.seatTubeTopCenterY;
	    b.topTubeHorizontal = b.headTubeTopCenterX - b.seatTubeTopCenterX + ty * Snap.tan(angle);
	    var cosSTAngle = Snap.cos(b.seatTubeAngle);
	    var sinSTAngle = Snap.sin(b.seatTubeAngle);
	    var cosHTAngle = Snap.cos(b.headTubeAngle);
	    var sinHTAngle = Snap.sin(b.headTubeAngle);
	    var ttx = b.headTubeTopToTopTubeCenter * cosHTAngle + b.headTubeTopCenterX - (b.seatTubeTopToTopTubeCenter * cosSTAngle + b.seatTubeTopCenterX);
	    var tty = b.headTubeTopCenterY - b.headTubeTopToTopTubeCenter * sinHTAngle - (b.seatTubeTopCenterY - b.seatTubeTopToTopTubeCenter * sinSTAngle);
	    b.topTubeCenterToCenter = Math.sqrt(ttx * ttx + tty * tty);

	    tx = (b.headTubeTopCenterY - b.offsetY) / Snap.tan(b.headTubeAngle);
	    b.trail = b.headTubeTopCenterX + tx - b.frontHubX;
	}

	if (b.handlebarDiameter === undefined) {
	    b.handlebarDiameter = 31.8;
	}
	if (b.stemAngle === undefined) {
	    b.stemAngle = 6;
	}
	if (b.stemStack === undefined) {
	    b.stemStack = 40;
	}
	if (b.headsetSpacersStack === undefined) {
	    b.headsetSpacersStack = 10;
	}
	if (b.headsetTopStack === undefined) {
	    b.headsetTopStack = 10;
	}
	if (b.handlebarBackX !== undefined && b.handlebarTopY !== undefined) {
	    if (b.stemAngle === undefined) {
		b.stemAngle = 6;
	    }
	    var stemAbsAngle = 90 - b.headTubeAngle - b.stemAngle;
	    var stemFrontX = b.handlebarBackX + b.handlebarDiameter * 0.5;
	    var stemFrontY = b.handlebarTopY - b.handlebarDiameter * 0.5;

	    var T = Snap.tan(stemAbsAngle);
	    var U = Snap.tan(90-b.headTubeAngle);
	    var Y = stemFrontY - b.headTubeTopCenterY;
	    var X = stemFrontX - b.headTubeTopCenterX;
	    // y + x = Y
	    // y / T = X + U * x
	    tx = (Y-T*X)/(T*U+1);
	    ty = (T*U*Y+T*X)/(T*U+1)
	    var stemBackY = b.headTubeTopCenterY + tx;
	    var stemBackX = b.headTubeTopCenterX - U * tx;

	    tx = stemFrontX - stemBackX;
	    ty = stemFrontY - stemBackY;
	    b.stemLength = Math.sqrt(tx*tx+ty*ty);
	    tx = b.headTubeTopCenterX - stemBackX;
	    ty = b.headTubeTopCenterY - stemBackY;
	    th = Math.sqrt(tx*tx+ty*ty);
	    if (th >= b.stemStack/2 + b.headsetTopStack) {
		b.headsetSpacersStack = th - b.stemStack/2 - b.headsetTopStack;
	    } else if (th >= b.stemStack/2) {
		b.headsetSpacersStack = 0;
		b.headsetTopStack = th - b.stemStack/2;
	    } else {
		b.headsetSpacersStack = 0;
		b.headsetTopStack = 0;
		b.stemStack = 2 * th;
	    }
	    if (b.stemStack <= 0) {
		b.stemStack = 1;
	    }
	}
	{ // always calculate handlebar XY as it may have to be normalized
	    th = b.headsetTopStack + b.headsetSpacersStack + b.stemStack * 0.5;
	    tx = th * Snap.cos(b.headTubeAngle);
	    ty = th * Snap.sin(b.headTubeAngle);
	    var stemBackX = b.headTubeTopCenterX - tx;
	    var stemBackY = b.headTubeTopCenterY + ty;
	    var stemAbsAngle = 90 - b.headTubeAngle - b.stemAngle;
	    if (b.handlebarBackX === undefined) {
		if (b.stemLength === undefined) {
		    b.stemLength = 110;
		}
	    } else {
		tx = b.handlebarBackX + b.handlebarDiameter * 0.5 - stemBackX;
		b.stemLength = tx / Snap.cos(stemAbsAngle);
	    }
	    th = b.stemLength;
	    tx = th * Snap.cos(stemAbsAngle);
	    ty = th * Snap.sin(stemAbsAngle);
	    b.handlebarTopY = stemBackY + ty + b.handlebarDiameter * 0.5;
	    b.handlebarBackX = stemBackX + tx - b.handlebarDiameter * 0.5;
	}

	if (b.hoodsRestTopX === undefined || b.hoodsRestTopY === undefined) {
	    if (b.handlebarAndHoodsReach === undefined) {
		b.handlebarAndHoodsReach = 116;
	    }
	    if (b.stemToHoodsAngle === undefined) {
		b.stemToHoodsAngle = -2;
	    }
	    th = b.handlebarAndHoodsReach;
	    tx = th * Snap.cos(b.stemToHoodsAngle);
	    ty = th * Snap.sin(b.stemToHoodsAngle);
	    b.hoodsRestTopX = b.handlebarBackX + b.handlebarDiameter * 0.5 + tx;
	    b.hoodsRestTopY = b.handlebarTopY - ty;
	} else {
	    tx = b.hoodsRestTopX - b.handlebarBackX - b.handlebarDiameter * 0.5;
	    ty = b.handlebarTopY - b.hoodsRestTopY;
	    b.stemToHoodsAngle = Snap.deg(Math.atan2(ty, tx));
	    b.handlebarAndHoodsReach = Math.sqrt(tx*tx + ty*ty);
	}

	if (b.crankLength === undefined) {
	    b.crankLength = 172.5;
	}

	if (b.name === undefined) {
	    b.name = "Unnamed";
	}
    }

    function humpbackToSpaces(str) {
	out = "";
	for (var i = 0, len = str.length; i < len; i++) {
	    var c = str.charAt(i);
	    if (c == c.toUpperCase()) {
		out += " " + c.toLowerCase();
	    } else {
		out += c;
	    }
	}
	return out;
    }

    function makeMeasHelpText(editName) {
	var text = humpbackToSpaces(editName);
	var extra;

	// some measurements get additional explanation
	if (editName == "handlebarDiameter" ||
	    editName == "handlebarBackX" ||
	    editName == "handlebarTopY")
	{
	    extra = "at the stem";
	} else if (editName == "stemAngle") {
	    extra = "positive angle is down";
	} else if (editName == "saddleAngle") {
	    extra = "positive angle is lower nose";
	} else if (editName == "saddleBackX") {
	    extra = "closest point, not necessarily center depending on shape";
	} else if (editName == "saddleLength") {
	    extra = "full length as seen from side";
	} else if (editName == "saddleFrontToCenter") {
	    extra = "sit position";
	} else if (editName == "offsetX") {
	    extra = "to outer wheel diameter";
	} else if (editName == "offsetY") {
	    extra = "distance from floor to real ground level when bike is ridden";
	} else if (editName == "wheelRadius") {
	    extra = "outer, with inflated tire";
	} else if (editName == "topTubeHorizontal") {
	    extra = "from head tube top horizontally back to center of seattube/seatpost";
	} else if (editName == "topTubeEffective") {
	    extra = "from top tube front horizontally back to center of seattube/seatpost";
	} else if (editName == "bottomBracketHeight") {
	    extra = "includes height of inflated tires";
	} else if (editName == "hoodsRestTopX" || editName == "hoodsRestTopY") {
	    extra = "where the purlicue rests";
	} else if (editName == "handlebarAndHoodsReach") {
	    extra = "typical hoods only: 36mm";
	} else if (editName == "saddleFrontToHandlebarCenter") {
	    extra = "horizontal";
	} else if (editName == "steeringLength") {
	    extra = "along head tube angle";
	} else if (editName == "standoverHeight") {
	    extra = "to center of top tube, add radius for full height";
	}
	return text + (extra ? " (" + extra + ")" : "");
    }

    function setEditNumAttr(input, editName) {
	var b = glob.bike;
	var step = 1;
	var min = 0;
	var max = 2000;
	var tx, ty;
	if (editName == "handlebarDiameter") {
	    step = 0.1;
	} else if (editName == "crankLength") {
	    step = 0.1;
	    min = 120;
	    max = 200;
	} else if (editName == "offsetX" || editName == "offsetY") {
	    min = 0;
	    max = 500;
	} else if (editName == "backHubX") {
	    min = b.offsetX + 200;
	    max = b.offsetX + 500;
	} else if (editName == "wheelRadius") {
	    min = 200;
	    max = 500;
	} else if (editName == "frontHubX" ||
		   editName == "handlebarBackX" ||
		   editName == "headTubeTopCenterX" ||
		   editName == "headTubeBottomCenterX" ||
		   editName == "hoodsRestTopX")
	{
	    min = b.bottomBracketX + 200;
	    max = b.bottomBracketX + 1000;
	} else if (editName == "hubY") {
	    min = b.offsetY + 200;
	    max = b.offsetY + 500;
	} else if (editName == "seatTubeTopCenterX") {
	    min = b.backHubX + 100;
	    max = b.bottomBracketX + 200;
	} else if (editName == "saddleBackX") {
	    min = b.offsetX + 100;
	    max = b.bottomBracketX + 500;
	} else if (editName == "saddleLength") {
	    min = 100;
	    max = 400;
	} else if (editName == "saddleFrontToCenter") {
	    min = 10;
	    max = 390;
	} else if (editName == "saddleStack" || editName == "seatpostSetback") {
	    min = 0;
	    max = 200;
	} else if (editName == "saddleAngle") {
	    min = -30;
	    max = 30;
	} else if (editName == "bottomBracketX") {
	    min = b.offsetX + 100;
	    max = 1500;
	} else if (editName == "bottomBracketY") {
	    min = b.offsetY;
	    max = b.offsetY + 600;
	} else if (editName == "saddleTopY" || editName == "seatTubeTopCenterY") {
	    min = b.bottomBracketY + 200;
	    max = 1800;
	} else if (editName == "chainStayLength" || editName == "chainStayLengthHorizontal") {
	    min = 200;
	    max = 700;
	} else if (editName == "bottomBracketToFrontHub" || editName == "bottomBracketToFrontHubHorizontal") {
	    min = 200;
	    max = 1200;
	} else if (editName == "seatTubeCenterToTop") {
	    min = 100;
	    max = 1500;
	} else if (editName == "seatTubeTopToTopTubeCenter" || editName == "headTubeTopToTopTubeCenter") {
	    min = 0;
	    max = 1000;
	} else if (editName == "wheelBase") {
	    min = 500;
	    max = 2000;
	} else if (editName == "seatTubeAngle") {
	    min = 50;
	    max = 89;
	} else if (editName == "headTubeAngle") {
	    min = 40;
	    max = 100;
	} else if (editName == "stack" || editName == "reach" || editName == "topTubeEffective" || editName == "topTubeHorizontal" || editName == "topTubeCenterToCenter") {
	    min = 200;
	    max = 1200;
	} else if (editName == "headTubeLength") {
	    min = 40;
	    max = 400;
	} else if (editName == "headsetBottomStack" || editName == "headsetTopStack" || editName == "headsetSpacersStack") {
	    min = 0;
	    max = 300;
	} else if (editName == "handlebarDiameter") {
	    min = 10;
	    max = 50;
	} else if (editName == "stemStack") {
	    min = 5;
	    max = 100;
	} else if (editName == "stemAngle") {
	    min = -260;
	    max = 80;
	} else if (editName == "stemToHoodsAngle") {
	    min = -80;
	    max = 80;
	} else if (editName == "stemLength" || editName == "handlebarAndHoodsReach") {
	    min = 0;
	    max = 300;
	} else if (editName == "forkRake") {
	    min = 0;
	    max = 200;
	} else if (editName == "forkLength" || editName == "forkLengthDiagonal") {
	    min = 200;
	    max = 600;
	} else if (editName == "saddleTopToBottomBracket") {
	    tx = b.bottomBracketX - b.seatTubeTopCenterX;
	    ty = b.bottomBracketY - b.seatTubeTopCenterY;
	    min = Math.floor(Math.sqrt(tx*tx+ty*ty) + b.saddleStack + 1.5 * b.seatpostSetback) + 15;
	    max = 1200;
	} else if (editName == "seatpostExtension") {
	    min = Math.floor(1.5 * b.seatpostSetback) + 15;
	    max = 1000;
	} else if (editName == "saddleFrontToBottomBracket") {
	    min = 0;
	    max = 300;
	} else if (editName == "saddleTopToHandlebarTop") {
	    min = 0;
	    max = Math.floor(b.saddleTopY - b.handlebarTopY + b.headsetSpacersStack / Snap.sin(b.headTubeAngle) - 2); // approx
	} else if (editName == "saddleTopToHoodsRest") {
	    min = 0;
	    max = Math.floor(b.saddleTopY - b.hoodsRestTopY + b.headsetSpacersStack / Snap.sin(b.headTubeAngle) - 2); // approx
	} else if (editName == "saddleFrontToHandlebarCenter") {
	    min = 200;
	    max = b.topTubeHorizontal + 500;
	} else if (editName == "pedalAxleToGround") {
	    min = 20;
	    max = 300;
	} else if (editName == "pedalAxleToTire") {
	    min = 5;
	    max = 500;
	} else if (editName == "steererColumnLength") {
	    min = input.val() - b.headsetSpacersStack;
	    max = 500;
	} else if (editName == "steeringLength") {
	    min = input.val() - b.headsetSpacersStack;
	    max = 1200;
	} else if (editName == "standoverHeight") {
	    min = b.bottomBracketY + 100;
	    max = 1200;
	} else if (editName == "frontHubToHandlebarBottom") {
	    min = 100;
	    max = 1000;
	}
	input.attr({'edit-name': editName, 'step': step, 'min': Math.round(min), 'max': Math.round(max), 'old-value': input.val() });
    }

    function rotateFrame(b, diff) {
	// rotate around the back wheel
	function modifyAngle(b, diff, xName, yName) {
	    var a1 = Snap.deg(Math.atan2(b[yName] - b.hubY, b[xName] - b.backHubX)) + diff;
	    var len = Math.sqrt((b[yName] - b.hubY)*(b[yName] - b.hubY) + (b[xName] - b.backHubX)*(b[xName] - b.backHubX));
	    b[xName] = b.backHubX + len * Snap.cos(a1);
	    b[yName] = b.hubY + len * Snap.sin(a1);
	}

	var saddleCToBack = b.saddleLength - b.saddleFrontToCenter;
	b.tempSaddleCX = b.saddleBackX + Snap.cos(b.saddleAngle) * saddleCToBack;
	b.tempHbBackY = b.handlebarTopY - b.handlebarDiameter/2;
	b.tempHbTopX = b.handlebarBackX + b.handlebarDiameter/2;

	modifyAngle(b, diff, "bottomBracketX", "bottomBracketY");
	modifyAngle(b, diff, "seatTubeTopCenterX", "seatTubeTopCenterY");
	modifyAngle(b, diff, "headTubeTopCenterX", "headTubeTopCenterY");
	modifyAngle(b, diff, "headTubeBottomCenterX", "headTubeBottomCenterY");
	modifyAngle(b, diff, "handlebarBackX", "tempHbBackY");
	modifyAngle(b, diff, "tempHbTopX", "handlebarTopY");
	modifyAngle(b, diff, "hoodsRestTopX", "hoodsRestTopY");
	modifyAngle(b, diff, "tempSaddleCX", "saddleTopY");
	b.saddleBackX = b.tempSaddleCX - Snap.cos(b.saddleAngle) * saddleCToBack;
	delete b.tempSaddleCX;
	delete b.tempHbBackY;
	delete b.tempHbTopX;
    }

    function placeEditNumBox(editName) {
	var svg = document.getElementById('bike');
	var te = $("#"+editName+"-svg");
	var fontSize = parseInt(te.css('font-size'));
	var rect = svg.getBoundingClientRect();
        var s = Snap("#bike");
	vb = s.attr('viewBox');
	var mul = rect.height / vb.height;
	var xo = (rect.width - mul * vb.width) / 2;
	var fs = mul * fontSize;
	$("#editNum").css({ 'top': rect.top + scrollY + mul * (parseFloat(te.attr('y'))-vb.y) - $("#editNumInputLayout").outerHeight()/2,
			    'left': rect.left + scrollX + xo + mul * (parseFloat(te.attr('x'))-vb.x) - 2*fs });
    }

    function measurementChange(event) {
	var input = $("#editNumInput");
	var editName = input.attr("edit-name");
	var val = parseFloat(input.val());
	if (isNaN(val)) {
	    input.val(input.attr("old-value"));
	    return;
	}
	if (val < parseFloat(input.attr("min"))) {
	    val = parseFloat(input.attr("min"));
	} else if (val > parseFloat(input.attr("max"))) {
	    val = parseFloat(input.attr("max"));
	}
	var b = Object.assign({}, glob.bike);
	var oldval = b[editName];
	if (oldval !== undefined) {
	    b[editName] = val;
	} else {
	    oldval = input.attr("old-value");
	}
	var diff = val - oldval;
	var tx, ty, th, a1, xdiff, ydiff;
	if (editName == 'offsetX') {
	    b.bottomBracketX += diff;
	    b.backHubX += diff;
	    b.frontHubX += diff;
	    b.headTubeBottomCenterX += diff;
	    b.headTubeTopCenterX += diff;
	    b.seatTubeTopCenterX += diff;
	    b.handlebarBackX += diff;
	    b.hoodsRestTopX += diff;
	    b.saddleBackX += diff;
	} else if (editName == 'backHubX') {
	    b.frontHubX = undefined;
	    b.wheelRadius = undefined;
	    b.hubY += diff;
	    b.saddleBackX = undefined;
	} else if (editName == 'hubY') {
	    b.bottomBracketY += diff;
	    b.headTubeBottomCenterY += diff;
	    b.headTubeTopCenterY += diff;
	    b.seatTubeTopCenterY += diff;
	    b.handlebarTopY += diff;
	    b.hoodsRestTopY += diff;
	    b.saddleTopY += diff;
	} else if (editName == 'saddleLength') {
	    if (val < b.saddleFrontToCenter + 10) {
		b.saddleFrontToCenter = val - 10;
	    }
	} else if (editName == 'saddleFrontToCenter') {
	    if (val > b.saddleLength - 10) {
		b.saddleLength = val + 10;
	    }
	} else if (editName == "seatTubeTopCenterX") {
	    b.saddleBackX += diff;
	} else if (editName == "headTubeTopCenterX" ||
		   editName == "headTubeTopCenterY" ||
		   editName == "headTubeBottomCenterX" ||
		   editName == "headTubeBottomCenterY")
	{
	    tx = b.headTubeBottomCenterX - b.headTubeTopCenterX;
	    ty = b.headTubeTopCenterY - b.headTubeBottomCenterY;
	    a1 = Snap.deg(Math.atan2(ty, tx));
	    b.frontHubX = b.headTubeBottomCenterX + tx / ty * (b.headTubeBottomCenterY - b.hubY) + b.forkRake / Snap.cos(90-a1);
	    b.stemToHoodsAngle += b.headTubeAngle - a1;
	    b.handlebarBackX = undefined;
	    b.handlebarTopY = undefined;
	    b.hoodsRestTopX = undefined;
	    b.hoodsRestTopY = undefined;
	} else if (editName == "handlebarBackX") {
	    b.hoodsRestTopX += diff;
	} else if (editName == "wheelRadius") {
	    b.backHubX = undefined;
	    b.frontHubX = undefined;
	    b.hubY = undefined;
	    b.bottomBracketX = undefined;
	    b.bottomBracketY = undefined;
	    b.bottomBracketHeight = undefined;
	    b.saddleBackX = undefined;
	    b.saddleTopY = undefined;
	    b.seatTubeTopCenterX = undefined;
	    b.seatTubeTopCenterY = undefined;
	    b.headTubeBottomCenterX = undefined;
	    b.headTubeBottomCenterY = undefined;
	    b.headTubeTopCenterX = undefined;
	    b.headTubeTopCenterY = undefined;
	    b.handlebarBackX = undefined;
	    b.handlebarTopY = undefined;
	    b.hoodsRestTopX = undefined;
	    b.hoodsRestTopY = undefined;
	} else if (editName == "chainStayLength" || editName == "chainStayLengthHorizontal") {
	    if (editName == "chainStayLengthHorizontal") {
		tx = diff;
	    } else {
		ty = b.bottomBracketDrop;
		tx = Math.sqrt(val*val - ty*ty) - Math.sqrt(oldval*oldval - ty*ty);
	    }
            b.bottomBracketX += tx;
            b.saddleBackX += tx;
            b.seatTubeTopCenterX += tx;
            b.headTubeBottomCenterX += tx;
            b.headTubeTopCenterX += tx;
            b.handlebarBackX += tx;
            b.hoodsRestTopX += tx;
            b.frontHubX += tx;
            b.wheelBase += tx;
	} else if (editName == "bottomBracketToFrontHub" || editName == "bottomBracketToFrontHubHorizontal") {
	    b.frontHubX = undefined;
	    b.forkRake = undefined;
	    b.wheelBase = undefined;
	    if (editName == "bottomBracketToFrontHubHorizontal") {
		ty = b.bottomBracketDrop;
		tx = val;
		b.bottomBracketToFrontHub = Math.sqrt(ty*ty + tx*tx);
	    }
	} else if (editName == "bottomBracketDrop") {
	    b.saddleBackX = undefined;
	    b.saddleTopY = undefined;
	    b.seatTubeTopCenterX = undefined;
	    b.seatTubeTopCenterY = undefined;
	    b.bottomBracketY = undefined;
	    b.bottomBracketHeight = undefined;
	} else if (editName == "bottomBracketHeight") {
	    b.saddleBackX = undefined;
	    b.saddleTopY = undefined;
	    b.seatTubeTopCenterX = undefined;
	    b.seatTubeTopCenterY = undefined;
	    b.bottomBracketY = undefined;
	    b.bottomBracketDrop = undefined;
	} else if (editName == "pedalAxleToGround") {
	    b.bottomBracketHeight += diff;
	    b.saddleBackX = undefined;
	    b.saddleTopY = undefined;
	    b.seatTubeTopCenterX = undefined;
	    b.seatTubeTopCenterY = undefined;
	    b.bottomBracketY = undefined;
	    b.bottomBracketDrop = undefined;
	} else if (editName == "seatTubeCenterToTop") {
	    b.seatTubeTopCenterX = undefined;
	    b.seatTubeTopCenterY = undefined;
	} else if (editName == "seatTubeAngle") {
	    b.saddleBackX = undefined;
	    b.saddleTopY = undefined;
	    b.seatTubeTopCenterX = undefined;
	    b.seatTubeTopCenterY = undefined;
	    b.topTubeHorizontal = undefined;
	    b.topTubeCenterToCenter = undefined;
	} else if (editName == "headTubeAngle") {
	    b.headTubeBottomCenterX = undefined;
	    b.headTubeBottomCenterY = undefined;
	    b.bottomBracketToFrontHub = undefined;
	    b.topTubeCenterToCenter = undefined;
	    b.wheelBase = undefined;
	    b.handlebarBackX = undefined;
	    b.handlebarTopY = undefined;
	    b.hoodsRestTopX = undefined;
	    b.hoodsRestTopY = undefined;
	    b.headsetBottomStack = undefined;
	    b.stemToHoodsAngle -= diff;
	    ty = b.headTubeTopCenterY - b.hubY;
	    var tx1 = ty / Snap.tan(oldval) + b.forkRake / Snap.cos(90 - oldval);
	    var tx2 = ty / Snap.tan(val) + b.forkRake / Snap.cos(90 - val);
	    b.frontHubX += tx2 - tx1;
	} else if (editName == "stack" || editName == "standoverHeight") {
	    var ty1 = b.headTubeTopCenterY - b.hubY;
	    b.headTubeTopCenterY += diff;
	    var ty2 = b.headTubeTopCenterY - b.hubY;
	    b.seatTubeTopCenterY += diff;
	    b.seatTubeTopCenterX -= diff / Snap.tan(b.seatTubeAngle);
	    b.handlebarTopY += diff;
	    b.hoodsRestTopY += diff;
	    b.headTubeLength = undefined;
	    ty = b.headTubeTopCenterY - b.headTubeBottomCenterY;
	    b.headTubeBottomCenterX = b.headTubeTopCenterX + ty / Snap.tan(b.headTubeAngle);
	    b.bottomBracketToFrontHub = undefined;
	    b.wheelBase = undefined;
	    b.frontHubX += (ty2 - ty1) / Snap.tan(b.headTubeAngle);
	} else if (editName == "reach" || editName == "topTubeEffective" || editName == "topTubeHorizontal" || editName == "wheelBase") {
	    b.frontHubX += diff;
	    b.headTubeBottomCenterX += diff;
	    b.headTubeTopCenterX += diff;
	    b.handlebarBackX += diff;
	    b.hoodsRestTopX += diff;
	} else if (editName == "topTubeCenterToCenter") {
	    var cosSTAngle = Snap.cos(b.seatTubeAngle);
	    var sinSTAngle = Snap.sin(b.seatTubeAngle);
	    var cosHTAngle = Snap.cos(b.headTubeAngle);
	    var sinHTAngle = Snap.sin(b.headTubeAngle);
	    var topTubeBackX = b.seatTubeTopToTopTubeCenter * cosSTAngle + b.seatTubeTopCenterX;
	    var topTubeBackY = b.seatTubeTopCenterY - b.seatTubeTopToTopTubeCenter * sinSTAngle;
	    var topTubeFrontX = b.headTubeTopToTopTubeCenter * cosHTAngle + b.headTubeTopCenterX;
	    var topTubeFrontY = b.headTubeTopCenterY - b.headTubeTopToTopTubeCenter * sinHTAngle;
	    tx = topTubeFrontX - topTubeBackX;
	    ty = topTubeFrontY - topTubeBackY;
	    var ttAngle = Snap.deg(Math.atan2(ty, tx));
	    tx = topTubeBackX + val * Snap.cos(ttAngle);
	    ty = topTubeBackY + val * Snap.sin(ttAngle);
	    xdiff = (tx - b.headTubeTopToTopTubeCenter * cosHTAngle) - b.headTubeTopCenterX;
	    ydiff = (ty + b.headTubeTopToTopTubeCenter * sinHTAngle) - b.headTubeTopCenterY;
	    b.headTubeTopCenterX += xdiff;
	    b.headTubeTopCenterY += ydiff;
	    b.headTubeBottomCenterX = undefined;
	    b.headTubeBottomCenterY = undefined;
	    b.headTubeLength = undefined;
	    b.handlebarBackX += xdiff;
	    b.handlebarTopY += ydiff;
	    b.hoodsRestTopX += xdiff;
	    b.hoodsRestTopY += ydiff;
	    b.frontHubX += xdiff;
	} else if (editName == "pedalAxleToTire") {
	    angle = Snap.deg(Math.atan2(b.hubY - b.bottomBracketY, b.frontHubX - b.bottomBracketX));
	    xdiff = diff / Snap.cos(angle);
	    b.headTubeTopCenterX += xdiff;
	    b.headTubeBottomCenterX += xdiff;
	    b.handlebarBackX += xdiff;
	    b.hoodsRestTopX += xdiff;
	    b.frontHubX += xdiff;
	} else if (editName == "headTubeLength") {
	    if ($("#btnHeadTubeMode").attr("data-ddValue") == "fixedBottom") {
		// increase length upwards, keep reach
		xdiff = (b.headTubeBottomCenterX - Snap.cos(b.headTubeAngle) * val) - b.headTubeTopCenterX;
		ydiff = (b.headTubeBottomCenterY + Snap.sin(b.headTubeAngle) * val) - b.headTubeTopCenterY;
		b.headTubeBottomCenterX -= xdiff;
		b.frontHubX -= xdiff;
		b.headTubeTopCenterY += ydiff;
		b.handlebarTopY += ydiff;
		b.hoodsRestTopY += ydiff;
	    } else {
		// increase length downwards, shorten fork
		b.headTubeBottomCenterX = b.headTubeTopCenterX + Snap.cos(b.headTubeAngle) * val;
		b.headTubeBottomCenterY = b.headTubeTopCenterY - Snap.sin(b.headTubeAngle) * val;
		b.forkLength -= diff;
	    }
	} else if (editName == "frontHubX") {
	    // change headtube angle
	    b.headTubeBottomCenterX = undefined;
	    b.headTubeBottomCenterY = undefined;
	    b.headTubeAngle = undefined;
	    b.forkLength = undefined;
	} else if (editName == "headsetBottomStack" || editName == "forkLength" || editName == "forkRake" || editName == "forkLengthDiagonal") {
	    if (editName == "forkLengthDiagonal") {
		oldval = b.forkLength;
		b.forkLength = Math.sqrt(val*val - b.forkRake * b.forkRake);
		val = b.forkLength;
		diff = val - oldval;
	    }
	    if ($("#btnForkMode").attr("data-ddValue") == "fixedAngle") {
		// keep head tube angle intact and steerer length fixed
		if (editName == "headsetBottomStack") {
		    if (b.forkLength - diff < 20) {
			b.headsetBottomStack = b.forkLength + oldval - 20;
			b.forkLength = 20;
		    } else {
			b.forkLength -= diff;
		    }
		} else if (editName == "forkLength" || editName == "forkLengthDiagonal") {
		    b.headTubeBottomCenterX = undefined;
		    b.headTubeBottomCenterY = undefined;
		    if (b.headTubeLength - diff < 20) {
			b.forkLength = b.headTubeLength + oldval - 20;
			b.headTubeLength = 20;
		    } else {
			b.headTubeLength -= diff;
		    }
		} else if (editName == "forkRake") {
		    var angle = 90 - b.headTubeAngle;
		    b.frontHubX += diff / Snap.cos(angle);
		    b.forkLength = undefined;
		}
	    } else {
		// rotate the frame
		tx = b.headTubeBottomCenterX - b.backHubX;
		ty = b.headTubeBottomCenterY - b.hubY;
		var D = Math.sqrt(tx*tx+ty*ty);
		var A = Snap.deg(Math.atan2(ty, tx));
		var B = b.headTubeAngle;
		var F = Math.sqrt(b.forkRake*b.forkRake + b.forkLength*b.forkLength);
		var C = b.headTubeAngle - Snap.deg(Math.atan2(b.forkRake, b.forkLength));
		var L = b.headsetBottomStack;
		// formula to solve: D*sin(A+x) - L*sin(B-x) - F*sin(C-x) = 0
		var cosA = Snap.cos(A);
		var cosB = Snap.cos(B);
		var cosC = Snap.cos(C);
		var cos2A = cosA*cosA;
		var cos2B = cosB*cosB;
		var cos2C = cosC*cosC;
		var sinA = Snap.sin(A);
		var sinB = Snap.sin(B);
		var sinC = Snap.sin(C);
		var sin2A = sinA*sinA;
		var sin2B = sinB*sinB;
		var sin2C = sinC*sinC;
		var angleDiff = Snap.acos((D*cosA + L*cosB + F*cosC) / Math.sqrt(-2*D*L*sinA*sinB + 2*D*L*cosA*cosB - 2*D*F*sinA*sinC + 2*D*F*cosA*cosC + D*D*sin2A + D*D*cos2A + 2*F*L*sinB*sinC + 2*F*L*cosB*cosC + L*L*sin2B + L*L*cos2B + F*F*sin2C + F*F*cos2C));
		if (oldval > val) {
		    angleDiff = -angleDiff;
		}
		if (editName == "forkRake") {
		    angleDiff = -angleDiff;
		}

		rotateFrame(b, angleDiff);

		tx = b.headTubeBottomCenterX - b.headTubeTopCenterX;
		ty = b.headTubeTopCenterY - b.headTubeBottomCenterY;
		b.headTubeAngle -= angleDiff;
		b.frontHubX = b.headTubeBottomCenterX + tx / ty * (b.headTubeBottomCenterY - b.hubY) + b.forkRake / Snap.cos(90-b.headTubeAngle);
	    }
	} else if (editName == "headsetSpacersStack" || editName == "headsetTopStack" || editName == "steererColumnLength" || editName == "steeringLength") {
	    tx = diff * Snap.cos(b.headTubeAngle);
	    ty = diff * Snap.sin(b.headTubeAngle);
	    b.handlebarBackX -= tx;
	    b.hoodsRestTopX -= tx;
	    b.handlebarTopY += ty;
	    b.hoodsRestTopY += ty;
	} else if (editName == "stemStack") {
	    tx = 0.5 * diff * Snap.cos(b.headTubeAngle);
	    ty = 0.5 * diff * Snap.sin(b.headTubeAngle);
	    b.handlebarBackX -= tx;
	    b.hoodsRestTopX -= tx;
	    b.handlebarTopY += ty;
	    b.hoodsRestTopY += ty;
	} else if (editName == "stemAngle" || editName == "stemLength" || editName == "handlebarDiameter") {
	    b.handlebarBackX = undefined;
	    b.handlebarTopY = undefined;
	    b.hoodsRestTopX = undefined;
	    b.hoodsRestTopY = undefined;
	} else if (editName == "stemToHoodsAngle" || editName == "handlebarAndHoodsReach") {
	    b.hoodsRestTopX = undefined;
	    b.hoodsRestTopY = undefined;
	} else if (editName == "saddleTopToBottomBracket" || editName == "seatpostExtension") {
	    tx = diff * Snap.cos(b.seatTubeAngle);
	    ty = diff * Snap.sin(b.seatTubeAngle);
	    b.saddleBackX -= tx;
	    b.saddleTopY += ty;
	} else if (editName == 'saddleFrontToBottomBracket' || editName == 'saddleCenterToBottomBracket') {
	    b.saddleBackX -= diff;
	} else if (editName == 'saddleTopToHandlebarTop' || editName == 'saddleTopToHoodsRest') {
	    b.handlebarTopY -= diff;
	    b.handlebarBackX = undefined;
	    b.hoodsRestTopY -= diff;
	    b.hoodsRestTopX = undefined;
	    b.headsetSpacersStack -= diff / Snap.sin(b.headTubeAngle);
	} else if (editName == 'saddleFrontToHandlebarCenter') {
	    b.handlebarBackX += diff;
	    b.hoodsRestTopX += diff;
	} else if (editName == 'trail') {
	    b.frontHubX -= diff;
	    b.forkRake = undefined;
	    b.forkLength = undefined;
	} else if (editName == 'seatpostHeadCenterToSaddleFront') {
	    b.saddleBackX += diff * Snap.cos(b.saddleAngle);
	    b.saddleTopY -= diff * Snap.sin(b.saddleAngle);
	} else if (editName == 'frontHubToHandlebarBottom') {
	    // FIXME: approximate
	    var stemFrontX = b.handlebarBackX + b.handlebarDiameter * 0.5;
	    var stemFrontY = b.handlebarTopY - b.handlebarDiameter * 0.5;
	    a1 = Snap.deg(Math.atan2(stemFrontY - b.hubY, b.frontHubX - stemFrontX));
	    diff = diff / Snap.sin(a1) * Snap.sin(b.headTubeAngle);
	    if (-diff > b.headsetSpacersStack) {
		diff = -b.headsetSpacersStack;
	    }
	    b.headsetSpacersStack += diff;
	    tx = diff * Snap.cos(b.headTubeAngle);
	    ty = diff * Snap.sin(b.headTubeAngle);
	    b.handlebarBackX -= tx;
	    b.hoodsRestTopX -= tx;
	    b.handlebarTopY += ty;
	    b.hoodsRestTopY += ty;
	} else if (editName == 'saddleFrontToHandlebarBack' || editName == 'saddleTopToStemFront') {
	    var stemFrontX = b.handlebarBackX + b.handlebarDiameter * 0.5;
	    var stemFrontY = b.handlebarTopY - b.handlebarDiameter * 0.5;
	    var saddleX, saddleY;
	    if (editName == 'saddleTopToStemFront') {
		saddleX = b.saddleBackX + Snap.cos(b.saddleAngle) * (b.saddleLength - b.saddleFrontToCenter);
		saddleY = b.saddleTopY;
	    } else {
		saddleX = b.saddleBackX + Snap.cos(b.saddleAngle) * b.saddleLength;
		saddleY = b.saddleTopY - Snap.sin(b.saddleAngle) * b.saddleFrontToCenter;
	    }
	    a1 = Snap.deg(Math.atan2(saddleY - stemFrontY, stemFrontX - saddleX));
	    ty = saddleY - stemFrontY;
	    tx = stemFrontX - saddleX;
	    th = Math.sqrt(tx*tx+ty*ty);
	    diff = Math.sqrt((-ty*ty)+th*th+2*diff*th+diff*diff)-tx;
	    if (isNaN(diff) || -diff > b.stemLength + 30) {
		diff = -b.stemLength + 30;
	    } else if (diff + b.stemLength > 300) {
		diff = 300 - b.stemLength;
	    }
	    b.stemLength = undefined;
	    b.handlebarBackX += diff;
	    b.hoodsRestTopX += diff;
	}
	normalizeBikeMeasurements(b);
	pushBike(b);
	refreshSvg();
	var normValue = b[editName];
	if (normValue !== undefined) {
	    normValue = Math.round(normValue * 1000) / 1000;
	    input.val(normValue);
	} else {
	    input.val($("#" + editName + "-svg").text());
	}

	placeEditNumBox(editName);
    }

    function onClickMeasurement(event, s, fontSize, editName, valueStr) {
	var uneditable = {
	    "saddleTopDeltaX": 1,
	    "saddleTopDeltaY": 1,
	    "bottomBracketDeltaX": 1,
	    "bottomBracketDeltaY": 1,
	    "hoodsTopDeltaX": 1,
	    "hoodsTopDeltaY": 1,
	    "stemFrontDeltaX": 1,
	    "stemFrontDeltaY": 1
	};
	if (uneditable[editName]) {
	    $('#alertTitle').text("Measurement can't be edited");
	    $('#alertText').text('There is no support for editing the "' + humpbackToSpaces(editName) + '" measurement');
	    $('#alertModal').modal('show');
	    return;
	}
	var svg = document.getElementById('bike');
	var rect = svg.getBoundingClientRect();
	vb = s.attr('viewBox');
	var mul = rect.width / vb.width;
	var fs = mul * fontSize;
	$("#editNumInput").val(valueStr);
	setEditNumAttr($("#editNumInput"), editName);
	$("#editNumInputLayout").css({ 'width': 4*fs, 'font-size': fs });
	$("#editNumInput").css({ 'width': 4*fs, 'font-size': fs });
	placeEditNumBox(editName);
	$("#editNum").show();
	$("#editNumInput").focus();
	event.stopPropagation();
    }

    var measurementGroups = [
	{
	    "name": "XY",
	    "measurements": {
		"saddleFrontToCenter": 1,
		"saddleLength": 1,
		"saddleAngle": 1,
		"stemAngle": 1,
		"stemLength": 1,
		"handlebarDiameter": 1,
		"crankLength": 1,
		"offsetX": 1,
		"offsetY": 1,
		"bottomBracketX": 1,
		"bottomBracketY": 1,
		"backHubX": 1,
		"frontHubX": 1,
		"hubY": 1,
		"seatTubeTopCenterX": 1,
		"seatTubeTopCenterY": 1,
		"headTubeTopCenterX": 1,
		"headTubeTopCenterY": 1,
		"headTubeBottomCenterX": 1,
		"headTubeBottomCenterY": 1,
		"handlebarBackX": 1,
		"handlebarTopY": 1,
		"saddleTopY": 1,
		"saddleBackX": 1,
		"hoodsRestTopX": 1,
		"hoodsRestTopY": 1,
		"headTubeLength": 1,
		"headsetBottomStack": 1,
		"forkRake": 1,
		"headsetTopStack": 1,
		"headsetSpacersStack": 1,
		"stemStack": 1,
		"seatTubeTopToTopTubeCenter": 1,
		"headTubeTopToTopTubeCenter": 1,
		"saddleStack": 1,
		"seatpostSetback": 1
	    }
	},
	{
	    "name": "Fit",
	    "measurements": {
		"saddleFrontToCenter": 1,
		"saddleAngle": 1,
		"stemAngle": 1,
		"headsetSpacersStack": 1,
		"stemLength": 1,
		"crankLength": 1,
		"handlebarAndHoodsReach": 1,
		"stemToHoodsAngle": 1,
		"stack": 1,
		"reach": 1,
		"topTubeHorizontal": 1,
		"seatTubeAngle": 1,
		"headTubeAngle": 1,
		"saddleFrontToBottomBracket": 1,
		"saddleFrontToHandlebarCenter": 1,
		"saddleTopToHandlebarTop": 1,
		"saddleTopToBottomBracket": 1,
		"headsetTopStack": 1,
		"stemStack": 2,
		"topTubeEffective": 2,
		"seatpostExtension": 2,
		"saddleLength": 2,
		"handlebarDiameter": 2,
		"seatpostSetback": 2,
		"saddleStack": 2,
		"standoverHeight": 2,
		"saddleTopToHoodsRest": 2,
		"pedalAxleToTire": 2,
		"saddleCenterToBottomBracket": 2,
		"saddleTopToStemFront": 2,
		"wheelRadius": 2
	    }
	},
	{
	    "name": "Quick",
	    "measurements": {
		"saddleFrontToCenter": 1,
		"crankLength": 1,
		"handlebarAndHoodsReach": 1,
		"stemToHoodsAngle": 1,
		"saddleTopToBottomBracket": 1,
		"saddleFrontToHandlebarBack": 1,
		"frontHubToHandlebarBottom": 1,
		"headsetSpacersStack": 2,
		"stemLength": 2,
		"handlebarDiameter": 2,
		"bottomBracketDrop": 2
	    }
	},
	{
	    "name": "Comp",
	    "measurements": {
		"saddleLength": 1,
		"saddleAngle": 1,
		"stemAngle": 1,
		"headsetBottomStack": 1,
		"forkRake": 1,
		"forkLength": 1,
		"headsetTopStack": 1,
		"headsetSpacersStack": 1,
		"stemStack": 1,
		"stemLength": 1,
		"handlebarDiameter": 1,
		"saddleStack": 1,
		"seatpostSetback": 1,
		"crankLength": 1,
		"handlebarAndHoodsReach": 1,
		"stemToHoodsAngle": 1,
		"wheelRadius": 1,
		"steererColumnLength": 2,
		"steeringLength": 2,
		"saddleFrontToCenter": 2,
		"forkLengthDiagonal": 2
	    }
	},
	{
	    "name": "Frame",
	    "measurements": {
		"headsetBottomStack": 1,
		"forkRake": 1,
		"forkLength": 1,
		"stack": 1,
		"reach": 1,
		"topTubeHorizontal": 1,
		"seatTubeAngle": 1,
		"headTubeAngle": 1,
		"bottomBracketDrop": 1,
		"wheelBase": 1,
		"chainStayLength": 1,
		"bottomBracketToFrontHub": 1,
		"seatTubeCenterToTop": 1,
		"topTubeCenterToCenter": 1,
		"headTubeLength": 1,
		"trail": 1,
		"forkLengthDiagonal": 2,
		"bottomBracketHeight": 2,
		"topTubeEffective": 2,
		"seatTubeTopToTopTubeCenter": 2,
		"headTubeTopToTopTubeCenter": 2,
		"chainStayLengthHorizontal": 2,
		"bottomBracketToFrontHubHorizontal": 2,
		"pedalAxleToTire": 2,
		"pedalAxleToGround": 2,
		"standoverHeight": 2,
		"wheelRadius": 2
	    }
	},
	{
	    "name": "Delta",
	    "measurements": {
		"saddleTopDeltaX": 1,
		"saddleTopDeltaY": 1,
		"bottomBracketDeltaX": 1,
		"bottomBracketDeltaY": 1,
		"hoodsTopDeltaX": 1,
		"hoodsTopDeltaY": 1,
		"stemFrontDeltaX": 1,
		"stemFrontDeltaY": 1
	    }
	},
	{
	    "name": "Extra",
	    "measurements": {
		"seatpostHeadCenterToSaddleFront": 1,
	    }
	}
    ];

    function measurementIsActive(editName) {
	for (var i = 0; i < measurementGroups.length; i++) {
	    if ($("#btnMeas" + measurementGroups[i].name).hasClass("btn-success")) {
		var num = measurementGroups[i].measurements[editName];
		if (num == 1 || (num == 2 && $("#btnExtraMeasurements").hasClass("btn-success"))) {
		    return true;
		}
	    }
	}
	return false;
    }

    function measLine(editName, s, xc, yc, x2, y2, isLeft, offset, decimalPoint, textPos) {
	if (!measurementIsActive(editName)) {
	    return;
	}
	if (isLeft === undefined) {
	    isLeft = true;
	}
	if (offset === undefined) {
	    offset = 100;
	}
	if (decimalPoint === undefined) {
	    decimalPoint = false;
	}
	if (textPos === undefined) {
	    textPos = 0.5;
	}
	if (typeof xc == "number") {
	    xc = [ xc, xc ];
	}
	if (typeof yc == "number") {
	    yc = [ yc, yc ];
	}
	var ty = y2 - yc[0];
	var tx = x2 - xc[0];
	var length = Math.sqrt(ty*ty + tx*tx);
	var lineAngle = Snap.deg(Math.atan2(ty, tx));
	var angle = lineAngle + (isLeft ? 90 : -90);
	var extra = 10;
	var alen = 20;
	if (alen * 2.3 > length) {
	    alen = length / 2.3;
	}
	var px1 = xc[0] + offset * Snap.cos(angle);
	var py1 = yc[0] + offset * Snap.sin(angle);
	var px2 = x2 + offset * Snap.cos(angle);
	var py2 = y2 + offset * Snap.sin(angle);

	tx = alen;
	ty = 5;
	th = Math.sqrt(tx*tx+ty*ty);
	var arrowAngle = Snap.deg(Math.atan2(ty, tx));
	var aa1 = lineAngle + arrowAngle;
	var aa2 = lineAngle - arrowAngle;
	var a1x = px1 + th * Snap.cos(aa1);
	var a1y = py1 + th * Snap.sin(aa1);
	var a2x = px1 + th * Snap.cos(aa2);
	var a2y = py1 + th * Snap.sin(aa2);
	var a3x = px2 + th * Snap.cos(aa1+180);
	var a3y = py2 + th * Snap.sin(aa1+180);
	var a4x = px2 + th * Snap.cos(aa2+180);
	var a4y = py2 + th * Snap.sin(aa2+180);

	var e = [];
	e.push(s.path("M"+px1+" "+py1+"L"+a1x+" "+a1y+"L"+a2x+" "+a2y+"L"+px1+" "+py1+"L"+px2+" "+py2+"L"+a3x+" "+a3y+"L"+a4x+" "+a4y+"L"+px2+" "+py2).attr({'fill': '#888', 'stroke': '#888', 'stroke-width': 1}));
	var lengthStr = decimalPoint ? (Math.round(10*length)/10).toString() : Math.round(length).toString();
	var fontSize = 30;
	var tx1, ty1;
	if (length < 2*fontSize+10) {
	    tx1 = px1 - fontSize * Snap.cos(lineAngle);
	    ty1 = py1 - fontSize * Snap.sin(lineAngle);
	    e.push(s.line(px1, py1, tx1, ty1).attr({'stroke': '#888', 'stroke-width': 1 }));
	} else {
	    tx1 = px1 + length * textPos * Snap.cos(lineAngle);
	    ty1 = py1 + length * textPos * Snap.sin(lineAngle);
	}
	var et = s.text(tx1, ty1, lengthStr).attr({'font-size': fontSize, 'fill': '#888', 'text-anchor': 'middle', 'dominant-baseline': 'middle', 'id': editName+"-svg"}).click(function(event) {
	    onClickMeasurement(event, s, fontSize, editName, lengthStr);
	});
	e.push(et);

	if (offset > 0) {
	    // fixme: better way to figure out if it should be + or - extra
	    var px1a = xc[0] + (offset+extra) * Snap.cos(angle);
	    var py1a = yc[0] + (offset+extra) * Snap.sin(angle);
	    var d1 = Math.sqrt((xc[1]-px1a)*(xc[1]-px1a) + (yc[1]-py1a)*(yc[1]-py1a));
	    var px1b = xc[0] + (offset-extra) * Snap.cos(angle);
	    var py1b = yc[0] + (offset-extra) * Snap.sin(angle);
	    var d2 = Math.sqrt((xc[1]-px1b)*(xc[1]-px1b) + (yc[1]-py1b)*(yc[1]-py1b));
	    px2 = x2 + (offset+extra) * Snap.cos(angle);
	    py2 = y2 + (offset+extra) * Snap.sin(angle);
	    e.push(s.line(xc[1], yc[1], d1>d2?px1a:px1b, d1>d2?py1a:py1b).attr({'stroke': '#888', 'stroke-width': 1 }));
	    e.push(s.line(px2, py2, x2, y2).attr({'stroke': '#888', 'stroke-width': 1 }));
	}

	s.g.apply(s, e).attr({'class': 'measline'}).mouseover(function(event) {
	    $("#measInfo").text(makeMeasHelpText(editName));
	    $("#measInfo").show();
	}).mouseout(function(event) {
	    $("#measInfo").hide();
	});
    }

    function measAngle(editName, s, x1, y1, x2, y2, x3, y3) {
	if (!measurementIsActive(editName)) {
	    return;
	}
	if (x3 === undefined) {
	    y3 = y1;
	    x3 = x1 - 100;
	}
	var e = [];
	e.push(s.line(x1, y1, x2, y2).attr({'stroke': '#888', 'stroke-width': 1 }));
	e.push(s.line(x1, y1, x3, y3).attr({'stroke': '#888', 'stroke-width': 1 }));
	var angle1 = Snap.deg(Math.atan2(y1 - y2, x1 - x2));
	var angle2 = Snap.deg(Math.atan2(y1 - y3, x1 - x3));
	var angle = angle1 - angle2;
	if (Math.abs(angle + 360) < Math.abs(angle)) {
	    angle += 360;
	}
	var fontSize = 30;
	var r = Math.sqrt((x3-x1)*(x3-x1) + (y3-y1)*(y3-y1)) - 40;
	var xs = x1 - r * Snap.cos(angle2);
	var ys = y1 - r * Snap.sin(angle2);
	var xe = x1 - r * Snap.cos(angle1);
	var ye = y1 - r * Snap.sin(angle1);
	var swap = angle < 0 ? "0" : "1";
	e.push(s.path("M" + xs + " " + ys + "A" + r + " " + r + " 0 0 " + swap + " " + xe + " " + ye).attr({'fill': 'none', 'stroke': '#888', 'stroke-width': 1 }));
	var tx1 = x1 - Snap.cos(angle2+angle/2) * r;
	var ty1 = y1 - Snap.sin(angle2+angle/2) * r;
	var angleStr = (Math.round(100 * angle) / 100).toString() + "°";
	e.push(s.text(tx1, ty1, angleStr).attr({'font-size': fontSize, 'fill': '#888', 'text-anchor': 'middle', 'dominant-baseline': 'middle', 'id': editName+"-svg"}).click(function(event) {
	    onClickMeasurement(event, s, fontSize, editName, angleStr.substring(0,angleStr.length-1));
	}));
	s.g.apply(s, e).attr({'class': 'measangle'}).mouseover(function(event) {
	    $("#measInfo").text(makeMeasHelpText(editName));
	    $("#measInfo").show();
	}).mouseout(function(event) {
	    $("#measInfo").hide();
	});
    }

    function updateHash() {
	var str = bikeToUrlString(glob.bike);
	if (!$.isEmptyObject(glob.shadowBike)) {
	    str += bikeToUrlString(glob.shadowBike);
	}
	if (window.location.hash !== str) {
            glob.suppressHashChange++;
	    window.location.hash = str;
	    glob.lastHashBike = str;
	}
    }

    function updateName() {
	var text = glob.bike.name;
	if (text == "" || text === undefined) {
	    text = "Unnamed";
	    glob.bike.name = text;
	}
	$("#bikeName").text(text);
	$("#bikeName").show();
	$("#editBikeNameInput").hide();
    }

    function pushBike(b) {
	if (glob.undoHistory.length > 500) {
	    glob.undoHistory.pop();
	}
	glob.undoHistory.push(Object.assign({}, glob.bike));
	glob.bike = b;
	$("#btnUndo").prop("disabled", false);
	updateName();
	updateHash();
	refreshSvg();
    }

    function deriveMeasurements(b, height) {
	var d = {};

	d.bbX = b.bottomBracketX;
	d.bbY = height - b.bottomBracketY;
	d.backWheelX = b.backHubX;
	d.frontWheelX = b.frontHubX;
	d.wheelY = height - b.hubY;
	d.seatTubeTopX = b.seatTubeTopCenterX;
	d.seatTubeTopY = height - b.seatTubeTopCenterY;
	d.headTubeTopX = b.headTubeTopCenterX;
	d.headTubeTopY = height - b.headTubeTopCenterY;
	d.headTubeBottomX = b.headTubeBottomCenterX;
	d.headTubeBottomY = height - b.headTubeBottomCenterY;
	d.headsetTopX = d.headTubeTopX - b.headsetTopStack * Snap.cos(b.headTubeAngle);
	d.headsetTopY = d.headTubeTopY - b.headsetTopStack * Snap.sin(b.headTubeAngle);
	d.spacerTopX = d.headsetTopX - b.headsetSpacersStack * Snap.cos(b.headTubeAngle);
	d.spacerTopY = d.headsetTopY - b.headsetSpacersStack * Snap.sin(b.headTubeAngle);
	d.headsetBottomX = d.headTubeBottomX + b.headsetBottomStack * Snap.cos(b.headTubeAngle);
	d.headsetBottomY = d.headTubeBottomY + b.headsetBottomStack * Snap.sin(b.headTubeAngle);
	d.cosSTAngle = Snap.cos(b.seatTubeAngle);
	d.sinSTAngle = Snap.sin(b.seatTubeAngle);
	d.tanSTAngle = Snap.tan(b.seatTubeAngle);
	d.cosHTAngle = Snap.cos(b.headTubeAngle);
	d.sinHTAngle = Snap.sin(b.headTubeAngle);
	d.topTubeBackX = b.seatTubeTopToTopTubeCenter * d.cosSTAngle + d.seatTubeTopX;
	d.topTubeBackY = d.seatTubeTopY + b.seatTubeTopToTopTubeCenter * d.sinSTAngle;
	d.topTubeFrontX = b.headTubeTopToTopTubeCenter * d.cosHTAngle + d.headTubeTopX;
	d.topTubeFrontY = d.headTubeTopY + b.headTubeTopToTopTubeCenter * d.sinHTAngle;

	d.steererTopLength = b.headsetTopStack + b.headsetSpacersStack + b.stemStack;
	d.stemAbsAngle = 90 - b.headTubeAngle - b.stemAngle;
	d.stemBackX = d.headTubeTopX - d.cosHTAngle * (d.steererTopLength - b.stemStack * 0.5);
	d.stemBackY = d.headTubeTopY - d.sinHTAngle * (d.steererTopLength - b.stemStack * 0.5);
	d.stemFrontX = d.stemBackX + Snap.cos(d.stemAbsAngle) * b.stemLength;
	d.stemFrontY = d.stemBackY - Snap.sin(d.stemAbsAngle) * b.stemLength;
	d.steererTopX = d.headTubeTopX - d.cosHTAngle * d.steererTopLength;
	d.steererTopY = d.headTubeTopY - d.sinHTAngle * d.steererTopLength;
	d.hoodsTopX = b.hoodsRestTopX;
	d.hoodsTopY = height - b.hoodsRestTopY;

	d.saddleCToBack = b.saddleLength - b.saddleFrontToCenter;
	d.cosSAngle = Snap.cos(b.saddleAngle);
	d.sinSAngle = Snap.sin(b.saddleAngle);
	d.tanSAngle = Snap.tan(b.saddleAngle);
	d.saddleCY = height - b.saddleTopY;
	d.saddleCX = b.saddleBackX + d.cosSAngle * d.saddleCToBack;
	d.saddleBackX = b.saddleBackX;
	d.saddleBackY = d.saddleCY - d.sinSAngle * d.saddleCToBack;
	d.saddleFrontX = d.saddleBackX + d.cosSAngle * b.saddleLength;
	d.saddleFrontY = d.saddleBackY + d.sinSAngle * b.saddleLength;

	return d;
    }

    function drawShadowBike(s, b, d, xyDiff) {
	var tx, ty;
	var bbShellRadius = 20;
	var xd = xyDiff.x;
	var yd = xyDiff.y;

	var stroke = 'rgba(0,0,0,0.5)';
	var frameAttr = {'stroke': stroke, 'stroke-width': 4, 'stroke-dasharray': '4 4' };
	var thinAttr = {'stroke': stroke, 'stroke-width': 2, 'stroke-dasharray': '3 3' };
	var pointAttr = {'stroke': stroke, 'stroke-width': 2, 'fill': 'none' };
	s.line(d.topTubeBackX+xd, d.topTubeBackY+yd, d.topTubeFrontX+xd, d.topTubeFrontY+yd).attr(frameAttr);
	s.line(d.backWheelX+xd, d.wheelY+yd, d.bbX+xd, d.bbY+yd).attr(frameAttr);
	s.line(d.headTubeTopX+xd, d.headTubeTopY+yd, d.headTubeBottomX+xd, d.headTubeBottomY+yd).attr(frameAttr);
	s.line(d.bbX+xd, d.bbY+yd, d.seatTubeTopX+xd, d.seatTubeTopY+yd).attr(frameAttr);

	// fork
	s.line(d.headsetBottomX+xd, d.headsetBottomY+yd, d.frontWheelX+xd, d.wheelY+yd).attr(frameAttr);

	// bottom bracket
	s.ellipse(d.bbX+xd, d.bbY+yd, bbShellRadius, bbShellRadius).attr(frameAttr).attr('fill', 'none');
	s.ellipse(d.bbX+xd, d.bbY+yd, 2, 2).attr(pointAttr);

	// hubs/wheels
	s.ellipse(d.backWheelX+xd, d.wheelY+yd, 2, 2).attr(pointAttr);
	s.ellipse(d.frontWheelX+xd, d.wheelY+yd, 2, 2).attr(pointAttr);
	s.ellipse(d.backWheelX+xd, d.wheelY+yd, b.wheelRadius, b.wheelRadius).attr(frameAttr).attr('fill', 'none');
	s.ellipse(d.frontWheelX+xd, d.wheelY+yd, b.wheelRadius, b.wheelRadius).attr(frameAttr).attr('fill', 'none');

	// cranks
	tx = Snap.cos(60) * b.crankLength;
	ty = Snap.sin(60) * b.crankLength;
	s.path("M" + (d.bbX+xd-tx) + " " + (d.bbY+yd+ty) + "A" + b.crankLength + " " + b.crankLength + " 0 0 0 " + (d.bbX+xd+Snap.cos(30)*b.crankLength) + " " + (d.bbY+yd-Snap.sin(30)*b.crankLength)).attr(thinAttr).attr('fill', 'none');

	// headset, stem and handlebar
	s.line(d.stemBackX+xd, d.stemBackY+yd, d.stemFrontX+xd, d.stemFrontY+yd).attr(frameAttr);
	s.ellipse(d.stemFrontX+xd, d.stemFrontY+yd, b.handlebarDiameter * 0.5, b.handlebarDiameter * 0.5).attr(frameAttr).attr({'fill': 'none'});

	tx = d.hoodsTopX+xd - 65.3;
	ty = d.hoodsTopY+yd + 3.1;
	var lever = s.path("m " + tx + "," + ty + svgSpriteLever).attr(thinAttr).attr({'fill':'none'});

	s.line(d.stemFrontX+xd, d.stemFrontY+yd-0.5*b.handlebarDiameter, d.hoodsTopX+xd, d.hoodsTopY+yd).attr(thinAttr);
	s.ellipse(d.hoodsTopX+xd, d.hoodsTopY+yd, 5, 5).attr(pointAttr);

	// saddle
	s.line(d.saddleBackX+xd, d.saddleBackY+yd, d.saddleFrontX+xd, d.saddleFrontY+yd).attr(frameAttr);
	s.ellipse(d.saddleCX+xd, d.saddleCY+yd, 5, 5).attr(pointAttr);
    }

    function refreshSvg() {
	var b = glob.bike;
	var tx, ty, th, angle;
	var sw = 2.0;
        var s = Snap("#bike");
	var height = b.saddleTopY + 180;
	var floorY = height;
	var wallX = 0;
	var bbShellRadius = 20;
	var hubRadius = 10;
	var seatpostDiameter = 27.2;
	s.clear();

	var d = deriveMeasurements(b, height);

	// wheels
	s.ellipse(d.backWheelX, d.wheelY, b.wheelRadius-13, b.wheelRadius-13).attr({stroke: '#cec', 'stroke-width': 26, 'fill': 'none'});
	s.ellipse(d.backWheelX, d.wheelY, b.wheelRadius, b.wheelRadius).attr({stroke: '#0a0', 'stroke-width': sw, 'fill': 'none'});
	s.ellipse(d.frontWheelX, d.wheelY, b.wheelRadius-13, b.wheelRadius-13).attr({stroke: '#cec', 'stroke-width': 26, 'fill': 'none'});
	s.ellipse(d.frontWheelX, d.wheelY, b.wheelRadius, b.wheelRadius).attr({stroke: '#0a0', 'stroke-width': sw, 'fill': 'none'});

	// XY offset
	var xyStroke = ($("#btnMeasXY").hasClass("btn-success")) ? "#000" : "transparent";
	if (b.offsetY > 0) {
	    s.line(b.backHubX - 150, height - b.offsetY, b.frontHubX + 150, height - b.offsetY).attr({'stroke': xyStroke, 'stroke-width': 1, 'stroke-dasharray': '10, 10' });
	}
	if (b.offsetX > 0) {
	    s.line(b.offsetX, height - b.hubY - 300, b.offsetX, height - b.hubY + 300).attr({'stroke': xyStroke, 'stroke-width': 1, 'stroke-dasharray': '10, 10' });
	}

	// chainstay, seat tube, top tube
	s.line(d.topTubeBackX, d.topTubeBackY, d.topTubeFrontX, d.topTubeFrontY).attr({'stroke': '#fbb', 'stroke-width': 30 });
	s.polygon(d.backWheelX, d.wheelY-8, d.backWheelX, d.wheelY+8, d.bbX, d.bbY+15, d.bbX, d.bbY-15).attr({'stroke': 'none', 'fill': '#fbb' });
	s.line(d.headTubeTopX, d.headTubeTopY, d.headTubeBottomX, d.headTubeBottomY).attr({'stroke': '#fbb', 'stroke-width': 30 });
	s.line(d.headTubeBottomX, d.headTubeBottomY, d.headsetBottomX, d.headsetBottomY).attr({'stroke': '#9f9', 'stroke-width': 30 });
	s.line(d.headTubeTopX, d.headTubeTopY, d.headsetTopX, d.headsetTopY).attr({'stroke': '#9f9', 'stroke-width': 30 });
	s.line(d.headsetTopX, d.headsetTopY, d.spacerTopX, d.spacerTopY).attr({'stroke': '#bbb', 'stroke-width': 30 });
	s.line(d.bbX, d.bbY, d.seatTubeTopX, d.seatTubeTopY).attr({'stroke': '#fbb', 'stroke-width': 30 });

	s.line(d.topTubeBackX, d.topTubeBackY, d.topTubeFrontX, d.topTubeFrontY).attr({'stroke': '#a00', 'stroke-width': sw });
	s.line(d.backWheelX, d.wheelY, d.bbX, d.bbY).attr({'stroke': '#a00', 'stroke-width': sw });
	s.line(d.bbX, d.bbY, d.seatTubeTopX, d.seatTubeTopY).attr({'stroke': '#a00', 'stroke-width': sw });
	s.line(d.headTubeTopX, d.headTubeTopY, d.headTubeBottomX, d.headTubeBottomY).attr({'stroke': '#a00', 'stroke-width': sw });
	s.line(d.headTubeBottomX, d.headTubeBottomY, d.headTubeBottomX, d.headTubeBottomY).attr({'stroke': '#888', 'stroke-width': sw });
	s.line(d.headTubeTopX, d.headTubeTopY, d.headsetTopX, d.headsetTopY).attr({'stroke': '#888', 'stroke-width': sw });
	s.line(d.headTubeBottomX, d.headTubeBottomY, d.headsetBottomX, d.headsetBottomY).attr({'stroke': '#aaa', 'stroke-width': sw });
	s.line(d.topTubeBackX, d.topTubeBackY, d.backWheelX, d.wheelY).attr({'stroke': '#e66', 'stroke-dasharray': '10, 10', 'stroke-width': sw });
	tx = 30*Snap.cos(b.headTubeAngle);
	ty = 30*Snap.sin(b.headTubeAngle);
	s.line(d.headTubeBottomX-tx, d.headTubeBottomY-ty, d.bbX, d.bbY).attr({'stroke': '#e66', 'stroke-dasharray': '10, 10', 'stroke-width': sw });

	// cranks
	tx = Snap.cos(60) * b.crankLength;
	ty = Snap.sin(60) * b.crankLength;
	s.path("M" + (d.bbX-tx) + " " + (d.bbY+ty) + "A" + b.crankLength + " " + b.crankLength + " 0 0 0 " + (d.bbX+Snap.cos(30)*b.crankLength) + " " + (d.bbY-Snap.sin(30)*b.crankLength)).attr({'fill': 'none', 'stroke-dasharray': '5, 5', 'stroke': '#00a', 'stroke-width': 1 });
	s.ellipse(d.bbX, d.bbY+b.crankLength, 5, 5).attr({stroke: '#00a', 'stroke-width': sw, 'fill': 'none'});

	// fork
	tx = Snap.cos(90-b.headTubeAngle);
	ty = Snap.sin(90-b.headTubeAngle);
	s.polygon(d.headsetBottomX-tx*15, d.headsetBottomY+ty*15, d.headsetBottomX+tx*15, d.headsetBottomY-ty*15,
		  d.frontWheelX+tx*8, d.wheelY-ty*8, d.frontWheelX-tx*8, d.wheelY+ty*8).attr({'stroke': 'none', 'fill': '#bbf' });
	s.line(d.headsetBottomX, d.headsetBottomY, d.frontWheelX, d.wheelY).attr({'stroke': '#00a', 'stroke-width': sw });

	// bottom bracket
	s.ellipse(d.bbX, d.bbY, bbShellRadius, bbShellRadius).attr({stroke: '#a00', 'stroke-width': sw, 'fill': '#fff', 'fill-opacity': 1});
	s.ellipse(d.bbX, d.bbY, 2, 2).attr({stroke: '#a00', 'stroke-width': sw, 'fill': 'none'});

	// hubs
	s.ellipse(d.backWheelX, d.wheelY, hubRadius, hubRadius).attr({stroke: '#a00', 'stroke-width': sw, 'fill': '#fff', 'fill-opacity': 1});
	s.ellipse(d.backWheelX, d.wheelY, 2, 2).attr({stroke: '#a00', 'stroke-width': sw, 'fill': 'none'});
	s.ellipse(d.frontWheelX, d.wheelY, hubRadius, hubRadius).attr({stroke: '#a00', 'stroke-width': sw, 'fill': '#fff', 'fill-opacity': 1});
	s.ellipse(d.frontWheelX, d.wheelY, 2, 2).attr({stroke: '#a00', 'stroke-width': sw, 'fill': 'none'});


	// d.headset, stem and handlebar
	s.line(d.spacerTopX, d.spacerTopY, d.steererTopX, d.steererTopY).attr({'stroke': '#bbf', 'stroke-width': 30 });
	var stemDiameter = 30;
	if (stemDiameter > b.stemStack-4) {
	    stemDiameter = b.stemStack-4;
	}
	if (stemDiameter > b.handlebarDiameter-2) {
	    stemDiameter = b.handlebarDiameter-2;
	}
	if (stemDiameter < 0) {
	    stemDiameter = 1;
	}
	s.line(d.stemBackX, d.stemBackY, d.stemFrontX, d.stemFrontY).attr({'stroke': '#bbf', 'stroke-width': stemDiameter });
	s.line(d.headsetTopX, d.headsetTopY, d.steererTopX, d.steererTopY).attr({'stroke': '#00a', 'stroke-width': sw });
	s.ellipse(d.stemFrontX, d.stemFrontY, b.handlebarDiameter * 0.5, b.handlebarDiameter * 0.5).attr({stroke: '#00a', 'stroke-width': sw, 'fill': '#fff', 'fill-opacity': 1});
	s.line(d.stemBackX, d.stemBackY, d.stemFrontX, d.stemFrontY).attr({'stroke': '#00a', 'stroke-width': sw });

	tx = d.hoodsTopX - 65.3;
	ty = d.hoodsTopY + 3.1;
	var lever = s.path("m " + tx + "," + ty + svgSpriteLever).attr({stroke: 'none', 'fill': '#ddd'});

	s.line(d.stemFrontX, d.stemFrontY-0.5*b.handlebarDiameter, d.hoodsTopX, d.hoodsTopY).attr({'stroke': '#66e', 'stroke-width': sw, 'stroke-dasharray': '7, 7' });
	s.ellipse(d.hoodsTopX, d.hoodsTopY, 5, 5).attr({stroke: '#00a', 'stroke-width': sw, 'fill': 'none'});

	// saddle
	s.polygon(d.saddleBackX, d.saddleBackY, d.saddleBackX-20*d.sinSAngle, d.saddleBackY+20*d.cosSAngle, d.saddleFrontX-5*d.sinSAngle, d.saddleFrontY+5*d.cosSAngle, d.saddleFrontX, d.saddleFrontY).attr({'stroke': 'none', 'fill': '#bbf' });
	s.line(d.saddleBackX, d.saddleBackY, d.saddleFrontX, d.saddleFrontY).attr({'stroke': '#00a', 'stroke-width': sw });
	s.ellipse(d.saddleCX, d.saddleCY, 5, 5).attr({stroke: '#00a', 'stroke-width': sw, 'fill-opacity': 0});

	// seatpost
	var seatpostIntersectX = (d.bbX * d.tanSTAngle - d.saddleBackX * d.tanSAngle - d.bbY + d.saddleBackY) / (d.tanSTAngle - d.tanSAngle);
	var seatpostIntersectY = d.bbY - (d.bbX - seatpostIntersectX) * d.tanSTAngle;
	var seatpostTopY = seatpostIntersectY + b.saddleStack / Snap.sin(b.seatTubeAngle - b.saddleAngle);
	var seatpostTopX = d.seatTubeTopX - (d.seatTubeTopY - seatpostTopY) / d.tanSTAngle;
	var sbAngle = 90 - b.seatTubeAngle + b.saddleAngle;
	var setbackAlongSaddle = b.seatpostSetback / Snap.cos(sbAngle);
	var setbackTopX = seatpostTopX - setbackAlongSaddle * d.cosSAngle;
	var setbackTopY = seatpostTopY - setbackAlongSaddle * d.sinSAngle;
	var seatpostSbAngle = 60;
	var sbAngle2 = seatpostSbAngle - (90 - b.seatTubeAngle);
	th = b.seatpostSetback / Snap.cos(seatpostSbAngle);
	tx = th * Snap.cos(sbAngle2);
	ty = th * Snap.sin(sbAngle2);
	var setbackBottomX = setbackTopX + tx;
	var setbackBottomY = setbackTopY + ty;

	// saddle rail
	var srSpan = 20;
	var srBackX = setbackTopX - srSpan * d.cosSAngle;
	var srBackY = setbackTopY - srSpan * d.sinSAngle;
	var srFrontX = setbackTopX + srSpan * d.cosSAngle;
	var srFrontY = setbackTopY + srSpan * d.sinSAngle;

	s.polygon(srBackX, srBackY, srFrontX, srFrontY,
		  setbackBottomX+seatpostDiameter*0.5*Snap.cos(90-b.seatTubeAngle),
		  setbackBottomY-seatpostDiameter*0.5*Snap.sin(90-b.seatTubeAngle),
		  d.seatTubeTopX+seatpostDiameter*0.5*Snap.cos(90-b.seatTubeAngle),
		  d.seatTubeTopY-seatpostDiameter*0.5*Snap.sin(90-b.seatTubeAngle),
		  d.seatTubeTopX-seatpostDiameter*0.5*Snap.cos(90-b.seatTubeAngle),
		  d.seatTubeTopY+seatpostDiameter*0.5*Snap.sin(90-b.seatTubeAngle),
		  setbackBottomX-seatpostDiameter*0.5*Snap.cos(90-b.seatTubeAngle),
		  setbackBottomY+seatpostDiameter*0.5*Snap.sin(90-b.seatTubeAngle)).attr({'stroke': 'none', 'fill': '#bbf' });
	s.line(srBackX, srBackY, srFrontX, srFrontY).attr({'stroke': '#00a', 'stroke-width': sw });
	s.line(srBackX, srBackY, d.saddleBackX+30*d.cosSAngle, d.saddleBackY+30*d.sinSAngle).attr({'stroke': '#66e', 'stroke-width': sw, 'stroke-dasharray': '7, 7' });
	s.line(srFrontX, srFrontY, d.saddleFrontX-30*d.cosSAngle, d.saddleFrontY-30*d.sinSAngle).attr({'stroke': '#66e', 'stroke-width': sw, 'stroke-dasharray': '7, 7' });
	s.line(d.seatTubeTopX, d.seatTubeTopY, setbackBottomX, setbackBottomY).attr({'stroke': '#00a', 'stroke-width': sw });
	s.line(setbackBottomX, setbackBottomY, setbackTopX, setbackTopY).attr({'stroke': '#00a', 'stroke-width': sw });

	// measurements
	var ze = 0.01; // "invisible" extra distance for measurements that can be zero to keep direction of line
	measLine('saddleFrontToCenter', s, d.saddleCX, d.saddleCY, d.saddleFrontX, d.saddleFrontY, false, 60);
	measLine('saddleLength', s, d.saddleBackX, d.saddleBackY, d.saddleFrontX, d.saddleFrontY, false, 90);
	measAngle('saddleAngle', s, d.saddleBackX, d.saddleBackY, d.saddleBackX - 100*Snap.cos(b.saddleAngle), d.saddleBackY - 100*Snap.sin(b.saddleAngle));
	angle = b.headTubeAngle + b.stemAngle;
	measAngle('stemAngle', s, d.stemBackX, d.stemBackY, d.stemBackX - 180*Snap.cos(angle), d.stemBackY - 180*Snap.sin(angle), d.stemBackX - 180*Snap.cos(b.headTubeAngle), d.stemBackY - 180*Snap.sin(b.headTubeAngle));

	measLine('offsetX', s, wallX+b.offsetX+ze, d.wheelY-250, wallX, d.wheelY-250, false, 0);
	tx = d.backWheelX+b.wheelBase/2+100;
	measLine('offsetY', s, tx, floorY-b.offsetY, tx, floorY+ze, false, 0);

	measLine('bottomBracketX', s, d.bbX, d.bbY, wallX, d.bbY, false, 0);
	measLine('bottomBracketY', s, d.bbX, d.bbY, d.bbX, floorY, false, 50);

	measLine('backHubX', s, d.backWheelX, d.wheelY, wallX, d.wheelY, false, 0);
	measLine('frontHubX', s, d.frontWheelX, d.wheelY, wallX, d.wheelY, true, 30, false, 0.3);
	measLine('hubY', s, d.backWheelX, d.wheelY, d.backWheelX, floorY, false, 0);

	measLine('seatTubeTopCenterX', s, d.seatTubeTopX, d.seatTubeTopY, wallX, d.seatTubeTopY, false, 0);
	measLine('seatTubeTopCenterY', s, d.seatTubeTopX, d.seatTubeTopY, d.seatTubeTopX, floorY, false, 0);

	measLine('headTubeTopCenterX', s, d.headTubeTopX, d.headTubeTopY, wallX, d.headTubeTopY, true, 30, false, 0.3);
	measLine('headTubeTopCenterY', s, d.headTubeTopX, d.headTubeTopY, d.headTubeTopX, floorY, false, 0);
	measLine('headTubeBottomCenterX', s, d.headTubeBottomX, d.headTubeBottomY, wallX, d.headTubeBottomY, false, 0, false, 0.3);
	measLine('headTubeBottomCenterY', s, d.headTubeBottomX, d.headTubeBottomY, d.headTubeBottomX, floorY, false, 0);

	var handlebarTopY = d.stemFrontY - b.handlebarDiameter * 0.5;
	var handlebarBackX = d.stemFrontX - b.handlebarDiameter * 0.5;
	measLine('handlebarBackX', s, handlebarBackX, d.stemFrontY, wallX, d.stemFrontY, true, b.handlebarDiameter * 0.5 + 15, false, 0.3);
	measLine('handlebarTopY', s, d.stemFrontX, handlebarTopY, d.stemFrontX, floorY, false, b.handlebarDiameter * 0.5 + 15);

	measLine('saddleTopY', s, d.saddleCX, d.saddleCY, d.saddleCX, floorY, true, 0);
	measLine('saddleBackX', s, d.saddleBackX, d.saddleBackY, wallX, d.saddleBackY, true, 50);

	measLine('hoodsRestTopX', s, d.hoodsTopX, d.hoodsTopY, wallX, d.hoodsTopY, true, 50, false, 0.3);
	measLine('hoodsRestTopY', s, d.hoodsTopX, d.hoodsTopY, d.hoodsTopX, floorY, false, 50);

	measLine('headsetBottomStack', s, d.headTubeBottomX-ze*Snap.cos(b.headTubeAngle), d.headTubeBottomY-ze*Snap.sin(b.headTubeAngle), d.headsetBottomX, d.headsetBottomY, false, 50);
	tx = (b.forkRake+ze) * Snap.cos(90-b.headTubeAngle);
	ty = (b.forkRake+ze) * Snap.sin(90-b.headTubeAngle);
	measLine('forkRake', s, [d.frontWheelX - tx, d.headsetBottomX], [d.wheelY + ty, d.headsetBottomY], d.frontWheelX, d.wheelY, true, 50);
	measLine('forkLength', s, [d.headsetBottomX + tx, d.headsetBottomX], [d.headsetBottomY - ty, d.headsetBottomY], d.frontWheelX, d.wheelY, false, 50);

	measLine('headsetTopStack', s, d.headTubeTopX, d.headTubeTopY, d.headsetTopX-ze*Snap.cos(b.headTubeAngle), d.headsetTopY-ze*Snap.sin(b.headTubeAngle), true, 50);
	measLine('headsetSpacersStack', s, d.spacerTopX-ze*Snap.cos(b.headTubeAngle), d.spacerTopY-ze*Snap.sin(b.headTubeAngle), d.headsetTopX, d.headsetTopY, true, 100);
	measLine('stemStack', s, d.steererTopX, d.steererTopY, d.spacerTopX, d.spacerTopY, true, 50);
	measLine('stemLength', s, d.stemBackX, d.stemBackY, d.stemFrontX, d.stemFrontY, false, 100);
	measLine('handlebarDiameter', s, d.stemFrontX + b.handlebarDiameter/2, d.stemFrontY, d.stemFrontX - b.handlebarDiameter/2, d.stemFrontY, true, 50, true);
	measLine('saddleStack', s, srBackX, srBackY, srBackX+Snap.sin(b.saddleAngle)*(b.saddleStack+ze), srBackY-Snap.cos(b.saddleAngle)*(b.saddleStack+ze), false, 80);
	measLine('seatpostSetback', s, [ setbackBottomX - Snap.cos(90-b.seatTubeAngle) * (b.seatpostSetback+ze), setbackTopX ], [ setbackBottomY + Snap.sin(90-b.seatTubeAngle) * (b.seatpostSetback+ze), setbackTopY ], setbackBottomX, setbackBottomY, true, 25);

	measLine('crankLength', s, d.bbX, d.bbY, d.bbX, d.bbY+b.crankLength, true, 0, true);
	measLine('handlebarAndHoodsReach', s, d.stemFrontX, d.stemFrontY-0.5*b.handlebarDiameter, d.hoodsTopX, d.hoodsTopY, false, 100-b.handlebarDiameter/2);
	angle = Snap.deg(Math.atan2(d.hoodsTopY - (d.stemFrontY - 0.5*b.handlebarDiameter), d.hoodsTopX - d.stemFrontX));
	tx = d.stemFrontX;
	ty = d.stemFrontY - 0.5*b.handlebarDiameter;
	th = 280;
	measAngle('stemToHoodsAngle', s, tx, ty, tx + th*Snap.cos(angle), ty + th*Snap.sin(angle), tx+th, ty);

	measLine('forkLengthDiagonal', s, d.headsetBottomX, d.headsetBottomY, d.frontWheelX, d.wheelY, true, 80);

	measLine('stack', s, [ d.headTubeTopX, d.bbX ], d.bbY, d.headTubeTopX, d.headTubeTopY, false, b.reach-100);
	measLine('reach', s, d.headTubeTopX, [ d.bbY, d.headTubeTopY ], d.bbX, d.bbY, true, b.bottomBracketDrop+100);
	ty = b.headTubeTopCenterY - b.seatTubeTopCenterY;
	measLine('topTubeHorizontal', s, d.seatTubeTopX - ty / Snap.tan(b.seatTubeAngle), d.headTubeTopY, d.headTubeTopX, d.headTubeTopY, false, 50);
	ty = d.seatTubeTopY - d.topTubeFrontY;
	measLine('topTubeEffective', s, d.seatTubeTopX - ty / Snap.tan(b.seatTubeAngle), d.topTubeFrontY, d.topTubeFrontX, d.topTubeFrontY, true, 70);
	tx = (b.bottomBracketY-b.offsetY) / Snap.tan(b.seatTubeAngle);
	measAngle('seatTubeAngle', s, d.bbX + tx , floorY-b.offsetY, d.bbX, d.bbY);
	tx = (b.headTubeBottomCenterY-b.offsetY) / Snap.tan(b.headTubeAngle);
	measAngle('headTubeAngle', s, d.headTubeBottomX + tx , floorY-b.offsetY, d.headTubeBottomX, d.headTubeBottomY);

	measLine('bottomBracketDrop', s, [ d.bbX, d.backWheelX ], d.wheelY, d.bbX, d.bbY+ze, false, 60);
	measLine('bottomBracketHeight', s, d.bbX, d.bbY, d.bbX, floorY-b.offsetY, true, 60);
	measLine('wheelBase', s, d.backWheelX, d.wheelY, d.frontWheelX, d.wheelY, true, 100);
	measLine('wheelRadius', s, d.backWheelX, d.wheelY, d.backWheelX, d.wheelY - b.wheelRadius, true, 0);
	measLine('chainStayLength', s, d.backWheelX, d.wheelY, d.bbX, d.bbY, true, 120);
	measLine('chainStayLengthHorizontal', s, d.bbX, [d.wheelY, d.bbY], d.backWheelX, d.wheelY, true, 50);
	measLine('bottomBracketToFrontHub', s, d.bbX, d.bbY, d.frontWheelX, d.wheelY, true, 120);
	measLine('bottomBracketToFrontHubHorizontal', s, d.bbX, [d.wheelY, d.bbY], d.frontWheelX, d.wheelY, false, 50);
	measLine('seatTubeCenterToTop', s, d.bbX, d.bbY, d.seatTubeTopX, d.seatTubeTopY, false, 100);
	measLine('topTubeCenterToCenter', s, d.topTubeBackX, d.topTubeBackY, d.topTubeFrontX, d.topTubeFrontY, true, 100);
	measLine('seatTubeTopToTopTubeCenter', s, d.topTubeBackX, d.topTubeBackY, d.seatTubeTopX-ze*Snap.cos(b.seatTubeAngle), d.seatTubeTopY-ze*Snap.sin(b.seatTubeAngle), false, 50);
	measLine('headTubeTopToTopTubeCenter', s, d.topTubeFrontX, d.topTubeFrontY, d.headTubeTopX-ze*Snap.cos(b.headTubeAngle), d.headTubeTopY-ze*Snap.sin(b.headTubeAngle), false, 100);
	measLine('headTubeLength', s, d.headTubeBottomX, d.headTubeBottomY, d.headTubeTopX, d.headTubeTopY, true, 100);

	measLine('saddleTopToBottomBracket', s, d.bbX, d.bbY, d.saddleCX, d.saddleCY, false, 150);

	tx = b.seatpostSetback * Snap.cos(90 - b.seatTubeAngle);
	ty = b.seatpostSetback * Snap.sin(90 - b.seatTubeAngle);
	measLine('seatpostExtension', s, [ setbackTopX + tx, setbackTopX ], [ setbackTopY - ty, setbackTopY ], d.seatTubeTopX, d.seatTubeTopY, true, 100);
	measLine('saddleFrontToBottomBracket', s, d.bbX, [ d.saddleFrontY, d.bbY ], d.saddleFrontX, d.saddleFrontY, false, d.bbY-d.saddleFrontY-290);
	measLine('saddleFrontToHandlebarCenter', s, d.stemFrontX, [ d.saddleFrontY, d.stemFrontY+b.handlebarDiameter/2 ], d.saddleFrontX, d.saddleFrontY, true, 50);
	measLine('saddleTopToHandlebarTop', s, [ d.stemFrontX, d.saddleCX ], d.saddleCY, d.stemFrontX, d.stemFrontY-b.handlebarDiameter/2, true, d.stemFrontX - d.saddleFrontX - 30);

	measLine('saddleTopToStemFront', s, d.saddleCX, d.saddleCY, d.stemFrontX, d.stemFrontY, false, 165);

	ty = (d.saddleFrontX + 100 - d.topTubeFrontX) / (d.topTubeFrontX - d.topTubeBackX) * (d.topTubeBackY - d.topTubeFrontY);
	measLine('standoverHeight', s, d.saddleFrontX + 100, d.topTubeFrontY - ty, d.saddleFrontX + 100, floorY, false, 0);

	angle = Snap.deg(Math.atan2(d.wheelY - d.stemFrontY, d.frontWheelX - d.stemFrontX));
	tx = b.handlebarDiameter * 0.5 * Snap.cos(angle);
	ty = b.handlebarDiameter * 0.5 * Snap.sin(angle);
	measLine('frontHubToHandlebarBottom', s, d.stemFrontX+tx, d.stemFrontY+ty, d.frontWheelX, d.wheelY, false, 0);
	angle = Snap.deg(Math.atan2(d.stemFrontY - d.saddleFrontY, d.stemFrontX - d.saddleFrontX));
	tx = b.handlebarDiameter * 0.5 * Snap.cos(angle);
	ty = b.handlebarDiameter * 0.5 * Snap.sin(angle);
	measLine('saddleFrontToHandlebarBack', s, d.saddleFrontX, d.saddleFrontY, d.stemFrontX-tx, d.stemFrontY-ty, false, 0);

	tx = (b.headTubeBottomCenterY-b.offsetY) / Snap.tan(b.headTubeAngle);
	measLine('trail', s, d.headTubeBottomX + tx, [ d.wheelY, floorY-b.offsetY ], d.frontWheelX, d.wheelY, false, b.hubY-b.offsetY - 100);
	measLine('steererColumnLength', s, d.headsetBottomX, d.headsetBottomY, d.steererTopX, d.steererTopY, false, 150);
	tx = b.forkRake * Snap.cos(90-b.headTubeAngle);
	ty = b.forkRake * Snap.sin(90-b.headTubeAngle);
	measLine('steeringLength', s, [d.frontWheelX-tx, d.frontWheelX], [d.wheelY+ty, d.wheelY], d.steererTopX, d.steererTopY, false, 200);
	measLine('pedalAxleToGround', s, d.bbX, d.bbY+b.crankLength, d.bbX, floorY-b.offsetY, true, 30);
	angle = Snap.deg(Math.atan2(d.bbY-d.wheelY,d.frontWheelX-d.bbX));
	measLine('pedalAxleToTire', s, d.bbX+b.crankLength*Snap.cos(angle), d.bbY-b.crankLength*Snap.sin(angle), d.frontWheelX-b.wheelRadius*Snap.cos(angle), d.wheelY+b.wheelRadius*Snap.sin(angle), false, 0);
	measLine('seatpostHeadCenterToSaddleFront', s, [ d.saddleFrontX-Snap.sin(b.saddleAngle)*b.saddleStack, d.saddleFrontX ], [ d.saddleFrontY+Snap.cos(b.saddleAngle)*b.saddleStack, d.saddleFrontY ], setbackTopX, setbackTopY, true, b.saddleStack+30);
	measLine('saddleCenterToBottomBracket', s, d.saddleCX, [ d.bbY, d.saddleCY ], d.bbX, d.bbY, false, b.bottomBracketDrop+100);
	measLine('saddleTopToHoodsRest', s, [ d.hoodsTopX, d.saddleCX ], d.saddleCY, d.hoodsTopX, d.hoodsTopY, true, d.hoodsTopX - d.saddleFrontX - 90);

	if ($("#btnShadowBike").hasClass("btn-success")) {
	    // draw Shadow bike
	    var sb = glob.shadowBike;
	    var sd = deriveMeasurements(sb, height);
	    var ddValue = $("#btnShadowAnchor").attr("data-ddValue");
	    var xyDiff = { x: 0, y: 0 };
	    switch (ddValue) {
	    case 'bottomBracket':
		xyDiff = { x: d.bbX - sd.bbX, y: d.bbY - sd.bbY };
		break;
	    case 'saddleTop':
		xyDiff = { x: d.saddleCX - sd.saddleCX, y: d.saddleCY - sd.saddleCY };
		break;
	    case 'hoodsTop':
		xyDiff = { x: d.hoodsTopX - sd.hoodsTopX, y: d.hoodsTopY - sd.hoodsTopY };
		break;
	    case 'stemFront':
		xyDiff = { x: d.stemFrontX - sd.stemFrontX, y: d.stemFrontY - sd.stemFrontY };
		break;
	    case 'ground':
		xyDiff = { x: d.bbX - sd.bbX, y: b.hubY + b.offsetY - sb.hubY - sb.offsetY };
		break;
	    case 'frontHub':
		xyDiff = { x: b.frontHubX - sb.frontHubX, y: d.wheelY - sd.wheelY };
		break;
	    case 'backHub':
		xyDiff = { x: b.backHubX - sb.backHubX, y: d.wheelY - sd.wheelY };
		break;
	    }
	    drawShadowBike(s, sb, sd, xyDiff);

	    var xd = xyDiff.x;
	    var yd = xyDiff.y;
	    measLine('bottomBracketDeltaX', s, d.bbX, [ sd.bbY+yd, d.bbY ], sd.bbX+xd+ze, sd.bbY+yd, (d.bbX < sd.bbX+xd+ze), 100);
	    measLine('bottomBracketDeltaY', s, [ sd.bbX+xd, d.bbX ], d.bbY, sd.bbX+xd, sd.bbY+yd+ze, (d.bbY > sd.bbY+yd+ze), 100);
	    measLine('saddleTopDeltaX', s, d.saddleCX, [ sd.saddleCY+yd, d.saddleCY ], sd.saddleCX+xd+ze, sd.saddleCY+yd, (d.saddleCX > sd.saddleCX+xd+ze), 50);
	    measLine('saddleTopDeltaY', s, [ sd.saddleCX+xd, d.saddleCX ], d.saddleCY, sd.saddleCX+xd, sd.saddleCY+yd+ze, (d.saddleCY < sd.saddleCY+yd+ze), 250);
	    measLine('stemFrontDeltaX', s, d.stemFrontX, [ sd.stemFrontY+yd, d.stemFrontY ], sd.stemFrontX+xd+ze, sd.stemFrontY+yd, (d.stemFrontX > sd.stemFrontX+xd+ze), 100);
	    measLine('stemFrontDeltaY', s, [ sd.stemFrontX+xd, d.stemFrontX ], d.stemFrontY, sd.stemFrontX+xd, sd.stemFrontY+yd+ze, (d.stemFrontY < sd.stemFrontY+yd+ze), 200);
	    measLine('hoodsTopDeltaX', s, d.hoodsTopX, [ sd.hoodsTopY+yd, d.hoodsTopY ], sd.hoodsTopX+xd+ze, sd.hoodsTopY+yd, (d.hoodsTopX > sd.hoodsTopX+xd+ze), 100);
	    measLine('hoodsTopDeltaY', s, [ sd.hoodsTopX+xd, d.hoodsTopX ], d.hoodsTopY, sd.hoodsTopX+xd, sd.hoodsTopY+yd+ze, (d.hoodsTopY > sd.hoodsTopY+yd+ze), 100);
	}

	s.line(0, 0, 0, height).attr({'stroke': xyStroke, 'stroke-width': 1 });
	var bb = s.getBBox();
	s.line(0, height, bb.w, height).attr({'stroke': xyStroke, 'stroke-width': 1 });

	s.attr({ "viewBox": (bb.x - 10) + " " + (bb.y -10) + " " + (bb.w + 20) + " " + (bb.h + 20) });

    }

    function updateButtons(btn) {
	if (btn) {
	    if (btn.hasClass("btn-danger")) {
		btn.removeClass("btn-danger");
		btn.addClass("btn-success");
	    } else {
		btn.removeClass("btn-success");
		btn.addClass("btn-danger");
	    }
	}
	var extra = ($("#btnMeasFrame").hasClass("btn-success") ||
		     $("#btnMeasComp").hasClass("btn-success") ||
		     $("#btnMeasFit").hasClass("btn-success") ||
		     $("#btnMeasQuick").hasClass("btn-success"));
	$("#btnExtraMeasurements").prop("disabled", !extra);
	var shadowBikeEnabled = $("#btnShadowBike").hasClass("btn-success");
	$("#btnMeasDelta").prop("disabled", !shadowBikeEnabled);
	$("#btnShadowAnchor").prop("disabled", !shadowBikeEnabled);

	refreshSvg();
    }

    function makeBikeExportString(b) {
	var b1 = sortObj(b);
	var text = JSON.stringify(b1, null, '   ');
	return text;
    }

    function bikeToUrlString(b) {
	var b1 = {};
	b1.a = b.offsetX;
	b1.b = b.offsetY;
	b1.c = b.bottomBracketX;
	b1.d = b.bottomBracketY;
	b1.e = b.seatTubeTopCenterX;
	b1.f = b.seatTubeTopCenterY;
	b1.g = b.saddleTopY;
	b1.h = b.saddleBackX;
	b1.i = b.hubY;
	b1.j = b.backHubX;
	b1.k = b.frontHubX;
	b1.l = b.headTubeTopCenterY;
	b1.m = b.headTubeTopCenterX;
	b1.n = b.headTubeBottomCenterY;
	b1.o = b.headTubeBottomCenterX;
	b1.p = b.handlebarTopY;
	b1.q = b.handlebarBackX;
	b1.r = b.hoodsRestTopX;
	b1.s = b.hoodsRestTopY;
	b1.t = b.handlebarDiameter;
	b1.u = b.stemStack;
	b1.v = b.stemAngle;
	b1.w = b.headsetBottomStack;
	b1.x = b.headsetTopStack;
	b1.y = b.saddleLength;
	b1.z = b.saddleStack;
	b1.A = b.saddleAngle;
	b1.B = b.saddleFrontToCenter;
	b1.C = b.seatpostSetback;
	b1.D = b.forkLength;
	b1.E = b.forkRake;
	b1.F = b.crankLength;
	b1.G = b.seatTubeTopToTopTubeCenter;
	b1.H = b.headTubeTopToTopTubeCenter;

	var str = "";
	var name = encodeURIComponent(b.name).replace(/%20/g, '+');
	str += name.length.toString() + name;
	for (var key in b1) {
	    var value = b1[key];
	    value = Math.round(value * 100000) / 100000;
	    str += key + value.toString();
	}
	return str + "Z";
    }

    function urlStringToBike(str) {
	var b1 = {};
	var i = str.charAt(0) == '#' ? 1 : 0;
	var nameLen = parseInt(str.substring(i));
	i += nameLen.toString().length;
	var name = decodeURIComponent(str.substring(i, i + nameLen).replace(/\+/g, '%20'));
	i += nameLen;
	var bad = false;
	while (i < str.length) {
	    var key = str.charAt(i);
	    if (key == 'Z') {
		i++;
		break;
	    }
	    i++;
	    var match = str.substring(i).match("[a-z,A-Z]");
	    var idx = match == null ? str.length - i : match['index'];
	    var value = parseFloat(str.substring(i, i + idx));
	    if (isNaN(value)) {
		break;
	    }
	    i += idx;
	    b1[key] = value;
	}
	if ($.isEmptyObject(b1)) {
	    return { 'bike': {}, 'i': str.length };
	}

	var b = {};

	b.name = name;
	b.offsetX = b1.a;
	b.offsetY = b1.b;
	b.bottomBracketX = b1.c;
	b.bottomBracketY = b1.d;
	b.seatTubeTopCenterX = b1.e;
	b.seatTubeTopCenterY = b1.f;
	b.saddleTopY = b1.g;
	b.saddleBackX = b1.h;
	b.hubY = b1.i;
	b.backHubX = b1.j;
	b.frontHubX = b1.k;
	b.headTubeTopCenterY = b1.l;
	b.headTubeTopCenterX = b1.m;
	b.headTubeBottomCenterY = b1.n;
	b.headTubeBottomCenterX = b1.o;
	b.handlebarTopY = b1.p;
	b.handlebarBackX = b1.q;
	b.hoodsRestTopX = b1.r;
	b.hoodsRestTopY = b1.s;
	b.handlebarDiameter = b1.t;
	b.stemStack = b1.u;
	b.stemAngle = b1.v;
	b.headsetBottomStack = b1.w;
	b.headsetTopStack = b1.x;
	b.saddleLength = b1.y;
	b.saddleStack = b1.z;
	b.saddleAngle = b1.A;
	b.saddleFrontToCenter = b1.B;
	b.seatpostSetback = b1.C;
	b.forkLength = b1.D;
	b.forkRake = b1.E;
	b.crankLength = b1.F;
	b.seatTubeTopToTopTubeCenter = b1.G;
	b.headTubeTopToTopTubeCenter = b1.H;
	return { 'bike': b, 'i': i };
    }

    function parseBikePair(str) {
	var bi = urlStringToBike(str);
	var b1 = bi.bike;
	var b2 = { };
	if (bi.i < str.length) {
	    bi = urlStringToBike(str.substring(bi.i));
	    b2 = bi.bike;
	}
	return [ b1, b2 ];
    }

    function parseLocationHash() {
	if (glob.lastHashBike != window.location.hash) {
	    var bikes = parseBikePair(window.location.hash);
	    normalizeBikeMeasurements(bikes[0]);
	    pushBike(bikes[0]);
	}
    }

    function scrollHelp(divName) {
	var diff = $("#right-column-menu").outerHeight();
	var pos = $("#" + divName).offset().top;
	var current = $('#right-column-content').scrollTop();
	$('#right-column-content').animate({scrollTop: current + pos - diff});
    }

    function hideEditBoxes() {
	$("#editBikeNameInput").hide();
	$("#editNum").hide();
    }

    function registerEventHandlers() {

        $(window).on('hashchange', function() {
            if (glob.suppressHashChange > 0) {
                glob.suppressHashChange--;
            } else {
                parseLocationHash();
            }
        });
	function windowResize() {
	    var h = window.innerHeight - $("#buttonContainer").outerHeight() - $("#drawingHeader").outerHeight() - $("#drawingFooter").outerHeight();
	    if (h < window.innerHeight / 2) {
		h = window.innerHeight / 2;
	    }
	    $("#svgContainer").css('max-height', h);
	    $("#bike").css('max-height', h-2);
	};
        $(window).resize(windowResize);
	windowResize();

	$("#bikeName").on('click', function() {
	    $("#bikeName").hide();
	    $("#editBikeNameInput").val($("#bikeName").text());
	    $("#editBikeNameInput").show();
	    $("#editBikeNameInput").focus();
	});
	$("#editBikeNameInput").on('focusout', function() {
	    var text = $("#editBikeNameInput").val();
	    if (text == "") {
		text = "Unnamed";
	    }
	    $("#bikeName").text(text);
	    glob.bike.name = text;
	    $("#bikeName").show();
	    $("#editBikeNameInput").hide();
	    updateHash();
	});

	$("#editNumInput").on('change', measurementChange);
	$("#editNumInput").on('focusout', function() {
	    $("#editNum").hide();
	});
	$("#btnMeasXY").on('click', function() { updateButtons($("#btnMeasXY")); });
	$("#btnMeasComp").on('click', function() { updateButtons($("#btnMeasComp")); });
	$("#btnMeasFrame").on('click', function() { updateButtons($("#btnMeasFrame")); });
	$("#btnMeasFit").on('click', function() { updateButtons($("#btnMeasFit")); });
	$("#btnMeasQuick").on('click', function() { updateButtons($("#btnMeasQuick")); });
	$("#btnMeasDelta").on('click', function() { updateButtons($("#btnMeasDelta")); });
	$("#btnExtraMeasurements").on('click', function() {
	    var btn = $("#btnExtraMeasurements");
	    if (btn.hasClass("btn-danger")) {
		btn.removeClass("btn-danger");
		btn.addClass("btn-success");
	    } else {
		btn.removeClass("btn-success");
		btn.addClass("btn-danger");
	    }
	    refreshSvg();
	});

	$("#btnShadowBike").on('click', function() {
	    var btn = $(this);
	    if (btn.hasClass("btn-danger")) {
		btn.removeClass("btn-danger");
		btn.addClass("btn-success");
		if ($.isEmptyObject(glob.shadowBike)) {
		    glob.shadowBike = Object.assign({}, glob.bike);
		    glob.shadowBike.name += " #2";
		    updateHash();
		}
	    } else {
		btn.removeClass("btn-success");
		btn.addClass("btn-danger");
	    }
	    updateButtons();
	    refreshSvg();
	});

	if (screenfull.enabled) {
	    screenfull.on('change', function() {
		var btn = $("#btnFullscreen");
		if (screenfull.isFullscreen) {
		    btn.removeClass("btn-danger");
		    btn.addClass("btn-success");
		} else {
		    btn.removeClass("btn-success");
		    btn.addClass("btn-danger");
		}
	    });
	} else {
	    $("#btnFullscreen").prop("disabled", true);
	}

	$("#btnFullscreen").on('click', function() {
	    if (!screenfull.isFullscreen) {
		screenfull.request();
            } else {
		screenfull.exit();
            }
	});

	$("#btnSwapBikes").on('click', function() {
	    if ($.isEmptyObject(glob.shadowBike)) {
		glob.shadowBike = Object.assign({}, glob.bike);
		glob.shadowBike.name += " #2";
	    }
	    var tmp = glob.shadowBike;
	    glob.shadowBike = glob.bike;
	    glob.bike = tmp;
	    tmp = glob.shadowUndoHistory;
	    glob.shadowUndoHistory = glob.undoHistory;
	    glob.undoHistory = tmp;
	    $("#btnUndo").prop("disabled", glob.undoHistory.length == 0);
	    updateName();
	    updateHash();
	    refreshSvg();
	});

	$("#btnUndo").on('click', function() {
	    glob.bike = glob.undoHistory.pop();
	    updateHash();
	    updateName();
	    refreshSvg();
	    if (glob.undoHistory.length == 0) {
		$("#btnUndo").prop("disabled", true);
	    }
	});

	$("#btnHelp").on('click', function() {
	    var btn = $(this);
	    var objs = [ $("#right-column"), $("#right-column-content"), $("#right-column-menu") ];
	    if (btn.hasClass("btn-danger")) {
		btn.removeClass("btn-danger");
		btn.addClass("btn-success");
		objs.forEach(function(obj) {
		    obj.removeClass("slide-out");
		    obj.addClass("slide-in");
		});
	    } else {
		btn.removeClass("btn-success");
		btn.addClass("btn-danger");
		objs.forEach(function(obj) {
		    obj.removeClass("slide-in");
		    obj.addClass("slide-out");
		});
	    }
	});
	$("#btnCloseHelp").on('click', function() {
	    $("#btnHelp").click();
	});

	$("#btnReset").on('click', function() {
	    if (glob.undoHistory.length > 0) {
		glob.undoHistory = [ glob.undoHistory[glob.undoHistory.length-1] ];
	    }
	    var b = {};
	    normalizeBikeMeasurements(b);
	    pushBike(b);
	});

	$("#btnRemoveShadow").on('click', function() {
	    glob.shadowUndoHistory = [];
	    glob.shadowBike = {};
	    $("#btnShadowBike").removeClass("btn-success");
	    $("#btnShadowBike").addClass("btn-danger");
	    updateHash();
	    refreshSvg();
	});

	$(".dropdown-item").on('click', function(e) {
	    if (e.target.parentElement.parentElement.firstElementChild.getAttribute('data-ddValue') == null) {
		return;
	    }
	    e.target.parentElement.parentElement.firstElementChild.textContent = e.target.getAttribute('data-textValue');
	    e.target.parentElement.parentElement.firstElementChild.setAttribute('data-ddValue', e.target.getAttribute('data-ddValue'));
	    refreshSvg();
	});

	$("#btnSave").on('click', function() {
	    saveTextAsFile("bikecalc.txt", makeBikeExportString(glob.bike));
	    $("#exportModal").modal('hide');
	});

//	$("#btnLoad").on('click', function() {
//	    saveTextAsFile("bikecalc.txt", makeBikeExportString(glob.bike));
//	});

	$(document).on('change', ':file', function() {
	    var input = $(this);
	    var numFiles = input.get(0).files ? input.get(0).files.length : 1;
	    var label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
	    input.trigger('fileselect', [numFiles, label]);
	});
	$(':file').on('fileselect', function(event, numFiles, label) {
            var input = $(this).parents('.input-group').find(':text');
	    var log = numFiles > 1 ? numFiles + ' files selected' : label;
            if (input.length) {
		input.val(log);
            } else if (log) {
		loadFileAsText(event.target.files[0], function(fileLoadedEvent) {
		    var text = fileLoadedEvent.target.result;
		    try {
			var b = JSON.parse(text);
			$("#exportTextArea").val(text);
			$("#exportModal").modal('hide');
		    } catch(e) {
			alert(e);
		    }
		});
            }
	});

	$("#btnClear").on('click', function() {
	    $("#exportTextArea").val("");
	});

	$("#btnCopy").on('click', function() {
	    var copyText = document.getElementById("exportTextArea");
	    copyText.select();
	    document.execCommand("Copy");
	    alert("Copied to the clipboard");
	    $("#exportModal").modal('hide');
	});

	$('#exportModal').on('show.bs.modal', function (e) {
	    $("#exportTextArea").val(makeBikeExportString(glob.bike));
	});
	$('#exportModal').on('hide.bs.modal', function (e) {
	    var text = $("#exportTextArea").val();
	    if (text != "" && text != makeBikeExportString(glob.bike)) {
		try {
		    var b = JSON.parse(text);
		    normalizeBikeMeasurements(b);
		    pushBike(b);
		} catch(e) {
		    alert(e); // error in the above string (in this case, yes)!
		    return false;
		}
	    }
	});

	$('#importUrlModal').on('show.bs.modal', function (e) {
	    $("#importUrlTextArea").val("");
	    $("#btnImportMain").text("Import Main Bike");
	    $("#btnImportMain").prop("disabled", true);
	    $("#btnImportShadow").text("Import Shadow Bike");
	    $("#btnImportShadow").prop("disabled", true);
	});
	$('#importUrlTextArea').on('input', function (e) {
	    var url = $("#importUrlTextArea").val();
	    url = url.substring(url.indexOf("#"));
	    var bikes = parseBikePair(url);
	    if (bikes[0].name !== undefined) {
		$("#btnImportMain").prop("disabled", false);
		$("#btnImportMain").text("Import " + bikes[0].name);
	    } else {
		$("#btnImportMain").prop("disabled", true);
		$("#btnImportMain").text("Import Main Bike");
	    }
	    if (bikes[1].name !== undefined) {
		$("#btnImportShadow").prop("disabled", false);
		$("#btnImportShadow").text("Import " + bikes[1].name);
	    } else {
		$("#btnImportShadow").prop("disabled", true);
		$("#btnImportShadow").text("Import Shadow Bike");
	    }
	});

	function importFromUrl(bike_index) {
	    var url = $("#importUrlTextArea").val();
	    url = url.substring(url.indexOf("#"));
	    var bikes = parseBikePair(url);
	    if (bikes[bike_index].name === undefined) {
		return;
	    }
	    $("#importUrlModal").modal('hide');
	    // make processing after closing to make gui more responsive
	    setTimeout(function() {
		normalizeBikeMeasurements(bikes[bike_index]);
		pushBike(bikes[bike_index]);
	    }, 0);
	}

	$('#btnImportMain').on('click', function (e) {
	    importFromUrl(0);
	});
	$('#btnImportShadow').on('click', function (e) {
	    importFromUrl(1);
	});
    }

    function init() {

	var bikes = parseBikePair(window.location.hash);
	glob.bike = bikes[0];
	glob.shadowBike = bikes[1];
	normalizeBikeMeasurements(glob.bike);
	if (!$.isEmptyObject(glob.shadowBike)) {
	    normalizeBikeMeasurements(glob.shadowBike);
	}
	$("#bikeName").text(glob.bike.name);
	updateHash();
	$("#btnUndo").prop("disabled", true);

	registerEventHandlers();
	$("#drawingContainer").show();
	$("#buttonContainer").show();
	updateButtons();
	refreshSvg();
	window.app = {};
	window.app.scrollHelp = scrollHelp;
    }

    $(document).ready(init());

})();
