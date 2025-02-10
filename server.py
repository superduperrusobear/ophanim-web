from http.server import HTTPServer, SimpleHTTPRequestHandler
import sys

class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

port = 8000
print(f"Starting server at http://localhost:{port}")
print("Press Ctrl+C to stop the server")
HTTPServer(('localhost', port), CORSRequestHandler).serve_forever() 