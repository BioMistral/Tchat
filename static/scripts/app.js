const record = document.querySelector(".record");
const stop = document.querySelector(".stop");
const clear = document.querySelector(".clear");
const chatArea = document.querySelector(".chat-area");
// const canvas = document.querySelector(".visualizer");

stop.disabled = true;

let audioCtx;
// const canvasCtx = canvas.getContext("2d");

var counter = 0;
var history_messages = [];

var socket = io();

socket.on('connect', function() {});

socket.on('chat_response', function(msg) {
  document.getElementById(msg.id).innerText = msg.data;
  chatArea.scrollTop = chatArea.scrollHeight;
});

socket.on('chat_finished', function(msg) {
  history_messages.push({
    'role': 'assistant',
    'content': document.getElementById(msg.id).innerText,
  });
  console.log(history_messages);
});

clear.onclick = function () {
  history_messages = [];
  document.getElementById("chat-area").innerHTML = "";
};

function addUserInteraction(text, audio_url=null) {

  counter += 1;
  var identifier = `chat_${counter}`
  
  if (audio_url === null) {
    var audioContent = "";
  }
  else {
    var audioContent = `<audio controls src="${audio_url}"></audio>`;
  }

  const date = new Date();
  const hour = date.getHours();
  const min = date.getMinutes();

  const userPrompt = document.createElement("div");
  userPrompt.innerHTML = `
  <div class="flex items-end pb-5 pt-5" style="width: 100%;">
    <div class="flex items-start gap-2.5 pl-40" style="margin-left: auto;  margin-right: 0;">
      <img class="w-8 h-8 rounded-full" src="/static/images/ricardo.jpeg" alt="BioMistral image">
      <div class="ml-3 flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700">
          <div class="flex items-center space-x-2 rtl:space-x-reverse">
            <span class="text-sm font-semibold text-gray-900 dark:text-white">Richard Dufour</span>
            <span class="text-sm font-normal text-gray-500 dark:text-gray-400">${hour}:${min}</span>
          </div>
          ${audioContent}
          <p id="${identifier}" class="text-sm font-normal py-2.5 text-gray-900 dark:text-white">
          ${text}
          </p>
          <span class="text-sm font-normal text-gray-500 dark:text-gray-400">Delivered</span>
      </div>
    </div>
  </div>
  `;
  // userPrompt.textContent = data_transcript;
  userPrompt.classList.add("user-prompt");
  chatArea.appendChild(userPrompt);

  chatArea.scrollTop = chatArea.scrollHeight;

  return identifier;
}

var machine_counter = 0;

function addMachineInteraction(text) {

  machine_counter += 1;
  var identifier = `chat_machine_${machine_counter}`

  const date = new Date();
  const hour = date.getHours();
  const min = date.getMinutes();
                
  const llmAnswer = document.createElement("div");
  llmAnswer.innerHTML = `
  <div class="flex items-start gap-2.5 pr-40 pb-5 pt-5">
    <img class="w-8 h-8 rounded-full" src="/static/images/wordart_blue_m_rectangle.png" alt="Richard image">
    <div class="ml-3 flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700">
        <div class="flex items-center space-x-2 rtl:space-x-reverse">
          <span class="text-sm font-semibold text-gray-900 dark:text-white">BioMistral</span>
          <span class="text-sm font-normal text-gray-500 dark:text-gray-400">${hour}:${min}</span>
        </div>
        <p id="${identifier}" class="text-sm font-normal py-2.5 text-gray-900 dark:text-white">
          ${text}
        </p>
        <span class="text-sm font-normal text-gray-500 dark:text-gray-400">Delivered</span>
    </div>
  </div>
  `;
  llmAnswer.classList.add("llm-prompt");
  chatArea.appendChild(llmAnswer);

  chatArea.scrollTop = chatArea.scrollHeight;

  return identifier;
  
}

