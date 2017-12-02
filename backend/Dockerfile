FROM python:3

WORKDIR /app

ADD . /app

ADD requirements.txt /

RUN pip install -r requirements.txt

CMD [ "python", "./workdone.py" ]
