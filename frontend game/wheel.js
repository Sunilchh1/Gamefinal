const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const spinButton = document.getElementById('spinButton');
const prizeContainer = document.getElementById('prizeContainer');
const timerElement = document.getElementById('timer');

const prizes = ["$0.5", "$1", "$1.5", "$2", "$2.5", "$3", "$3.5", "$4", "$4.5", "$5"];
const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A8", "#FF8C33", "#33FFF0", "#8E44AD", "#F1C40F", "#7D3C98", "#76D7C4"];
const segments = prizes.length;
const arcSize = (2 * Math.PI) / segments;
let startAngle = 0;
let spinTimeout = null;
let hasSpun = false;
let timerInterval = null;

const accessCode = "abc123"; // Replace with your actual code
const accessButton = document.getElementById('accessButton');
const accessCodeInput = document.getElementById('accessCode');

// Load sound files
const spinSound = new Audio('spin.mp3'); // Replace with the path to your spinning sound file
const winSound = new Audio('win.mp3'); // Replace with the path to your winning sound file

function drawWheel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < segments; i++) {
        const angle = startAngle + i * arcSize;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, angle, angle + arcSize, false);
        ctx.lineTo(canvas.width / 2, canvas.height / 2);
        ctx.fillStyle = colors[i];
        ctx.fill();
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(angle + arcSize / 2);
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 20px Arial'; // Adjusted font size for better visibility
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(prizes[i], canvas.width / 2 - 30, 0); // Adjusted position to fit within the wheel
        ctx.restore();
    }
}

function drawPointer() {
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 15, 0);
    ctx.lineTo(canvas.width / 2 + 15, 0);
    ctx.lineTo(canvas.width / 2, 40);
    ctx.closePath();
    ctx.fillStyle = '#333';
    ctx.fill();
}

function spinWheel() {
    spinSound.loop = true; // Loop the spinning sound
    spinSound.play(); // Play the spinning sound
    const now = Date.now();
    const duration = 12000; // 12 seconds
    const accelerationDuration = 6000; // 6 seconds
    const decelerationDuration = 6000; // 6 seconds
    const initialSpeed = 0.1; // Initial speed
    const maxSpeed = 0.5; // Maximum speed
    let currentSpeed = initialSpeed;

    function animate() {
        const elapsed = Date.now() - now;
        if (elapsed < accelerationDuration) {
            currentSpeed = initialSpeed + (maxSpeed - initialSpeed) * (elapsed / accelerationDuration);
        } else if (elapsed < duration) {
            currentSpeed = maxSpeed * (1 - (elapsed - accelerationDuration) / decelerationDuration);
        } else {
            currentSpeed = 0;
            clearTimeout(spinTimeout);
            spinSound.pause(); // Stop the spinning sound
            spinSound.currentTime = 0; // Reset the spinning sound
            stopWheel();
            return;
        }
        startAngle += currentSpeed;
        drawWheel();
        drawPointer();
        spinTimeout = requestAnimationFrame(animate);
    }

    animate();
}

function stopWheel() {
    const angleToWinningPrize = (7 * Math.PI / 6); // Adjusting to land at 210 degrees
    const finalAngle = startAngle % (2 * Math.PI) + angleToWinningPrize;

    const winningSegment = Math.floor((finalAngle % (2 * Math.PI)) / arcSize) % segments;
    const winningPrize = prizes[winningSegment];
    prizeContainer.textContent = `Congratulations! You won ${winningPrize}`;
    winSound.play(); // Play the winning sound
    confetti(); // Trigger the confetti
    hasSpun = true;
    spinButton.disabled = true;
}

function confetti() {
    const duration = 2 * 1000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 7,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
        });
        confetti({
            particleCount: 7,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

function startTimer(duration, display) {
    let timer = duration, minutes, seconds;
    timerInterval = setInterval(() => {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            clearInterval(timerInterval);
            spinButton.disabled = true;
        }
    }, 1000);
}

spinButton.addEventListener('click', () => {
    if (!hasSpun) {
        spinButton.disabled = true;
        spinWheel();
    }
});

accessButton.addEventListener('click', () => {
    if (accessCodeInput.value === accessCode) {
        document.querySelector('.wheel-container').style.display = 'block';
        document.querySelector('.access-container').style.display = 'none';
        spinButton.disabled = false;
        const threeMinutes = 60 * 3;
        startTimer(threeMinutes, timerElement);
    } else {
        alert("Invalid access code");
    }
});

drawWheel();
drawPointer();
