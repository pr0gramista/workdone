import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
from notifications import notify_deadline
import schedule
import time

# Logging
import logging
logging.basicConfig(level=logging.DEBUG, filename='workdone.log')
logging.getLogger('schedule').propagate = False
logger = logging.getLogger()
logger.info('Workdone backend up!')

# Connect to Firebase
cred = credentials.Certificate('admin.json')
default_app = firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://workdone-160900.firebaseio.com'
})
logger.info('Connected to Firebase')


def now():
    return time.time() * 1000


# Scan notification
notifications_ref = db.reference('notifications').order_by_child('time')


def scan():
    notifications = notifications_ref.get()
    if notifications is not None:
        for key, notification in notifications.items():
            if int(notification['time']) < now():
                # Notify and remove notification
                notify_deadline(
                    user=notification['uid'],
                    deadline_key=notification['did'])

                db.reference('notifications/' + key).delete()
            else:
                break


def alive():
    logger.info('I am still alive %s' % time.time())


def update_life_check():
    db.reference('life_check').set(int(now()))


schedule.every().second.do(scan)
schedule.every(6).hours.do(alive)
schedule.every(5).minutes.do(update_life_check)

update_life_check()

while True:
    try:
        schedule.run_pending()
    except Exception as error:
        logger.error(error)
    time.sleep(1)
