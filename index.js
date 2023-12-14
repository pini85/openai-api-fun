// Utility function to generate a random number within a range
function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

// Function to create a confetti effect on the screen
function createConfettiEffect() {
  const duration = 3000;
  const endTime = Date.now() + duration;
  const confettiDefaults = {
    startVelocity: 30,
    spread: 360,
    ticks: 60,
    zIndex: 0,
  };

  const interval = setInterval(() => {
    if (Date.now() >= endTime) {
      clearInterval(interval);
      return;
    }

    const particleCount = 50;
    for (let i = 0; i < particleCount; i++) {
      const confettiLib = window.confetti || window.createjs;
      confettiLib({
        ...confettiDefaults,
        particleCount: 2,
        origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
      });
    }
  }, 250);
}

// Functions to show and hide a spinner based on a given type
function showSpinner(type) {
  document.getElementById(`spinner-${type}`).style.display = "block";
}

function hideSpinner(type) {
  document.getElementById(`spinner-${type}`).style.display = "none";
}

// Function to find and display repetitive words from a given text
function displayRepetitiveWords(text) {
  const wordCounts = text
    .toLowerCase()
    .split(" ")
    .reduce((counts, word) => {
      counts[word] = (counts[word] || 0) + 1;
      return counts;
    }, {});

  const sortedWords = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]);
  const repetitiveWordsContainer = document.querySelector("#repetitiveWords");
  repetitiveWordsContainer.innerHTML =
    "<h3>Words repeated more than 2 times:</h3>";

  sortedWords.forEach(([word, count]) => {
    if (count >= 3) {
      repetitiveWordsContainer.innerHTML += `<div>${word}: ${count}</div>`;
    }
  });

  if (repetitiveWordsContainer.childElementCount === 1) {
    repetitiveWordsContainer.innerHTML +=
      "<h4>No words repeated more than 2 times ✔️</h4>";
  }
}

// Function to fetch data and handle its response
async function fetchData(prompt, isRepetitiveWords) {
  showSpinner("text");
  try {
    const response = await fetch("http://localhost:5000/generate-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const text = await response.text();

    document.querySelector("#streamOutput").textContent = "";
    document.getElementById("generateOutput").textContent = text;

    if (isRepetitiveWords) {
      displayRepetitiveWords(text);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    hideSpinner("text");
    createConfettiEffect();
  }
}
// Function to fetch streaming data and handle its response
async function fetchStreamData(prompt) {
  const streamUrl = "http://localhost:5000/generate-stream-text";
  const streamOutputElement = document.querySelector("#streamOutput");
  streamOutputElement.textContent = "";

  try {
    const response = await fetch(streamUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      streamOutputElement.textContent += decoder.decode(value);
    }
  } catch (error) {
    console.error("Error fetching stream data:", error);
  }
}
// Function to handle chat interactions and display responses
async function handleChat() {
  const chatInput = document.getElementById("chatInput");
  const chatOutput = document.getElementById("chatOutput");
  const userMessage = chatInput.value.trim();

  if (!userMessage) return;

  appendMessage(chatOutput, `User: ${userMessage}`, "blue");
  chatInput.value = "";

  try {
    const response = await fetchChatResponse(userMessage);
    appendMessage(chatOutput, `Assistant: ${response}`, "red");
  } catch (error) {
    console.error("Error in chat interaction:", error);
  }
}

// Helper function to append messages to chat
function appendMessage(container, message, color) {
  const messageElement = document.createElement("div");
  messageElement.textContent = message;
  messageElement.style.color = color;
  container.appendChild(messageElement);
}

// Helper function to fetch chat response
async function fetchChatResponse(message) {
  const response = await fetch("http://localhost:5000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  return response.text();
}
function setupEventListeners() {
  document
    .getElementById("generateBtn")
    .addEventListener("click", handleGenerateButtonClick);
  document.getElementById("chatBtn").addEventListener("click", handleChat);
  document.getElementById("start").addEventListener("click", startRecording);
  document.getElementById("stop").addEventListener("click", stopRecording);
  // ... [Other event listeners]
}

function handleGenerateButtonClick() {
  const prompt = document.getElementById("generateBtn").textContent;
  const isStream = document.getElementById("stream").checked;
  isStream
    ? fetchStreamData(prompt)
    : fetchData(prompt, document.getElementById("words").checked);
}
let audioChunks = [];
// Function to start audio recording
async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    setupMediaRecorderEvents();
    mediaRecorder.start();
  } catch (error) {
    console.error("Error starting recording:", error);
  }
}

// Function to stop audio recording
function stopRecording() {
  if (!mediaRecorder) return;
  showSpinner("audio");
  mediaRecorder.stop();
}

// Helper function to setup media recorder event listeners
function setupMediaRecorderEvents() {
  mediaRecorder.ondataavailable = handleAudioDataAvailable;
  mediaRecorder.onstop = handleRecordingStop;
}

function handleAudioDataAvailable(event) {
  audioChunks.push(event.data);
}

async function handleRecordingStop() {
  try {
    const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
    audioChunks = [];
    const transcription = await processAudioBlob(audioBlob);
    displayTranscription(transcription);
  } catch (error) {
    console.error("Error processing audio recording:", error);
  } finally {
    hideSpinner("audio");
    createConfettiEffect();
  }
}

// Function to process audio blob and return transcription
async function processAudioBlob(audioBlob) {
  const formData = new FormData();
  formData.append("audio", audioBlob);
  formData.append("translate", document.getElementById("translate").checked);

  const response = await fetch("http://localhost:5000/audio-fun", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  return data;
}

// Function to display transcription on the UI
function displayTranscription(transcription) {
  const transcriptionElement = document.getElementById("transcription");
  transcriptionElement.textContent = transcription;
}
function setupSpeechAndImageEventListeners() {
  document
    .getElementById("submitBtn")
    .addEventListener("click", handleSpeechGeneration);
  document
    .getElementById("image-input")
    .addEventListener("change", handleImageInput);
  document
    .getElementById("image-url")
    .addEventListener("input", handleImageUrlInput);
  document
    .getElementById("upload-form")
    .addEventListener("submit", handleImageAnalysis);
}
// Function to handle speech generation from text input
async function handleSpeechGeneration(event) {
  event.preventDefault();
  showSpinner("audio");

  const textInput = document.getElementById("textInput").value;
  const selectedVoice = document.getElementById("voiceSelect").value;

  try {
    const audioBlob = await generateSpeech(textInput, selectedVoice);
    playGeneratedSpeech(audioBlob);
  } catch (error) {
    console.error("Failed to generate speech:", error);
  } finally {
    hideSpinner("audio");
    createConfettiEffect();
  }
}

// Helper function to call API for speech generation and return audio blob
async function generateSpeech(text, voice) {
  const response = await fetch("http://localhost:5000/generate-speech", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice }),
  });

  if (!response.ok) throw new Error("Speech generation failed");
  return response.blob();
}

