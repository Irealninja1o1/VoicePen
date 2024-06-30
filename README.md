

# VoicePen
## Description
VoicePen is a web application that allows users to record their voice, transcribe the recording into text, and summarize the transcribed text. It enhances the text's presentation by eliminating filler words and restructuring it for better readability. Additionally, users can upload pre-recorded audio files for transcription and summarization, and a Chrome extension is provided for enhanced usability.

## Features
1.Voice Recording: Start recording by clicking a button on the screen.

2.Voice-to-Text Conversion: Transcribe spoken words into text using Assembly AI's API.

3.Text Summarization: Summarize and restructure the transcribed text using Hugging Face's BART API.

4.File Uploads: Upload pre-recorded audio files for transcription and summarization.

5.Chrome Extension: Record voice from any browser tab for easy access and enhanced usability.

## Technologies Used
1.Frontend: HTML, CSS, JavaScript

2.APIs:

Assembly AI for voice-to-text conversion

Hugging Face BART for text summarization

## Setup and Installation
### Prerequisites
Node.js and npm installed on your machine.

### Installation
1.Clone the repository:

```bash
git clone https://github.com/your-username/voicepen.git
cd voicepen
```
2.Install the required dependencies:

```bash
npm install
```
3.Create a `.env` file in the root directory and add your API keys:

```env
ASSEMBLY_AI_API_KEY=your_assembly_ai_api_key
HUGGING_FACE_API_KEY=your_hugging_face_api_key
```
4.Run the application:

```bash
npm start
```
5.Open your browser and navigate to http://localhost:3000.

## Usage

1.Recording Voice: Click the "Start Recording" button to begin recording your voice. Click "Stop Recording" to end the recording.

2.Transcribing and Summarizing: After stopping the recording, click "Submit" to transcribe the voice recording and generate a summarized text.

3.Uploading Audio Files: Use the upload feature to select and submit pre-recorded audio files for transcription and summarization.

4.Chrome Extension: Install the provided Chrome extension to enable recording from any browser tab.
