#! /usr/bin/env python3
#
# references:
# * https://pythonbasics.org/webserver/
# * https://www.simplifiedpython.net/python-simple-http-server/
# * https://gist.github.com/UniIsland/3346170

from http.server import BaseHTTPRequestHandler, HTTPServer
import mimetypes
import urllib.request, urllib.parse, urllib.error
import posixpath
import os

class Server(BaseHTTPRequestHandler):

    # *very basic* routing
    webroot = "museum-label" # if found, URL root...
    fileroot = "html"        # ...translates to file path root

    # print requests?
    verbose = False

    # simply serve files via GET
    def do_GET(self):
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            if not self.path.endswith("/"):
                # redirect browser - doing basically what apache does
                self.send_response(301)
                self.send_header("Location", self.path + "/")
                self.end_headers()
                return
            for index in "index.html", "index.htm":
                index = os.path.join(path, index)
                if os.path.exists(index):
                    path = index
                    break
            else:
                # no index file
                content = bytes("<html><head><title>200 Directory</title></head>" + \
                            "<body> 200 " + self.path + " is a directory without index</body></html>", "utf-8")
                self.send_response(200)
                self.send_header("Content-type", "text/html")
                self.end_headers()
                self.wfile.write(content)
                return
        try:
            content = open(path, "rb").read()
            self.send_response(200)
            mtype = mimetypes.guess_type(path)
            if mtype:
                self.send_header("Content-type", mtype[0])
            else:
                self.send_header("Content-type", "application/octet-stream")
        except Exception as exc:
            content = bytes("<html><head><title>404 File Not Found</title></head>" + \
                            "<body> 404 " + self.path + " not found</body></html>", "utf-8")
            self.send_response(404)
            self.send_header("Content-type", "text/html")
        self.end_headers()
        self.wfile.write(content)

    # translate URL path to file path, abandons query parameters
    def translate_path(self, path):
        path = path.split("?",1)[0]
        path = path.split("#",1)[0]
        path = posixpath.normpath(urllib.parse.unquote(path))
        words = path.split("/")
        words = [_f for _f in words if _f]
        if len(words) > 0 and words[0] == Server.webroot:
            words[0] = Server.fileroot
        path = os.getcwd()
        for word in words:
            drive, word = os.path.splitdrive(word)
            head, word = os.path.split(word)
            if word in (os.curdir, os.pardir): continue
            path = os.path.join(path, word)
        return path

    # only log requests when verbose
    def log_request(self, *args):
        if Server.verbose:
            super().log_request(args)

if __name__ == "__main__":
    import argparse

    # parser
    parser = argparse.ArgumentParser(description="basic museum-label client http server")
    parser.add_argument(
        "--host", action="store", dest="host",
        default="localhost", help="server host ie. http://####:8081 default: localhost")
    parser.add_argument(
        "--port", action="store", dest="port",
        default=8080, type=int, help="server port ie. http://localhost:####, default: 8080")
    parser.add_argument("-v", "--verbose", action="store_true", dest="verbose",
        help="enable verbose printing")
    args = parser.parse_args()

    # server
    server = HTTPServer((args.host, args.port), Server)
    Server.verbose = args.verbose
    print(f"server started http://{args.host}:{args.port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
