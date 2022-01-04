from tornado.ioloop import IOLoop
from tornado.web import StaticFileHandler
from bokeh.server.server import Server
from bokeh.application import Application
from bokeh.application.handlers.function import FunctionHandler
from os.path import dirname, join
import sys

if not dirname(__file__) in sys.path:
    sys.path.append(dirname(__file__))
from forecast_work import forecast_work

page1_app = Application(FunctionHandler(forecast_work))
StaticFileHandler.reset()
io_loop = IOLoop.current()

server = Server(
    applications={"/": page1_app},
    io_loop=io_loop,
    port=5006,
    static_hash_cache=False,
    debug=False,
    autoreload=True,
    compiled_template_cache=False,
    serve_traceback=True,
)

server.start()
server.show("/")
io_loop.start()
