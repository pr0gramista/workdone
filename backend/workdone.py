import firebase_admin
from firebase_admin import credentials
from firebase_admin import db

import time
import json
from urllib.request import Request
from urllib.request import urlopen

def now():
    return time.time() * 1000

# Load secret
with open('secret') as f:
    secret = 'key=' + f.read().replace('\n','')
print('Secret loaded')

# Connect to Firebase
cred = credentials.Certificate('admin.json')
default_app = firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://workdone-160900.firebaseio.com'
})
ref = db.reference('deadlines')
print('Connected to Firebase')

def checkDeadline(deadline):
    if 'notified' in deadline:
        return False

    # Check end date
    try:
        end_date = int(deadline['end_date'])
        return end_date < now()
    except ValueError:
        print('Parsing end_date failed for %s of %s' % (deadline, user))
        return False


def notify(user, deadline):
    token = db.reference('fcm/%s/token' % user).get()
    if token is None:
        print('Token for user %s is missing' % user)
        return

    global secret
    request = Request(url='https://fcm.googleapis.com/fcm/send')
    request.unverifiable = True
    request.add_header('Authorization', secret)
    request.add_header('Content-Type', 'application/json')
    request.data = json.dumps({
        "notification": {
            "title": "Deadline",
            "body": deadline['task']
        },
        "to": token
    }).encode('utf-8')
    with urlopen(request) as f:
        pass
    print(f.status)
    print(f.reason)

def setDeadlineNotified(user, deadline_key):
    ref.child('%s/%s/notified' % (user, deadline_key)).set(True)
    pass

# Scan deadlines
# It should be changed to more fluent flow than 'give me everything'
user_deadlines = ref.get()
for user in user_deadlines:
    for deadline in user_deadlines[user]: # deadline is a key
        should_notify = checkDeadline(user_deadlines[user][deadline])
        if should_notify:
            notify(user, user_deadlines[user][deadline])
            setDeadlineNotified(user, deadline)
