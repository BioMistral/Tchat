<p align="center">
  <img src="https://raw.githubusercontent.com/BioMistral/Tchat/main/static/images/wordart-tchat.png?download=true" alt="drawing" width="250"/>
</p>

Tchat is an fast and open-source online multi-turn conversationnal agent chatting service, allowing to have access to a broad range of large language models (LLMs) everywhere from the web. It include a speech-to-text module which allow voice-based interactions.

It's build to run any LLMs and ASR systems, but serve as a demonstration tool for BioMistral 7B suite of models.

- 📰 Paper: BioMistral: <a href="https://arxiv.org/abs/2402.10373"> A Collection of Open-Source Pretrained Large Language Models for Medical Domains</a> (pre-print)

- 📊 Multilingual medical benchmark : <a href="https://huggingface.co/datasets/BioMistral/BioInstructQA">BioMistral/BioInstructQA</a>

- 👩‍💻 GitHub: <a href="https://github.com/BioMistral/BioMistral">BioMistral/BioMistral</a>

This project is the result of the collaboration between:

<table>
<tbody>
  <tr>
    <td>🏛️ <a href="https://lia.univ-avignon.fr/">LIA - Avignon University (1)</a></td>
    <td>🏛️ <a href="https://www.ls2n.fr/">LS2N - Nantes University (3)</a></td>
  </tr>
  <tr>
    <td>🏥 <a href="https://www.chu-nantes.fr/unite-recherche-2">Nantes University Hospital (2)</a></td>
    <td>🏢 <a href="https://zenidoc.fr/">Zenidoc (4)</a></td>
  </tr>
</tbody>
</table>

**Authors** : Yanis LABRAK (1,4) ; Adrien BAZOGE (2,3) ; Emmanuel MORIN (3) ; Pierre-Antoine GOURAUD (2) ; Mickaël ROUVIER (1) ; Richard DUFOUR (3)

**Caution:** We recommend using BioMistral 7B strictly as a research tool and advise against deploying it in production environments for natural language generation or any professional health and medical purposes.

# Demonstration

<img src="https://github.com/BioMistral/Tchat/raw/main/static/images/Screen-Recording-2024-06-23-at-14.01.51.gif" alt="Demonstration Tchat" style="width: 100%; object-fit: cover;">

# Setup

1. Create a conda environement `test`
2. Install the dependencies with `pip install -r requirements.txt`
3. Prevent errors on MacOS for M1 chips: `export PYTORCH_ENABLE_MPS_FALLBACK=1`
4. Download BioMistral using Ollama: `ollama pull cniongolo/biomistral`
5. Run the server in background: `ollama serve&`
6. Start the web services: `python3 -m flask --app app --debug run`
7. Go to the demonstration page: `127.0.0.1:5000/`

# API Endpoints

You can also access to the web services using the Flask API:
- Query the LLMs using HTTP POST:
```javascript
$.ajax({
    url: '/api/v1/chat',
    data: data_transcript,
    processData: false,
    contentType: false,
    crossDomain: true,
    type: 'POST',
    success: function(data_llm){
      console.log(data_llm);
    }
});
```
- Socket for querying the LLM (socket `chat`) and listen to a output stream of the channel `chat_response`:
```javascript
socket.on('chat_response', function(msg) {
  document.getElementById(msg.id).innerText = msg.data;
  chatArea.scrollTop = chatArea.scrollHeight;
});

socket.emit('chat', {
  messages: [{
    'role': 'user',
    'content': "What is the capital of France?",
  }],
  id: "unique_id_1"
});
```
- Query the Speech-To-Text model using HTTP POST:
```javascript
$.ajax({
  url: '/api/v1/transcript',
  data: fd,
  processData: false,
  contentType: false,
  crossDomain: true,
  type: 'POST',
  success: function(data_transcript){
      console.log(data_transcript);
  }
});
```
- Socket for querying the Speech-To-Text model and listen to a output stream:
> Comming soon


