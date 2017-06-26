$(function(){
	///////////////////////////////////////////////////////////////////////////////////////
	//						PROGRAMME PRINCIPAL			  								 //
	///////////////////////////////////////////////////////////////////////////////////////

	var intervalTime = 1200;		//Temps avant que la piece descende automatiquement
	var numberOfColumns = 10;
	var numberOfRows = 22;
	var motif = []; 				//Tableau contenant les cases pleines
	var idInterval;
	var gameOver = false;
	var score = 0;

	init();
	generatePiece();
	idInterval = window.setInterval(scrollDownPiece,intervalTime);

	////////////////////////////////////////////////////////////////////////////////////////
	//								KEYBOARD EVENTS										  //
	////////////////////////////////////////////////////////////////////////////////////////

	$('body').keydown(function(e){
		console.log("key pressed : " + e.keyCode);
		if(e.keyCode == 37){ //Left
			console.log("Left");
			var maPieceCol = parseInt($('.myPiece').attr('col'));
			var maPieceRow = parseInt($('.myPiece').attr('row'));
			maPieceCol -=1;
			if(maPieceCol >= 0 && caseFree(maPieceCol,maPieceRow)){
				hideActualCase();
				$('td[col='+ maPieceCol + '][row='+ maPieceRow + ']').addClass('myPiece');
			}
		}
		else if(e.keyCode == 38){ //Up - turn
			console.log("Up");
		}
		else if(e.keyCode == 39){ //Right
			console.log("Right");
			var maPieceCol = parseInt($('.myPiece').attr('col'));
			var maPieceRow = parseInt($('.myPiece').attr('row'));
			maPieceCol +=1;
			if(maPieceCol < numberOfColumns && caseFree(maPieceCol,maPieceRow)){
				hideActualCase();
				$('td[col='+ maPieceCol + '][row='+ maPieceRow + ']').addClass('myPiece');
			}
		}
		else if(e.keyCode == 40){ //Down
			console.log("Down");
			var maPieceCol = parseInt($('.myPiece').attr('col'));
			var maPieceRow = parseInt($('.myPiece').attr('row'));

			maPieceRow +=1;
			//Si ma pièce est en contact avec un element du motif ou touche le fond
			if(!caseFree(maPieceCol,maPieceRow) || maPieceRow >= numberOfRows){
				//on ajoute la piece au motif actuel
				motif_addPiece(maPieceCol, maPieceRow-1);
				hideActualCase();
				showTabMotif();
				//check gameOver

				if(!gameOver){
					generatePiece();
				}
				else{
					console.log('fin de la partie');
					alert('Fin de la partie');
				}
			}
			else{
				hideActualCase();
				$('td[col='+ maPieceCol + '][row='+ maPieceRow + ']').addClass('myPiece');
			}
		}
		else if(e.keyCode == 32){ //space - free fall
			console.log("space - free fall");
			var newRow;
			var maPieceCol = parseInt($('.myPiece').attr('col'));
			var maPieceRow = parseInt($('.myPiece').attr('row'));
			newRow = findRowForFreeFall(maPieceCol);
			//ajout dans tab motif
			motif_addPiece(maPieceCol, newRow);
			hideActualCase();
			showTabMotif();
			//check gameover
			checkIfGameOver();
			if(!gameOver){
				generatePiece();
			}
			else{
				console.log('fin de la partie');
				alert('Fin de la partie');
			}
		}
		else if(e.keyCode == 27){ //escape - Menu
			console.log("escape - Menu");
		}

	});

	///////////////////////////////////////////////////////////////////////////////////////
	//								FUNCTIONS											 //
	///////////////////////////////////////////////////////////////////////////////////////

	function getRandomInt(min, max) {
	  return Math.floor(Math.random() * (max - min)) + min;
	}

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
		var maPieceCol = parseInt($('.myPiece').attr('col'));
		var maPieceRow = parseInt($('.myPiece').attr('row'));

		maPieceRow +=1;
		//Si ma pièce est en contact avec un element du motif ou touche le fond
		if(!caseFree(maPieceCol,maPieceRow) || maPieceRow >= numberOfRows){
			//on ajoute la piece au motif actuel
			motif_addPiece(maPieceCol, maPieceRow-1);
			hideActualCase();
			showTabMotif();
			//on stop l'interval
			clearInterval(idInterval);
			//mise à jour de la variable gameOver
			checkIfGameOver();
			if(!gameOver){
				generatePiece();
				//tant que la piece n'a pas touché le fond elle descend
				idInterval = window.setInterval(scrollDownPiece,intervalTime);
			}
			else{
				console.log('fin de la partie');
				alert('Fin de la partie');
			}
		}
		else{
			hideActualCase();
			$('td[col='+ maPieceCol + '][row='+ maPieceRow + ']').addClass('myPiece');
		}
	}

	function generatePiece(){
		var StartCol, StartRow;
		var typeId = getRandomType();
		var tabSchemaPiece = getSchemaPiece(typeId);
		var lineLength = Math.sqrt(tabSchemaPiece.length);
		//Generate a new Piece
		StartCol = Math.floor((numberOfColumns-1)/2);
		StartRow = 0;
		//Show the piece
		for (var i = 0; i < tabSchemaPiece.length; i++) {
			if(tabSchemaPiece[i]==1){
				$('td[col='+ StartCol + '][row='+ StartRow + ']').addClass('myPiece');
			}
		};
	}

	function checkIfGameOver(){
		//if(){gameOver = true;}
		return true;
	}

	function caseFree(col,row){
		var i = 0;
		while(i<motif.length && (motif[i].col != col || motif[i].row != row)){
			i++;
		}
		return i==motif.length;
	}

	function showTabMotif(){
		//reset
		$('.motif-elt').removeClass('motif-elt');
		//affichage
		for (var i = motif.length - 1; i >= 0; i--) {
			$('td[col='+ motif[i].col + '][row='+ motif[i].row + ']').addClass('motif-elt');
		};
	}

	function findRowForFreeFall(col){
		var maxRow;
		var resTab = motif_getRows(col);

		//get max from resTab
		maxRow = numberOfRows;
		for (var i = 0; i<resTab.length; i++) {
			if(resTab[i]<maxRow){
				maxRow = resTab[i];
			}
		};
		return maxRow-1;
	}

	function hideActualCase(){
		$('.myPiece').removeClass('myPiece').empty();
	}

	function motif_getRows(col){
		var resTab = [];
		//get all row from motif where column = col in resTab
		for (var i = 0; i<motif.length; i++) {
			if(motif[i].col == col){
				resTab.push(motif[i].row);
			}
		};
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

	function motif_addPiece(col,row){
		motif.push({'col': col, 'row' : row});
		if(motif_rowComplete(row)){
			//increment score
			score += 100;
			showScore();
			//delete la row
			motif_deleteRow(row);
			//descend les rows au dessus
			motif_getDownHigherRows(row);
		}
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

	function showScore(){
		$('#game-info-score-value').html(score);
	}
});