from gevent.wsgi import WSGIServer
from app import app

WSGIServer(('', 8085), app).serve_forever()