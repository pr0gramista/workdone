from firebase_admin import db
from urllib.request import Request
from urllib.request import urlopen
import json
import logging
import random
import time

reminders = [
    'There is something to do',
    'Do you remember?',
    'Member?',
    'WORK WORK WORK',
    'There\'s still time',
    'What will you do today?',
    'Come on!',
    'The clock is ticking',
    'Time is running out',
    'You can still fix it'
]

endings = [
    'DEADLINE',
    'The End',
    'Deadline',
    '0s left'
]

def now():
    return time.time() * 1000

with open('secret') as f:
    secret = 'key=' + f.read().replace('\n','')
logging.info('Secret loaded')

def get_tokens(uid):
    return db.reference('fcm/%s' % uid).get().values()

def notify_deadline(user, deadline_key):
    deadline = db.reference('/deadlines/%s/%s' % (user, deadline_key)).get()

    title = None

    if int(deadline['end_date']) > now() + 10000: # Add 10 seconds padding
        title = random.choice(reminders)
    else:
        title = random.choice(endings)

    notify(user, title, deadline['task'])

def notify(user, title, body):
    logging.info('Notifying %s' % user)
    tokens = get_tokens(user)

    global secret
    for token in tokens:
        request = Request(url='https://fcm.googleapis.com/fcm/send')
        request.unverifiable = True
        request.add_header('Authorization', secret)
        request.add_header('Content-Type', 'application/json')
        request.data = json.dumps({
            "notification": {
                "title": title,
                "body": body,
                "icon": '/workdone-logo-square.png'
            },
            "to": token
        }).encode('utf-8')
        logging.debug('Sending notification for token %s with payload %s' % (token, request.data))
        with urlopen(request) as f:
            pass
        logging.debug(f.status)
        logging.debug(f.reason)

    if len(tokens) == 0:
        logging.warning('Token for user %s is missing' % user)
