const mic_btn = document.querySelector('#mic');
const playback = document.querySelector('.playback');
const transcriptDisplay = document.querySelector('#transcript');
const summaryDisplay = document.querySelector('#summary');
const uploadBtn = document.querySelector('#upload-file');
mic_btn.addEventListener('click', ToggleMic);
uploadBtn.addEventListener('change', handleFileUpload);

let can_record = false;
let is_recording = false;
let recorder = null;
let chunks = [];

// Initialize Audio
function SetupAudio() {
    console.log("Setup");
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
            .getUserMedia({
                audio: true
            })
            .then(SetupStream)
            .catch(err => {
                console.error(err);
            });
    }
}
SetupAudio();

function SetupStream(stream) {
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = e => {
        chunks.push(e.data);
    };

    recorder.onstop = async e => {
        const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
        chunks = [];
        const audioURL = window.URL.createObjectURL(blob);
        playback.src = audioURL;
        const audioFileUrl = await uploadAudioFile(blob);
        console.log('Audio File URL:', audioFileUrl);
        const transcript = await getTranscription(audioFileUrl);
        if (transcript) {
            transcriptDisplay.innerText = transcript;
            const summary = await getSummary(transcript);
            summaryDisplay.innerText = summary;
        } else {
            transcriptDisplay.innerText = "Transcription failed.";
            summaryDisplay.innerText = "Summary unavailable.";
        }
    };
    can_record = true;
}

function ToggleMic() {
    if (!can_record) { return; }
    is_recording = !is_recording;
    if (is_recording) {
        recorder.start();
        mic_btn.classList.add("is-recording");
    } else {
        recorder.stop();
        mic_btn.classList.remove("is-recording");
    }
}

// Handle file upload
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = async function() {
            const blob = new Blob([reader.result], { type: file.type });
            const audioFileUrl = await uploadAudioFile(blob);
            console.log('Uploaded Audio File URL:', audioFileUrl);
            const transcript = await getTranscription(audioFileUrl);
            if (transcript) {
                transcriptDisplay.innerText = transcript;
                const summary = await getSummary(transcript);
                summaryDisplay.innerText = summary;
            } else {
                transcriptDisplay.innerText = "Transcription failed.";
                summaryDisplay.innerText = "Summary unavailable.";
            }
        };
        reader.onerror = function(error) {
            console.error('FileReader error:', error);
        };
    }
}

// Upload Audio File to AssemblyAI
async function uploadAudioFile(blob) {
    try {
        const response = await fetch('https://api.assemblyai.com/v2/upload', {
            method: 'POST',
            headers: {
                'Authorization': 'aa4e4a52fe634e7a85bdcbf2062872ac',
                'Transfer-Encoding': 'chunked'
            },
            body: blob
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            console.error('Error response from AssemblyAI during upload:', errorResponse);
            throw new Error('Failed to upload audio file');
        }

        const data = await response.json();
        console.log('Audio upload response:', data);
        return data.upload_url;
    } catch (error) {
        console.error('Error during audio file upload:', error);
        return null;
    }
}

// Get Transcription from AssemblyAI API
async function getTranscription(audioFileUrl) {
    try {
        const response = await fetch('https://api.assemblyai.com/v2/transcript', {
            method: 'POST',
            headers: {
                'Authorization': 'aa4e4a52fe634e7a85bdcbf2062872ac',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                audio_url: audioFileUrl
            })
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            console.error('Error response from AssemblyAI:', errorResponse);
            throw new Error('Failed to create transcription');
        }

        const data = await response.json();
        console.log('Transcription creation response:', data);
        if (!data.id) {
            console.error('Transcription creation response does not contain an ID:', data);
            return null;
        }

        // Polling for transcription result
        let transcriptResponse;
        while (true) {
            transcriptResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${data.id}`, {
                headers: {
                    'Authorization': 'aa4e4a52fe634e7a85bdcbf2062872ac'
                }
            });

            if (!transcriptResponse.ok) {
                const errorTranscriptResponse = await transcriptResponse.json();
                console.error('Error response from AssemblyAI during polling:', errorTranscriptResponse);
                throw new Error('Failed to fetch transcription');
            }

            const transcriptData = await transcriptResponse.json();
            if (transcriptData.status === 'completed') {
                return transcriptData.text;
            } else if (transcriptData.status === 'failed') {
                throw new Error('Transcription failed');
            }

            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds before polling again
        }
    } catch (error) {
        console.error('Error during transcription:', error);
        return null;
    }
}

// Get Summary from Hugging Face API
async function getSummary(text) {
    try {
        const response = await fetch('https://api-inference.huggingface.co/models/facebook/bart-large-cnn', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer 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', // Replace this with your actual Hugging Face API key
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: text
            })
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            console.error('Error response from Hugging Face:', errorResponse);
            throw new Error('Failed to get summary');
        }

        const data = await response.json();
        if (data && data.length > 0 && data[0].summary_text) {
            return data[0].summary_text;
        } else {
            throw new Error('Empty or invalid summary response');
        }
    } catch (error) {
        console.error('Error during summarization:', error);
        return null;
    }
}