// Function to play generated speech audio
function playGeneratedSpeech(blob) {
  const url = URL.createObjectURL(blob);
  const audioPlayer = document.getElementById("audioPlayer");
  audioPlayer.src = url;
}

// Function to handle changes in image file input
function handleImageInput(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => updateImagePreview(e.target.result);
    reader.readAsDataURL(file);
  }
}

// Helper function to update image preview
function updateImagePreview(imageSrc) {
  const imagePreview = document.getElementById("image-preview");
  imagePreview.src = imageSrc;
  imagePreview.style.display = "block";
}

// Function to handle input changes in image URL field
function handleImageUrlInput() {
  const imageUrl = this.value;
  updateImagePreview(imageUrl);
}

// Function to handle the submission of the image analysis form
async function handleImageAnalysis(event) {
  event.preventDefault();
  showSpinner("image");

  const formData = createImageAnalysisFormData();

  try {
    const analysisResult = await submitImageForAnalysis(formData);
    displayAnalysisResult(analysisResult);
  } catch (error) {
    console.error("Error during image analysis:", error);
  } finally {
    hideSpinner("image");
    createConfettiEffect();
  }
}

// Helper function to create form data for image analysis
function createImageAnalysisFormData() {
  const formData = new FormData();
  formData.append("image", document.getElementById("image-input").files[0]);
  formData.append(
    "question",
    document.getElementById("question-input").value.trim()
  );
  formData.append(
    "imageUrl",
    document.getElementById("image-url").value.trim()
  );
  return formData;
}

// Function to submit image for analysis and return result
async function submitImageForAnalysis(formData) {
  const response = await fetch("http://localhost:5000/analyze-image", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) throw new Error("Image analysis failed");
  return response.json();
}

// Function to display the result of image analysis
function displayAnalysisResult(result) {
  const resultElement = document.getElementById("result");
  resultElement.textContent = JSON.stringify(result, null, 2);
}

setupEventListeners();
setupSpeechAndImageEventListeners();
