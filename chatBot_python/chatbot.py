from flask import Flask, jsonify, render_template, request
import random
import json
import pickle
import numpy as np
import nltk
import logging

from nltk.stem import WordNetLemmatizer
from keras.models import load_model

app = Flask(__name__)

# Configure logging
logging.basicConfig(filename='chatbot.log', level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize NLTK lemmatizer
lemmatizer = WordNetLemmatizer()

# Load intents, words, and classes
intents_json = json.loads(open('C:/Users/utilisateur/Documents/CFA_INSTA/IACoursJohan/WorkspaceProjet/chatBot_python/intents.json').read())
words = pickle.load(open('words.pkl', 'rb'))
classes = pickle.load(open('classes.pkl', 'rb'))
model = load_model('chatbot_model.h5')

def clean_up_sentence(sentence):
    sentence_words = nltk.word_tokenize(sentence)
    sentence_words = [lemmatizer.lemmatize(word) for word in sentence_words]
    return sentence_words

def bag_of_words(sentence):
    sentence_words = clean_up_sentence(sentence)
    bag = [0] * len(words)
    for w in sentence_words:
        for i, word in enumerate(words):
            if word == w:
                bag[i] = 1
    return np.array(bag)

def predict_class(sentence):
    bow = bag_of_words(sentence)
    res = model.predict(np.array([bow]))[0]
    ERROR_THRESHOLD = 0.25
    results = [[i, r] for i, r in enumerate(res) if r > ERROR_THRESHOLD]

    results.sort(key=lambda x: x[1], reverse=True)
    return_list = []
    for r in results:
        return_list.append({'intent': classes[r[0]], 'probability': str(r[1])})
    return return_list

def get_response(intents_list, intents_json):
    tag = intents_list[0]['intent']
    list_of_intents = intents_json['intents']
    result = None
    for i in list_of_intents:
        if i['tag'] == tag:
            result = random.choice(i['responses'])
            break
    if result is None:
        logger.warning("No appropriate response found for the user's input.")
        result = "I'm sorry, I didn't understand that."
    return result

@app.route('/')
def home():
    return render_template('chat.html')

@app.route('/get')
def get_bot_response():
    user_text = request.args.get('msg')
    if not user_text:
        user_text = request.args.get('voice_msg') # Get voice message if text message is not available
    logger.info(f"User input: {user_text}")
    ints = predict_class(user_text)
    res = get_response(ints, intents_json=intents_json)
    logger.info(f"Bot response: {res}")

    if res:
        return res
    else:
        return "I'm sorry, I didn't understand that."

@app.route('/dislike', methods=['POST'])
def handle_dislike():
    data = request.get_json()
    if data.get('disliked'):
        logger.warning("User disliked the bot's response.")
    return jsonify({'message': 'Dislike feedback received.'}), 200

if __name__ == '__main__':
    app.run(debug=True)
