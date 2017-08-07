from firebase_admin import db
from urllib.request import Request
from urllib.request import urlopen
import json
import logging

with open('secret') as f:
    secret = 'key=' + f.read().replace('\n','')
logging.info('Secret loaded')

def get_tokens(uid):
    return db.reference('fcm/%s' % uid).get().values()

def notify_deadline(user, deadline_key):
    deadline = db.reference('/deadlines/%s/%s' % (user, deadline_key)).get()
    notify(user, 'Deadline is here!', deadline['task'])

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