// Main block for doing the audio recording
if (navigator.mediaDevices.getUserMedia) {
  console.log("The mediaDevices.getUserMedia() method is supported.");

  const constraints = { audio: true };
  let chunks = [];

  let onSuccess = function (stream) {
    const mediaRecorder = new MediaRecorder(stream);

    // visualize(stream);

    record.onclick = function () {
      mediaRecorder.start();
      console.log(mediaRecorder.state);
      console.log("Recorder started.");
      record.style.background = "red";

      stop.disabled = false;
      record.disabled = true;

      document.getElementById("record").style.display = "none";
      document.getElementById("stop").style.display = "block";
    };

    stop.onclick = function () {
      mediaRecorder.stop();
      console.log(mediaRecorder.state);
      console.log("Recorder stopped.");
      record.style.background = "";
      record.style.color = "";

      stop.disabled = true;
      record.disabled = false;

      document.getElementById("record").style.display = "block";
      document.getElementById("stop").style.display = "none";

    };

    const submitText = document.getElementById("submit-text");
    submitText.onclick = function (e) {

      var user_text = document.getElementById("prompt-text").value;
      current_identifier = addUserInteraction(user_text);
      document.getElementById("prompt-text").value = "";

      var current_identifier_machine = addMachineInteraction("Answering question...");

      console.log("inside 1.1");
      // socket.emit('chat', {
      //   data: user_text,
      //   id: current_identifier_machine
      // });
      history_messages.push({
        'role': 'user',
        'content': user_text,
      });
      socket.emit('chat', {
        messages: history_messages,
        id: current_identifier_machine
      });

      // $.ajax({
      //   url: '/api/v1/chat',
      //   data: user_text,
      //   processData: false,
      //   contentType: false,
      //   crossDomain: true,
      //   type: 'POST',
      //   success: function(data_llm){
      //     document.getElementById(current_identifier_machine).innerText = data_llm;
      //   }
      // });

    };

    mediaRecorder.onstop = function (e) {

      const audio = document.createElement("audio");

      audio.setAttribute("controls", "");

      audio.controls = true;
      const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
      chunks = [];
      const audioURL = window.URL.createObjectURL(blob);
      audio.src = audioURL;
      console.log("recorder stopped");

      var fd = new FormData();
      fd.append('file', blob, 'file');

      current_identifier = addUserInteraction(text="Transcription ...", audio_url=audioURL);
      
      $.ajax({
        url: '/api/v1/transcript',
        data: fd,
        processData: false,
        contentType: false,
        crossDomain: true,
        type: 'POST',
        success: function(data_transcript){

          document.getElementById(current_identifier).innerText = data_transcript;

          var current_identifier_machine = addMachineInteraction("Answering question...");

          console.log("inside 1");
          history_messages.push({
            'role': 'user',
            'content': data_transcript,
          });
          socket.emit('chat', {
            messages: history_messages,
            id: current_identifier_machine
          });
          
          // $.ajax({
          //   url: '/api/v1/chat',
          //   data: data_transcript,
          //   processData: false,
          //   contentType: false,
          //   crossDomain: true,
          //   type: 'POST',
          //   success: function(data_llm){
          //     document.getElementById(current_identifier_machine).innerText = data_llm;
          //   }
          // });

        }
      });

    };

    mediaRecorder.ondataavailable = function (e) {
      chunks.push(e.data);
    };
  };

  let onError = function (err) {
    console.log("The following error occured: " + err);
  };

  navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
} else {
  console.log("MediaDevices.getUserMedia() not supported on your browser!");
}

// function visualize(stream) {
//   if (!audioCtx) {
//     audioCtx = new AudioContext();
//   }

//   const source = audioCtx.createMediaStreamSource(stream);

//   const analyser = audioCtx.createAnalyser();
//   analyser.fftSize = 2048;
//   const bufferLength = analyser.frequencyBinCount;
//   const dataArray = new Uint8Array(bufferLength);

//   source.connect(analyser);

//   draw();

//   function draw() {
//     const WIDTH = canvas.width;
//     const HEIGHT = canvas.height;

//     requestAnimationFrame(draw);

//     analyser.getByteTimeDomainData(dataArray);

//     canvasCtx.fillStyle = "rgb(200, 200, 200)";
//     canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

//     canvasCtx.lineWidth = 2;
//     canvasCtx.strokeStyle = "rgb(0, 0, 0)";

//     canvasCtx.beginPath();

//     let sliceWidth = (WIDTH * 1.0) / bufferLength;
//     let x = 0;

//     for (let i = 0; i < bufferLength; i++) {
//       let v = dataArray[i] / 128.0;
//       let y = (v * HEIGHT) / 2;

//       if (i === 0) {
//         canvasCtx.moveTo(x, y);
//       } else {
//         canvasCtx.lineTo(x, y);
//       }

//       x += sliceWidth;
//     }

//     canvasCtx.lineTo(canvas.width, canvas.height / 2);
//     canvasCtx.stroke();
//   }
// }

window.onresize();
