# conda activate asr
# ollama pull mistral
# ollama serve&
# export PYTORCH_ENABLE_MPS_FALLBACK=1
# pip install flask-socketio
# python3 -m flask --app app --debug run

import os
import torch
import ollama
from flask_socketio import SocketIO, emit
from flask import Flask, request, jsonify, render_template
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline

os.environ["PYTORCH_ENABLE_MPS_FALLBACK"] = "1"

app = Flask(__name__)
socketio = SocketIO(app)

device = "mps"
torch_dtype = torch.float16
# device = "cuda:0" if torch.cuda.is_available() else "cpu"
# torch_dtype = torch.float16 if torch.cuda.is_available() else torch.float32

model_id = "distil-whisper/distil-large-v3"

model = AutoModelForSpeechSeq2Seq.from_pretrained(
    model_id, torch_dtype=torch_dtype, low_cpu_mem_usage=True, use_safetensors=True
)
model.to(device)

processor = AutoProcessor.from_pretrained(model_id)

pipe = pipeline(
    "automatic-speech-recognition",
    model=model,
    tokenizer=processor.tokenizer,
    feature_extractor=processor.feature_extractor,
    max_new_tokens=128,
    torch_dtype=torch_dtype,
    device=device,
)

@app.route("/")
def index():
    return render_template('index.html')

@app.route("/api/v1/transcript",methods=["POST"])
def transcript():

    files = request.files
    file = files.get('file')
    file.save(f'./audios/tmp.opus')

    transcription = pipe(f'./audios/tmp.opus')["text"]

    response = jsonify(transcription)
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response

@app.route("/api/v1/chat",methods=["POST"])
def chat():

    prompt = str(request.get_data())
    print(prompt)

    response = ollama.chat(
        # model="cniongolo/biomistral",
        model="mistral",
        options={
            "num_predict": 2048,
        },
        messages=[
        {
            'role': 'user',
            'content': prompt,
        },
        ]
    )

    answer = response['message']['content']

    response = jsonify(answer)
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response

@socketio.on('chat')
def handler_chat(message):

    print("Here 0")
    print(message)

    stream = ollama.chat(
        # model="cniongolo/biomistral",
        model="mistral",
        stream=True,
        options={
            "num_predict": 2048,
        },
        messages=message["messages"]
        # messages=[
        #     {
        #         'role': 'user',
        #         'content': message["data"],
        #     },
        # ]
    )

    print("Here 1")

    tmp = ""
    
    print(stream)

    for chunk in stream:
        print(chunk['message']['content'], end='', flush=True)
        tmp += chunk['message']['content']
        emit('chat_response', {'data': tmp, 'id': message["id"]})
    
    emit('chat_finished', {'data': "finished", 'id': message["id"]})

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0')
