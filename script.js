const video = document.getElementById('video');
const emotionBox = document.getElementById('emotionBox');

// Start Camera
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => video.srcObject = stream)
    .catch(err => {
        emotionBox.innerText = "Camera Access Denied";
        console.error(err);
    });

// Load models from CDN
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(
        'https://justadudewhohacks.github.io/face-api.js/models'
    ),
    faceapi.nets.faceExpressionNet.loadFromUri(
        'https://justadudewhohacks.github.io/face-api.js/models'
    )
]).then(() => {
    emotionBox.innerText = "Detecting...";
    startDetection();
});

function startDetection() {
    video.addEventListener('play', () => {

        setInterval(async () => {
            const detections = await faceapi
                .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 512 }))
                .withFaceExpressions();

            if (detections.length > 0) {
                const expressions = detections[0].expressions;

                const maxEmotion = Object.keys(expressions).reduce((a, b) =>
                    expressions[a] > expressions[b] ? a : b
                );

                // Update emotion text
                emotionBox.innerText = "Emotion: " + maxEmotion.toUpperCase();

                // Add simple animation
                emotionBox.classList.add('detected');
                setTimeout(() => emotionBox.classList.remove('detected'), 300);

            } else {
                emotionBox.innerText = "No Face Detected";
            }

        }, 300);
    });
}
