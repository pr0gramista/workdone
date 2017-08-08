import firebase_admin
from firebase_admin import credentials
from firebase_admin import db

import time
import json
from urllib.request import Request
from urllib.request import urlopen

import notifications

# Load secret
with open('secret') as f:
    secret = 'key=' + f.read().replace('\n', '')
print('Secret loaded')

# Connect to Firebase
cred = credentials.Certificate('admin.json')
default_app = firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://workdone-160900.firebaseio.com'
})


def get_tokens(uid):
    return db.reference('fcm/%s' % uid).get().values()


print('UID please:')
uid = input()

notifications.notify(uid, "Ok", "This is the test message")
