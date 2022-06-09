// --------------------- Chargement de la page Web ---------------------

window.onload = () => {
  const canvasWidth: number = 900;
  const canvasHeight: number = 600;
  const blockSize: number = 30;
  let ctx;
  let delay: number = 100;
  let snakee;
  let applee;
  const widthInBlocks: number = canvasWidth / blockSize;
  const heightInBlocks: number = canvasHeight / blockSize;
  let score: number;
  let timeout: number;

  init();

  // ----------------- Function INIT -----------------

  function init(): void {
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.border = '30px solid grey';
    canvas.style.margin = '50px auto';
    canvas.style.display = 'block';
    canvas.style.backgroundColor = '#ddd';

    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    snakee = new Snake(
      [
        [6, 4],
        [5, 4],
        [4, 4],
        [3, 4],
        [2, 4],
        [1, 4],
      ],
      'right'
    );
    applee = new Apple([10, 10]);
    score = 0;
    refreshCanvas();
  }

  // ----------------- Function REFRESH CANVAS -----------------

  function refreshCanvas(): void {
    snakee.advance();
    if (snakee.checkCollision()) {
      gameOver();
    } else {
      if (snakee.isEatingApple(applee)) {
        score++;
        snakee.ateApple = true;
        do {
          applee.setNewPosition();
        } while (applee.isOnSnake(snakee));
      }
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      drawScore();
      snakee.draw();
      applee.draw();
      timeout = setTimeout(refreshCanvas, delay);
    }
  }

  // ----------------- Function GAME OVER -----------------

  function gameOver(): void {
    ctx.save();
    ctx.font = 'bold 70px sans-serif';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 5;
    const centerX: number = canvasWidth / 2;
    const centerY: number = canvasHeight / 2;
    ctx.strokeText('Game Over', centerX, centerY - 180);
    ctx.fillText('Game Over', centerX, centerY - 180);
    ctx.font = 'bold 30px sans-serif';
    ctx.strokeText(
      'Appuyer sur la toucher Espace pour rejouer',
      centerX,
      centerY - 120
    );
    ctx.fillText(
      'Appuyer sur la toucher Espace pour rejouer',
      centerX,
      centerY - 120
    );
    ctx.restore();
  }

  // ----------------- Function RESTART -----------------

  function restart(): void {
    snakee = new Snake(
      [
        [6, 4],
        [5, 4],
        [4, 4],
        [3, 4],
        [2, 4],
        [1, 4],
      ],
      'right'
    );
    applee = new Apple([10, 10]);
    score = 0;
    clearTimeout(timeout);
    refreshCanvas();
  }

  // ----------------- Function SCORE -----------------

  function drawScore(): void {
    ctx.save();
    ctx.font = 'bold 200px sans-serif';
    ctx.fillStyle = '#444';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    ctx.fillText(score.toString(), centerX, centerY);
    ctx.restore();
  }

  // ----------------- Function DRAW BLOCK -----------------

  function drawBlock(ctx, blockPosition: number): void {
    const x: number = blockPosition[0] * blockSize;
    const y: number = blockPosition[1] * blockSize;
    ctx.fillRect(x, y, blockSize, blockSize);
  }

  // ----------------- Function SNAKE -----------------

  function Snake(snakeBody: number[][], snakeDirection: string): void {
    this.body = snakeBody;
    this.direction = snakeDirection;
    this.ateApple = false;
    this.draw = (): void => {
      ctx.save();
      ctx.fillStyle = '#ff0000';
      for (let i = 0; i < this.body.length; i++) {
        drawBlock(ctx, this.body[i]);
      }
      ctx.restore();
    };
    this.advance = () => {
      const nextPosition: number = this.body[0].slice();
      switch (this.direction) {
        case 'left':
          nextPosition[0]--;
          break;
        case 'right':
          nextPosition[0]++;
          break;
        case 'down':
          nextPosition[1]++;
          break;
        case 'up':
          nextPosition[1]--;
          break;
        default:
          throw 'Invalid direction';
      }
      this.body.unshift(nextPosition); // Décallage du corps d'une position
      if (!this.ateApple) {
        this.body.pop(); // Suppression du dernier block du corps du serpent
      } else {
        this.ateApple = false;
      }
    };
    this.setDirection = (newDirection: number): void => {
      var allowedDirections;
      switch (this.direction) {
        case 'left':
        case 'right':
          allowedDirections = ['up', 'down'];
          break;
        case 'down':
        case 'up':
          allowedDirections = ['left', 'right'];
          break;
        default:
          throw 'Invalid direction';
      }
      if (allowedDirections.indexOf(newDirection) > -1) {
        this.direction = newDirection;
      }
    };
    this.checkCollision = () => {
      let wallCollision = false;
      let snakeCollision = false;
      const head: number = this.body[0]; // Selectionne la tête du serpent
      const rest: number[] = this.body.slice(1); // Copie tout le corps du serpent hormis sa tête
      const snakeX: number = head[0];
      const snakeY: number = head[1];
      const minX: number = 0;
      const minY: number = 0;
      const maxX: number = widthInBlocks - 1;
      const maxY: number = heightInBlocks - 1;
      const isNotBetweenVerticalWalls: boolean = snakeX < minX || snakeX > maxX;
      const isNotBetweenHorizontalsWalls: boolean =
        snakeY < minY || snakeY > maxY;

      if (isNotBetweenHorizontalsWalls || isNotBetweenVerticalWalls) {
        wallCollision = true;
      }

      for (let i: number = 0; i < rest.length; i++) {
        if (snakeX === rest[i][0] && snakeY === rest[i][1]) {
          snakeCollision = true;
        }
      }

      return wallCollision || snakeCollision;
    };
    this.isEatingApple = (appleToEat): boolean => {
      const head = this.body[0];
      if (
        head[0] === appleToEat.position[0] &&
        head[1] === appleToEat.position[1]
      ) {
        return true;
      } else return false;
    };
  }

  // ----------------- Function APPLE -----------------

  function Apple(applePosition: number[]): void {
    this.position = applePosition;
    this.draw = (): void => {
      ctx.save();
      ctx.fillStyle = '#33cc33';
      ctx.beginPath();
      const radius: number = blockSize / 2;
      const x: number = this.position[0] * blockSize + radius;
      const y: number = this.position[1] * blockSize + radius;
      ctx.arc(x, y, radius, 0, Math.PI * 2, true);
      ctx.fill();
      ctx.restore();
    };
    this.setNewPosition = (): void => {
      const newAppleX: number = Math.round(Math.random() * (widthInBlocks - 1));
      const newAppleY: number = Math.round(
        Math.random() * (heightInBlocks - 1)
      );
      this.position = [newAppleX, newAppleY];
    };
    this.isOnSnake = (snakeToCheck): boolean => {
      let isOnSnake: boolean = false;

      for (let i = 0; i < snakeToCheck.body.length; i++) {
        if (
          this.position[0] === snakeToCheck.body[i][0] &&
          this.position[1] === snakeToCheck[i][1]
        ) {
          isOnSnake = true;
        }
        return isOnSnake;
      }
    };
  }

  document.onkeydown = function handleKeyDown(e): void {
    const key: number = e.keyCode;
    let newDirection: string;
    switch (key) {
      case 37:
        newDirection = 'left';
        break;
      case 38:
        newDirection = 'up';
        break;
      case 39:
        newDirection = 'right';
        break;
      case 40:
        newDirection = 'down';
        break;
      case 32:
        restart();
        return;
      default:
        return;
    }
    snakee.setDirection(newDirection);
  };
};
