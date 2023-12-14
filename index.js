function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

function confettiEffect() {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) return clearInterval(interval);

    const particleCount = 50;
    for (let i = 0; i < particleCount; i++) {
      const confetti = window.confetti || window.createjs;
      confetti(
        Object.assign({}, defaults, {
          particleCount: 2,
          origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
        })
      );
    }
  }, 250);
}

function showSpinner(type) {
  console.log("type", { type });
  document.getElementById(`spinner-${type}`).style.display = "block";
}

function hideSpinner(type) {
  console.log("IM HERE");
  document.getElementById(`spinner-${type}`).style.display = "none";
}
function repetitiveWords(text) {
  const words = text.split(" ");
  //lower case

  const wordCount = {};
  words.forEach((word) => {
    //lower case each word
    word = word.toLowerCase();
    if (wordCount[word]) {
      wordCount[word] += 1;
    } else {
      wordCount[word] = 1;
    }
  });
  const sortedWords = Object.entries(wordCount).sort((a, b) => b[1] - a[1]);
  //display it to the dom
  const repetitiveWords = document.querySelector("#repetitiveWords");
  repetitiveWords.textContent = "";
  //only show words that are nilcuded at least 2 times
  //create a small title that says words that are repeated more than 2 times
  const title = document.createElement("h3");
  title.textContent = "Words that are repeated more than 2 times:";
  repetitiveWords.appendChild(title);

  sortedWords.forEach((word) => {
    if (word[1] < 3) return;
    const wordElement = document.createElement("div");
    wordElement.textContent = `${word[0]}: ${word[1]}`;
    repetitiveWords.appendChild(wordElement);
  });
  //if there is no words that is repeated more than two times create an h4 saying so
  if (repetitiveWords.childElementCount === 1) {
    const noWords = document.createElement("h4");
    noWords.textContent = "No words are repeated more than 2 times ✔️";
    repetitiveWords.appendChild(noWords);
  }
}

async function fetchData(prompt) {
  showSpinner("text");

  const response = await fetch("http://localhost:5000/generate-text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  const text = await response.text();
  const isRepetitiveWords = document.getElementById("words").checked;
  document.querySelector("#streamOutput").textContent = "";
  document.getElementById("generateOutput").textContent = text;
  hideSpinner("text");
  confettiEffect();
  //if reptitive words are checked create a and invoke a function that will look at the text and find any reptitive words and display it to the dom
  if (isRepetitiveWords) {
    repetitiveWords(text);
  }
}

function fetchStreamData(prompt) {
  const streamUrl = "http://localhost:5000/generate-stream-text";
  const streamOutput = document.querySelector("#streamOutput");
  streamOutput.textContent = "";

  fetch(streamUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  })
    .then(async (response) => {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        console.log("Received chunk:", text);
        streamOutput.textContent += text;
      }
      console.log("Stream ended");
    })
    .catch((error) => {
      console.error("Error fetching stream data:", error);
    });
}

async function handleChat() {
  const chatInput = document.getElementById("chatInput");
  const chatOutput = document.getElementById("chatOutput");

  const message = chatInput.value.trim();
  if (message === "") return;

  const userMessageElement = document.createElement("div");
  userMessageElement.textContent = `User: ${message}`;
  userMessageElement.style.color = "blue";
  chatOutput.appendChild(userMessageElement);

  chatInput.value = "";

  const response = await fetch("http://localhost:5000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  const reply = await response.text();

  // Create and append assistant's response
  const assistantMessageElement = document.createElement("div");
  assistantMessageElement.textContent = `Assistant: ${reply}`;
  assistantMessageElement.style.color = "red"; // Change color to red
  chatOutput.appendChild(assistantMessageElement);
}

// Event listeners
document.getElementById("generateBtn").addEventListener("click", () => {
  const prompt = document.getElementById("generateBtn").textContent;
  const isStream = document.getElementById("stream").checked;

  return isStream ? fetchStreamData(prompt) : fetchData(prompt);
});

document.getElementById("chatBtn").addEventListener("click", handleChat);

document.getElementById("start").addEventListener("click", startRecording);
document.getElementById("stop").addEventListener("click", stopRecording);
let mediaRecorder;
let audioChunks = [];
async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.ondataavailable = (event) => {
    audioChunks.push(event.data);
  };
  mediaRecorder.start();
}

function stopRecording(event) {
  showSpinner("audio");
  mediaRecorder.stop();

  mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
    audioChunks = [];

    const formData = new FormData();
    formData.append("audio", audioBlob);

    const translate = document.getElementById("translate").checked;
    console.log(translate);
    formData.append("translate", translate);

    try {
      const response = await fetch("http://localhost:5000/audio-fun", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      hideSpinner("audio");
      confettiEffect();
      const pEl = document.getElementById("transcription");
      pEl.textContent = data;
    } catch (error) {
      console.error("Error during fetch:", error);
    }
  };
}
document.getElementById("submitBtn").addEventListener("click", async () => {
  showSpinner("audio");
  const text = document.getElementById("textInput").value;
  const selectedVoice = document.getElementById("voiceSelect").value;

  const response = await fetch("http://localhost:5000/generate-speech", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: text, voice: selectedVoice }),
  });

  if (!response.ok) {
    console.error("Failed to generate speech");
    return;
  }

  const blob = await response.blob();
  hideSpinner("audio");
  confettiEffect();
  const url = URL.createObjectURL(blob);
  document.getElementById("audioPlayer").src = url;
});
document.getElementById("image-input").addEventListener("change", function () {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = document.getElementById("image-preview");
      img.src = e.target.result;
      img.style.display = "block"; // Show the image
    };
    reader.readAsDataURL(file);
  }
});
document.getElementById("image-url").addEventListener("input", function () {
  const url = this.value;
  const img = document.getElementById("image-preview");
  img.src = url;
  img.style.display = "block"; // Show the image
  //create a new image element
});

document
  .getElementById("upload-form")
  .addEventListener("submit", async function (event) {
    console.log("im clicked");
    event.preventDefault();

    const formData = new FormData();
    formData.append("image", document.getElementById("image-input").files[0]);
    const question = document.getElementById("question-input").value.trim();
    const imageUrl = document.getElementById("image-url").value.trim();
    formData.append("imageUrl", imageUrl);
    formData.append("question", question);
    showSpinner("image");

    const response = await fetch("http://localhost:5000/analyze-image", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    hideSpinner("image");
    confettiEffect();
    document.getElementById("result").textContent = JSON.stringify(
      result,
      null,
      2
    );
  });
