$(function(){
	///////////////////////////////////////////////////////////////////////////////////////
	//						PROGRAMME PRINCIPAL			  								 //
	///////////////////////////////////////////////////////////////////////////////////////
	// col : de 0 à gauche à numberOfColumns - 1 à droite
	// row : de 0 en haut à numberOfRows - 1 en bas
	var intervalTime = 600;		//Temps avant que la piece descende automatiquement
	var numberOfColumns = 10;
	var numberOfRows = 22;
	var motif = []; 			//Tableau contenant les cases pleines !!! Global
	var idInterval;
	var rp = {'x': 0, 'y':0};
	var typeId;
	var gameOver = false;
	var score = 0;
	var tabSchemaPiece =	[ //o-tetrimino jaune
							 { 
								'name': 'o',
								'schema': [1,1,
										   1,1],
							  	'color': 'yellow'
							 },
							 //t-tetrimino
							 {  
								'name': 't',
								'schema': [0,1,0,
										   1,1,1,
										   0,0,0],
								'rotationPoint' : 4,
							  	'color': 'pink'
							 },
							 //s-tetrimino
							 {  
								'name': 's',
								'schema': 	[0,1,1,
										   	 1,1,0,
										   	 0,0,0],
								'rotationPoint' : 1,
							  	'color': 'green'
							 },
							 //z-tetrimino
							 {  
								'name': 'square-blue',
								'schema': [1,1,0,
										   0,1,1,
										   0,0,0],
								'rotationPoint' : 4,
							  	'color': 'red'
							 },
							 //l-tetrimino
							 {  
								'name': 'square-blue',
								'schema': [1,1,1,
										   1,0,0,
										   0,0,0],
								'rotationPoint' : 1,
							  	'color': 'orange'
							 },
							 //j-tetrimino
							 {  
								'name': 'square-blue',
								'schema': [1,1,1,
										   0,0,1,
										   0,0,0],
								'rotationPoint' : 1,
							  	'color': 'blue'
							 }
							];

	init();
	generateRandomPiece();
	idInterval = window.setInterval(scrollDownPiece,intervalTime);

	////////////////////////////////////////////////////////////////////////////////////////
	//								KEYBOARD EVENTS										  //
	////////////////////////////////////////////////////////////////////////////////////////

	$('body').keydown(function(e){
		//get the ascii code of pressed key
		//console.log("key pressed : " + e.keyCode);
		if(e.keyCode == 37){ //Left
			//console.log("Left");
			moveLeft();
		}
		else if(e.keyCode == 38){ //Up - turn
			//console.log("Up");
			//if not a square (because only squares don't rotate)
			if(pieceHaveRp()){
				//rotate the piece
				var actualPiece = getTabPiece();
				var tabNewPiece = rotateClockwise(actualPiece);
				//if there the space for the new piece
					//Show it
				//else try to up
					//else try to right
						//else try to left
				if(!spaceFreeForTab(tabNewPiece)){
					tabNewPiece = rotateCounterClockwise(tabNewPiece);
					//else try to right
						//else try to left
				}
				showPiece(tabNewPiece);
				showShadow(tabNewPiece);
			}
		}
		else if(e.keyCode == 39){ //Right
			//console.log("Right");
			moveRight();
		}
		else if(e.keyCode == 40){ //Down
			//console.log("Down");
			var actualPiece = getTabPiece();
			var tabNewPiece = getDownPiece(actualPiece);

			//Si ma pièce est en contact avec un element du motif ou touche le fond
			if(!spaceFreeForTab(tabNewPiece) || getLowerRowPiece(tabNewPiece) >= numberOfRows){
				getUpPiece(actualPiece);
				//on ajoute la piece au motif actuel
				motif_addPiece(actualPiece);
				hidePiece();
				showMotif();
				//mise à jour de la variable gameOver
				generateRandomPiece();

				if(gameOver){
					console.log('fin de la partie');
				}
			}
			else{
				rp_moveDown();
				showPiece(tabNewPiece);
			}
		}
		else if(e.keyCode == 32){ //space - free fall
			//console.log("space - free fall");
			var nbRow;
			var tabNewPiece;
			//On récupère le tableau de la piece actuelle
			var actualPiece = getTabPiece();
			//get cols from Piece
			tabNewPiece = getLowerPossiblePiece(actualPiece);
			//ajout dans tab motif
			motif_addPiece(tabNewPiece);
			hidePiece();
			showMotif();
			//check gameover
			generateRandomPiece();
			if(gameOver){
				console.log('fin de la partie');
			}
		}
		else if(e.keyCode == 27){ //escape - Menu
			console.log("escape - Menu");
		}

	});

	///////////////////////////////////////////////////////////////////////////////////////
	//								FUNCTIONS											 //
	///////////////////////////////////////////////////////////////////////////////////////

	function init(){
		//reset
		gameOver = false;
		score = 0;
		$("#game-table").empty();
		//affichage
		for (var row = 0; row < numberOfRows; row++) {
			$("#game-table").append('<tr row=' + row + '></tr>');
			for (var col = 0; col < numberOfColumns; col++) {
				$("#game-table tr").last().append('<td row=' + row + ' col=' + col + '></td>');
			};
		};
	}

	function scrollDownPiece(){
		//console.log("Scroll down");
		var actualPiece = getTabPiece();
		var tabNewPiece = getDownPiece(actualPiece);

		//Si ma pièce est en contact avec un element du motif ou touche le fond
		if(!spaceFreeForTab(tabNewPiece) || getLowerRowPiece(tabNewPiece) >= numberOfRows){
			//on ajoute la piece au motif actuel
			getUpPiece(actualPiece);
			motif_addPiece(actualPiece);
			hidePiece();
			showMotif();
			//on stop l'interval
			clearInterval(idInterval);
			//generate new piece and check gameover
			generateRandomPiece();
			if(gameOver){
				console.log('fin de la partie');
			}
			else{
				idInterval = window.setInterval(scrollDownPiece,intervalTime);
				console.log(rp);
			}
		}
		else{
			rp_moveDown();
			showPiece(tabNewPiece);
		}
	}

	function generateRandomPiece(){
		var StartCol, StartRow;
		typeId = getRandomType();
		var tabSchemaPiece = getSchemaPiece(typeId);
		var colorPiece = getColorPiece(typeId);
		var tabGeneratedPiece = [];
		var rpPos = getRotationPoint(typeId);

		//Generate a new Piece
		StartCol = Math.floor((numberOfColumns-1)/2);
		StartRow = 0;
		var col, row, colSup, rowSup;
		
		for (var i = 0; i < tabSchemaPiece.length; i++) {
			if(tabSchemaPiece[i]==1){
				colSup = getColInPieceStrucure(i,tabSchemaPiece.length)-1;
				rowSup = getRowInPieceStructure(i,tabSchemaPiece.length)-1;
				col = StartCol + colSup;
				row = StartRow + rowSup;
				if(rpPos == i){
					tabGeneratedPiece.push({'col':col, 'row':row , rp:true});
					rp_init(col,row);
				}
				else{
					tabGeneratedPiece.push({'col':col, 'row':row , rp:false});
				}
			}
		};
		//show generated piece
		checkIfGameOver(tabGeneratedPiece);
		if(!gameOver){
			showGeneratedPiece(tabGeneratedPiece, colorPiece);
			showShadow(tabGeneratedPiece);
		}
	}

	function checkIfGameOver(tab){
		if(!spaceFreeForTab(tab)){
			gameOver = true;
			clearInterval(idInterval);
		}
	}

	function spaceFreeForTab(tab){
		var free = true;
		var i;
		$(tab).each(function(){
			i = 0;
			while(	i<motif.length && 
					(
						(
							motif[i].col != this.col || motif[i].row != this.row
						) && 
						this.col >= 0 &&
						this.col < numberOfColumns &&
						this.row >= 0 &&
						this.row < numberOfRows
					)
				){
				i++;
			}
			if(i!=motif.length){
				free = false;
			}
		});
		return free;
	}

	function getDownPiece(tab){
		var res = tab.slice();
		for (var i = 0; i < res.length; i++) {
			res[i].row += 1;
		};
		return res;
	}

	function getUpPiece(tab){
		var res = tab.slice();
		for (var i = 0; i < res.length; i++) {
			res[i].row -= 1;
		};

		return res;
	}

	function moveRight(){
		var tabPiece = getTabPiece();
		var canMove = true;

		//move all piece's case to the right
		$(tabPiece).each(function(){
			this.col+=1;
		});
		//Check if this move is possible
		if(!spaceFreeForTab(tabPiece) || getMaxColPiece(tabPiece) >= numberOfColumns){
			canMove = false;
		}
		//if possible, show the new piece
		if(canMove){
			rp_moveRight();
			showPiece(tabPiece);
			showShadow(tabPiece);
		}
	}

	function moveLeft(){
		var tabPiece = getTabPiece();
		var canMove = true;

		//move all piece's case to the right
		$(tabPiece).each(function(){
			this.col-=1;
		});
		//Check if this move is possible
		if(!spaceFreeForTab(tabPiece) || getMinColPiece(tabPiece) < 0){
			canMove = false;
		}
		//if possible, show the new piece
		if(canMove){
			rp_moveLeft();
			showPiece(tabPiece);
			showShadow(tabPiece);
		}

	}

	function rotateClockwise(tab){
		console.log('rotateClockwise');
		var res = tab.slice();
		var rotationMatrix = [0,-1,1,0]; //[cos(teta), -sin(teta), sin(teta), cos(teta)] with teta = 90°
		var diffRp, addToRp;
		for (var i = 0; i < res.length; i++) {
			//if this part of the piece is not the rotation point ==> rotate this part
			if(!partOfPieceIsRp(res[i])){
				diffRp = { 	
							x : res[i].col - rp.x,
							y : res[i].row - rp.y
						 };
				addToRp = { 
							x : diffRp.x * rotationMatrix[0] + diffRp.y * rotationMatrix[1],
							y : diffRp.x * rotationMatrix[2] + diffRp.y * rotationMatrix[3]
						  }
				res[i].col = rp.x + addToRp.x;
				res[i].row = rp.y + addToRp.y;
			}
		};

		if(!spaceFreeForTab(res)){
			res = tab.slice();
		}

		return res;
	}

	function rotateCounterClockwise(tab){
		console.log('rotateCounterClockwise');
		var res = tab.slice();
		var rotationMatrix = [0,1,-1,0]; //[cos(teta), -sin(teta), sin(teta), cos(teta)] with teta = -90°
		var diffRp, addToRp;
		for (var i = 0; i < res.length; i++) {
			//if this part of the piece is not the rotation point ==> rotate this part
			if(!partOfPieceIsRp(res[i])){
				diffRp = { 	
							x : res[i].col - rp.x,
							y : res[i].row - rp.y
						 };
				addToRp = { 
							x : diffRp.x * rotationMatrix[0] + diffRp.y * rotationMatrix[1],
							y : diffRp.x * rotationMatrix[2] + diffRp.y * rotationMatrix[3]
						  }
				res[i].col = rp.x + addToRp.x;
				res[i].row = rp.y + addToRp.y;
			}
		};

		if(!spaceFreeForTab(res)){
			res = tab.slice();
		}

		return res;
	}

	function showPiece(tabPiece){
		var classColor = getClassColorPiece();
		hidePiece();
		$(tabPiece).each(function(){
			$('td[col='+  this.col + '][row='+ this.row + ']').addClass('myPiece ' + classColor);
/*			console.log(rp);
			console.log('to show ?' + partOfPieceIsRp(this));
			console.log("-----------------------------------------------------");*/
			if(partOfPieceIsRp(this)){
				rp_showIt();
			}
		});
	}

	function showGeneratedPiece(tabPiece, color){
		hidePiece();
		$(tabPiece).each(function(){
			$('td[col='+  this.col + '][row='+ this.row + ']').addClass('myPiece color-piece-' + color);
			if(this.rp){
				rp_showIt();
			}
		});
	}


	function getLowerPossiblePiece(tab){
		var tabInter = getDownPiece(tab);
		var tabRes;

		//Si ma pièce est en contact avec un element du motif ou touche le fond
		while(spaceFreeForTab(tabInter) && getLowerRowPiece(tabInter) < numberOfRows){
			tabInter = getDownPiece(tabInter);
		}
		
		tabRes = getUpPiece(tabInter);
		return tabRes;
	}

	function getMinDistance(tab, col){
		var tabMotifOfThisCol = motif_getRows(col);
		var lowerCaseOfCol = getLowerRowPieceOfCol(tab, col);
		var res = numberOfRows;
		var i = 0; 

		if(tabMotifOfThisCol.length == 0){
			res = numberOfRows - lowerCaseOfCol - 1;
		}
		else{
			while(tabMotifOfThisCol[i]<lowerCaseOfCol && i<=tabMotifOfThisCol.length){
				i++;
			}
			res = tabMotifOfThisCol[i] - lowerCaseOfCol - 1;
		}
		return res;
	}

	function hidePiece(){
		$('.myPiece').empty().removeClass();
	}

	/////////////////////////////////////////////////////////////////
	//			FONCTIONS POUR LE POINT DE ROTATION				   //
	/////////////////////////////////////////////////////////////////
	function rp_init(x,y){		rp.x = x;	rp.y = y;	}
	function rp_moveRight(){	rp.x +=1;	}
	function rp_moveLeft(){		rp.x -=1;	}
	function rp_moveDown(){		rp.y +=1;	}
	function rp_moveUp(){		rp.y -=1;	}

	function rp_showIt(){
		$('td[col='+  rp.x + '][row='+ rp.y + ']').addClass('rotation-point');
	}

	function rp_getIt(){
		rp.x = $('.rotation-point').attr('col');
		rp.y = $('.rotation-point').attr('row');
	}

	function pieceHaveRp(){
		return typeId != 0;		
	}

	function partOfPieceIsRp(partOfPiece){
		return partOfPiece.col == rp.x && partOfPiece.row == rp.y;
	}

	/////////////////////////////////////////////////////////////////
	//					FONCTIONS POUR LE MOTIF 				   //
	/////////////////////////////////////////////////////////////////
	function debugMotif(){
		console.table(motif);
	}
	
	function showMotif(){
		//reset
		$('.motif-elt').removeClass();	
		//affichage
		for (var i = motif.length - 1; i >= 0; i--) {
			$('td[col='+ motif[i].col + '][row='+ motif[i].row + ']').addClass('motif-elt ' + motif[i].color);
		};
	}

	function motif_getRows(col){
		var resTab = [];
		//get all row from motif where column = col in resTab
		for (var i = 0; i<motif.length; i++) {
			if(motif[i].col == col){
				resTab.push(motif[i].row);
			}
		};
		resTab.sort();
		return resTab;
	}

	function motif_getColumns(row){
		var resTab = [];
		//get all row from motif where column = col in resTab
		for (var i = 0; i<motif.length; i++) {
			if(motif[i].row == row){
				resTab.push(motif[i].col);
			}
		};
		return resTab;
	}

	function motif_rowComplete(row){
		var tabCol = motif_getColumns(row);
		return tabCol.length == numberOfColumns;
	}

	function motif_addPiece(tab){
		var tabRowAdded = [];
		var nbRowCompleted = 0;
		var color = getClassColorPiece();

		$(tab).each(function(){
			if(tabRowAdded.indexOf(this.row) == -1){
				tabRowAdded.push(this.row);
			}
			motif.push({'col': this.col, 'row' : this.row, 'color' : color});
		});                           

		tabRowAdded.sort();

		$(tabRowAdded).each(function(){
			if(motif_rowComplete(this)){
				nbRowCompleted++;
				//delete la row
				motif_deleteRow(this);
				showMotif();
				//descend les rows au dessus
				motif_getDownHigherRows(this);
			}
		});

		//console.log('nombre de lignes complétées : ' + nbRowCompleted);
		switch(nbRowCompleted) {
			case 1:
				score += 100;
				break;
			case 2:
				score += 250;
				break;
			case 3:
				score += 500;
				break;
			case 4:
				console.log('tetris !');
				score += 1000;
				break;
			default:
				//console.log("Pas de nouvelle ligne complétée");
		}

		showScore();
	}

	function motif_deleteRow(row){
		for (var i = motif.length - 1; i >= 0; i--) {
			if(motif[i].row == row){
				motif.splice(i,1);
			}
		};
	}

	function motif_getDownHigherRows(row){
		for (var i = motif.length - 1; i >= 0; i--) {
			if(motif[i].row < row){
				motif[i].row += 1;
			}
		};
	}


	/////////////////////////////////////////////////////////////////////////////////
	///
	/////////////////////////////////////////////////////////////////////////////////

	function showScore(){
		$('#game-info-score-value').html(score);
	}

	function getRandomType(){
		return getRandomInt(0,tabSchemaPiece.length);
	}

	function getSchemaPiece(typeId){
		return tabSchemaPiece[typeId].schema;
	}

	function getRotationPoint(typeId){
		return tabSchemaPiece[typeId].rotationPoint;
	}

	function getColorPiece(typeId){
		return tabSchemaPiece[typeId].color;
	}

	function getClassColorPiece(){
		var res;
		if($('.myPiece').attr('class') != null){
			var regex = /color-piece-[a-z]*/;
			res = regex.exec($('.myPiece').attr('class'));
		}
		else{
			res = false;
		}
		return res;
	}

	function getColInPieceStrucure(i,tabLength){
		var lineLength = Math.sqrt(tabLength);
		return i%lineLength+1;
	}

	function getRowInPieceStructure(i,tabLength){
		var lineLength = Math.sqrt(tabLength);
		return Math.floor(i/lineLength)+1;
	}

	function getTabPiece(){
		var col, row;
		var tabRes = [];
		var tabInter = $('.myPiece');
		var tabPieces = [];
		$('.myPiece').each(function(){
			col = parseInt($(this).attr('col'));
			row = parseInt($(this).attr('row'));
			tabRes.push({'col' : col, 'row' : row});
		});
		return tabRes;
	}

	function getLowerRowPiece(tab){
		var maxRow = 0;
		$(tab).each(function(){
			if(this.row>maxRow){
				maxRow = this.row;
			}
		});
		return maxRow;
	}

	function getLowerRowPieceOfCol(tab, col){
		var maxRow = 0;
		$(tab).each(function(){
			if(this.col == col){
				if(this.row>=maxRow){
					maxRow = this.row;
				}
			}
		});
		return maxRow;
	}

	function getHigherRowPiece(tab){
		var minRow = numberOfColumns;
		$(tab).each(function(){
			if(this.row<minRow){
				minRow = this.row;
			}
		});
		return minRow;
	}

	function getMaxColPiece(tab){
		var maxCol = 0;
		$(tab).each(function(){
			if(this.col>maxCol){
				maxCol = this.col;
			}
		});
		return maxCol;
	}

	function getMinColPiece(tab){
		var minCol = numberOfColumns;
		$(tab).each(function(){
			if(this.col<minCol){
				minCol = this.col;
			}
		});
		return minCol;
	}

	function getWidthPiece(tab){
		return getMaxColPiece(tab) - getMinColPiece(tab)+1;
	}

	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min)) + min;
	}

	//////////////////////////////////////////////////////////////////////
	///							Shadow								   ///
	//////////////////////////////////////////////////////////////////////
	function hideShadow(){
		$('.shadow').removeClass('shadow');
	}

	function showShadow(tab){
		var shadowTab = getLowerPossiblePiece(tab);
		hideShadow();
		$(shadowTab).each(function(){
			$('td[col='+  this.col + '][row='+ this.row + ']').addClass('shadow');
		});
	}
});