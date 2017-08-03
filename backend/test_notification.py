# pip install firebase-admin
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db

import time
import json
from urllib.request import Request
from urllib.request import urlopen

# Load secret
with open('secret') as f:
    secret = 'key=' + f.read().replace('\n','')
print('Secret loaded')

# Connect to Firebase
cred = credentials.Certificate('admin.json')
default_app = firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://workdone-160900.firebaseio.com'
})

print('Token please:')
token = input()

request = Request(url='https://fcm.googleapis.com/fcm/send')
request.unverifiable = True
request.add_header('Authorization', secret)
request.add_header('Content-Type', 'application/json')
request.data = json.dumps({
    "notification": {
        "title": "Deadline",
        "body": 'This is example notification',
        "icon": '/workdone-logo-square.png'
    },
    "to": token
}).encode('utf-8')
print('Sending notification with payload %s' % request.data)
with urlopen(request) as f:
    pass
