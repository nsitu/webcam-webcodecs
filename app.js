const videoDevicesSelect = document.getElementById('videoDevices');
const frameRatesSelect = document.getElementById('frameRates');
const getCapabilitiesButton = document.getElementById('getCapabilities');
const startCameraButton = document.getElementById('startCamera');
const capabilitiesOutput = document.getElementById('capabilitiesOutput');
const video = document.getElementById('webcam');

// Populate the video devices dropdown
navigator.mediaDevices.enumerateDevices()
    .then(devices => {
        devices.forEach(device => {
            if (device.kind === 'videoinput') {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.text = device.label || `Camera ${videoDevicesSelect.length + 1}`;
                videoDevicesSelect.appendChild(option);
            }
        });
    })
    .catch(err => console.error('Error enumerating devices: ', err));

// Function to get capabilities of the selected device
const getCapabilities = async () => {
    const deviceId = videoDevicesSelect.value;
    const constraints = {
        video: {
            deviceId: deviceId ? { exact: deviceId } : undefined
        }
    };

    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities();

        capabilitiesOutput.textContent = JSON.stringify(capabilities, null, 2);

        // Populate frame rates
        frameRatesSelect.innerHTML = '';
        if (capabilities.frameRate) {
            const minFrameRate = capabilities.frameRate.min;
            const maxFrameRate = capabilities.frameRate.max;
            for (let rate = minFrameRate; rate <= maxFrameRate; rate++) {
                const option = document.createElement('option');
                option.value = rate;
                option.text = `${rate} fps`;
                frameRatesSelect.appendChild(option);
            }
        }

        // Stop the stream after getting capabilities
        track.stop();
    } catch (err) {
        if (err.name === 'OverconstrainedError') {
            console.error('The constraints could not be satisfied by any available device: ', err.constraint);
        } else if (err.name === 'NotAllowedError') {
            console.error('Permission to access media devices was denied.');
        } else if (err.name === 'NotFoundError') {
            console.error('No media devices found.');
        } else {
            console.error('Error accessing the webcam: ', err);
        }
    }
};

// Function to start the camera with selected frame rate
const startCamera = async () => {
    const deviceId = videoDevicesSelect.value;
    const frameRate = frameRatesSelect.value;
    const constraints = {
        video: {
            deviceId: deviceId ? { exact: deviceId } : undefined,
            frameRate: frameRate ? { ideal: parseFloat(frameRate) } : undefined
        }
    };

    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
    } catch (err) {
        console.error('Error starting the webcam: ', err);
    }
};

// Attach event listeners to buttons
getCapabilitiesButton.addEventListener('click', getCapabilities);
startCameraButton.addEventListener('click', startCamera);


document.getElementById('videoCapture').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const videoPreview = document.getElementById('videoPreview');
        videoPreview.src = URL.createObjectURL(file);
        videoPreview.load();
        videoPreview.play();
    }
});