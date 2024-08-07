const videoDevicesSelect = document.getElementById('videoDevices');
const getCapabilitiesButton = document.getElementById('getCapabilities');
const capabilitiesOutput = document.getElementById('capabilitiesOutput');

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

// Attach event listener to the button
getCapabilitiesButton.addEventListener('click', getCapabilities);
