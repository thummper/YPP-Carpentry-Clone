class Shape {

	constructor(x, y, game) {
		this.game = game;
		this.orientation = 0;
		this.tileSize = this.game.tileSize;
		this.draggable = true;
		this.dragging = false;
		this.pattern = this.pickPattern();

		this.x = x;
		this.y = y;
		this.blocks;
		this.closestGrid;
		this.delete = false;
		this.makeBlocks();
	}
	
	refreshBlocks(){
		for(let i = 0, j = this.blocks.length; i < j; i++){
			for(let k = 0, l = this.blocks[i].length; k < l; k++){
				let block = this.blocks[i][k];
				block.x = this.x + (k * this.game.tileSize);
				block.y = this.y + (i * this.game.tileSize);
				
			}
		}
	}

	checkBounds() {
		//We should check that we can drop the shape. 
		let bx = (this.x + this.pattern[0].length * this.game.tileSize) / this.game.tileSize;
		let by = (this.y + this.pattern.length * this.game.tileSize) / this.game.tileSize;
		if (this.x < 0) {
			//bx is negative. 
			this.x = 0;
			this.refreshBlocks();

		}
		if ((this.x + this.pattern[0].length * this.game.tileSize) > this.game.canvas.width) {
			let blockd = bx - this.game.boardSize;
			this.x -= blockd * this.game.tileSize;
			this.refreshBlocks();
		}
		if (this.y < 0) {
			this.y = 0;
			this.refreshBlocks();
		}
		if (this.y + this.pattern.length * this.game.tileSize > this.game.canvas.height) {
			let blockd = by - this.game.boardSize;
			this.y -= blockd * this.game.tileSize;
			this.refreshBlocks();
		}
	}

	stopDragging() {
		this.checkBounds();
		this.draggable = true;
		this.dragging = false;
		for (let i = 0, j = this.blocks.length; i < j; i++) {
			for (let k = 0, l = this.blocks[i].length; k < l; k++) {
				let block = this.blocks[i][k];
				if (block.dragging) {
					block.dragging = false;
				}
			}
		}
	}

	makeBlocks() {
		this.blocks = [];
		//Blocks for new patterns
		let patternBlocks = this.pattern[this.orientation];
		
		
		for(let i = 0, j = patternBlocks.length; i < j; i++){
			let block = patternBlocks[i];
			let row = block[0];
			let col = block[1];
			let blk = {
				x: this.x + ( col * this.tileSize),
				y: this.y + ( row * this.tileSize),
				row: row,
				col: col,
				dragging: false,
				color: this.color,
				shape: this,
				type: 'shape'
			}
			this.blocks.push(blk);	
		}
	}

	mirror() {
		this.orientation = (this.orientation + 2) % 4;
	}

	pickPattern() {
		let probs = [13, 13, 12, 11, 10, 10, 6, 6, 6];
		let shape = null;
		//Number between 1 and 100
		let number = Math.floor(Math.random() * 80);

		let total = 0;
		for (let i in probs) {
			total += probs[i];
			if (number <= total) {
				shape = pieces[i][0];
				this.color = pieces[i][1];
				break;
			}
		}
		return shape;
	}

	draw() {
		let board = this.game.board;
		for(let row = 0, r = board.length; row < r; row++){
			
			for(let col = 0, c = board[row].length; col < c; col++){
				
				let cell = board[row][col];
				if(cell.x == this.x && cell.y == this.y){
					
					//Draw shape on to grid, starting here.
					for(let i = 0, j = this.blocks.length; i < j; i++){
						let block = this.blocks[i];
						let rw = block.row;
						let cl = block.col;
						board[row + rw][col + cl].contains.push(block);
					}
				}
			}
		}
	}

	drag(mx, my) {
	
		//Get the nearest blockpoint to the mouse and put the block we are dragging on it.
		let tileSize = this.game.tileSize;
		let xgrid, ygrid;
		ygrid = Math.ceil(my / tileSize) * tileSize;
		xgrid = Math.ceil(mx / tileSize) * tileSize;
		//midx/midy is the closest grid square to the mouse
		this.midx = xgrid;
		this.midy = ygrid;

	}

	draw_on_mouse() {
		let tileSize = this.game.tileSize;
		let bx, by;

		for (let i = 0; i < this.blocks.length; i++) {
			for (let j = 0; j < this.blocks[i].length; j++) {
				let block = this.blocks[i][j];
				if (block.dragging) {
					bx = j;
					by = i;
				}
			}
		}
		//So bx/by is the block col/row we clicked on, midx/midy is the closest block to the mouse 

		let tx = this.midx - (tileSize * bx) - tileSize;
		let ty = this.midy - (tileSize * by) - tileSize;
		this.x = tx;
		this.y = ty;
		// tx/ty is the position the shape has to be in for the dragged block to be in midx/midy.
		for (let i = 0; i < this.blocks.length; i++) {
			for (let j = 0; j < this.blocks[i].length; j++) {
				let block = this.blocks[i][j];
				block.x = this.x + (j * tileSize);
				block.y = this.y + (i * tileSize);
				if (block.solid) {
					this.game.drawRect(this.x + (j * tileSize), this.y + (i * tileSize), tileSize, block.color);
				}
			}
		}
	}

	scroll(dir) {
		//Rotate the blocks matrix by 90 deg
		let width = this.blocks.length;
		let height = this.blocks[0].length;
		if (width == height) {
			//Square matrix 
			if (dir) {
				this.rotateCounter();
			} else {
				this.rotateSquare();
			}

		} else {
			//Non square
			this.rotate();
		}
		this.draw_on_mouse();
	}

	rotateSquare() {
		//Rotate a square array 90 degrees clockwise
		let a = this.blocks;
		var n = a.length;
		for (var i = 0; i < n / 2; i++) {
			for (var j = i; j < n - i - 1; j++) {
				var tmp = a[i][j];
				a[i][j] = a[n - j - 1][i];
				a[n - j - 1][i] = a[n - i - 1][n - j - 1];
				a[n - i - 1][n - j - 1] = a[j][n - i - 1];
				a[j][n - i - 1] = tmp;
			}
		}
		this.draw_on_mouse();
	}

	rotateCounter() {
		let a = this.blocks;
		var n = a.length;
		for (var i = 0; i < n / 2; i++) {
			for (var j = i; j < n - i - 1; j++) {
				var tmp = a[i][j];
				a[i][j] = a[j][n - i - 1];
				a[j][n - i - 1] = a[n - i - 1][n - j - 1];
				a[n - i - 1][n - j - 1] = a[n - j - 1][i];
				a[n - j - 1][i] = tmp;
			}
		}
		return a;
	}

}
