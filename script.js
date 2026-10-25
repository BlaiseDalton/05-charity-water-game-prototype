const board = document.querySelector('#game-board');
const raindrop = document.querySelector('#raindrop');
const statusMessage = document.querySelector('#game-status');
const progressTrack = document.querySelector('.progress-track');
const progressFill = document.querySelector('#progress-fill');
const scoreValue = document.querySelector('#score-value');
const finishMessage = document.querySelector('#finish-message');
const confettiLayer = document.querySelector('#confetti-layer');
const startButton = document.querySelector('#start-button');
const resetButton = document.querySelector('#reset-button');
const moveButtons = document.querySelectorAll('.move-button');
const rocks = document.querySelectorAll('.rock');
const multipliers = document.querySelectorAll('.multiplier');

let dropPosition = 50;
let progress = 0;
let points = 100;
let gameTimer;
let isPlaying = false;

function showConfetti() {
	const colors = ['#ffc907', '#2e9df7', '#4fcb53', '#ff902a', '#f16061'];
	confettiLayer.replaceChildren();

	for (let index = 0; index < 40; index += 1) {
		const piece = document.createElement('span');
		const color = colors[Math.floor(Math.random() * colors.length)];
		const delay = Math.random() * 0.7;
		const duration = 1.8 + Math.random() * 1.2;
		const drift = Math.round(Math.random() * 120 - 60);

		piece.className = 'confetti-piece';
		piece.style.left = `${Math.random() * 100}%`;
		piece.style.backgroundColor = color;
		piece.style.animationDelay = `${delay}s`;
		piece.style.animationDuration = `${duration}s`;
		piece.style.setProperty('--drift', `${drift}px`);
		piece.addEventListener('animationend', () => piece.remove(), { once: true });
		confettiLayer.append(piece);
	}
}

function updateProgress() {
	progressFill.style.width = `${Math.floor(progress)}%`;
	progressTrack.setAttribute('aria-valuenow', `${Math.floor(progress)}`);
}

function updateScore() {
	scoreValue.textContent = `${points}`;
}

function placeRaindrop() {
	const finishSpace = board.clientHeight * 0.12;
	const travelDistance = board.clientHeight - raindrop.offsetHeight - finishSpace;
	const topPosition = travelDistance * progress / 100;

	raindrop.style.left = `${dropPosition}%`;
	raindrop.style.top = `${topPosition}px`;
}

function moveRaindrop(direction) {
	if (!isPlaying) {
		return;
	}

	dropPosition += direction * 8;
	dropPosition = Math.max(6, Math.min(94, dropPosition));
	raindrop.style.left = `${dropPosition}%`;
}

function endGame(didWin) {
	clearInterval(gameTimer);
	isPlaying = false;
	startButton.disabled = false;
	startButton.removeAttribute('aria-label');

	if (didWin) {
		statusMessage.textContent = 'You made it to the well!';
		finishMessage.innerHTML = `A drop made a difference.<small>You finished with ${points} points.</small>`;
		startButton.innerHTML = 'Play again <span aria-hidden="true">&rarr;</span>';
		showConfetti();
	} else {
		statusMessage.textContent = 'Obstacle hit: -10 points';
		finishMessage.innerHTML = `So close!<small>Your score is ${points}. Find the openings and try again.</small>`;
		startButton.innerHTML = 'Try again <span aria-hidden="true">&rarr;</span>';
	}

	finishMessage.hidden = false;
	startButton.focus();
}

function checkForCollision() {
	const dropBounds = raindrop.getBoundingClientRect();

	return Array.from(rocks).some((rock) => {
		const rockBounds = rock.getBoundingClientRect();
		return dropBounds.left < rockBounds.right
			&& dropBounds.right > rockBounds.left
			&& dropBounds.top < rockBounds.bottom
			&& dropBounds.bottom > rockBounds.top;
	});
}

function collectMultipliers() {
	const dropBounds = raindrop.getBoundingClientRect();

	multipliers.forEach((multiplier) => {
		if (multiplier.dataset.collected === 'true') {
			return;
		}

		const multiplierBounds = multiplier.getBoundingClientRect();
		const touchesMultiplier = dropBounds.left < multiplierBounds.right
			&& dropBounds.right > multiplierBounds.left
			&& dropBounds.top < multiplierBounds.bottom
			&& dropBounds.bottom > multiplierBounds.top;

		if (touchesMultiplier) {
			multiplier.dataset.collected = 'true';
			multiplier.classList.add('collected');
			points *= 2;
			updateScore();
			statusMessage.textContent = '2x multiplier collected!';
		}
	});
}

function advanceGame() {
	progress += 0.24;
	placeRaindrop();
	updateProgress();
	collectMultipliers();

	if (checkForCollision()) {
		points = Math.max(0, points - 10);
		updateScore();
		endGame(false);
		return;
	}

	if (progress >= 100) {
		progress = 100;
		updateProgress();
		endGame(true);
	}
}

function resetGame() {
	clearInterval(gameTimer);
	confettiLayer.replaceChildren();
	isPlaying = false;
	dropPosition = 50;
	progress = 0;
	points = 100;
	multipliers.forEach((multiplier) => {
		multiplier.dataset.collected = 'false';
		multiplier.classList.remove('collected');
	});
	finishMessage.hidden = true;
	statusMessage.textContent = 'Ready when you are';
	startButton.innerHTML = 'Start run <span aria-hidden="true">&rarr;</span>';
	startButton.disabled = false;
	startButton.removeAttribute('aria-label');
	placeRaindrop();
	updateProgress();
	updateScore();
}

function startGame() {
	resetGame();
	isPlaying = true;
	statusMessage.textContent = 'Keep moving to find a gap';
	startButton.innerHTML = 'Run in progress <span aria-hidden="true">...</span>';
	startButton.disabled = true;
	startButton.setAttribute('aria-label', 'Run in progress');
	gameTimer = setInterval(advanceGame, 30);
}

startButton.addEventListener('click', () => {
	startGame();
});

resetButton.addEventListener('click', resetGame);

document.addEventListener('keydown', (event) => {
	if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
		if (isPlaying) {
			event.preventDefault();
			moveRaindrop(event.key === 'ArrowLeft' ? -1 : 1);
		}
	}
});

moveButtons.forEach((button) => {
	button.addEventListener('click', () => {
		moveRaindrop(Number(button.dataset.direction));
	});
});

window.addEventListener('resize', placeRaindrop);
placeRaindrop();
