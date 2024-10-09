class WebSocketManager {
  constructor(url) {
    this.url = url;
    this.webSocket = null;
    this.keepAliveIntervalId = null;
  }

  connect() {
    if (this.webSocket) {
      console.log('WebSocket is already connected.');
      return;
    }

    console.log('Establishing WebSocket connection...');
    this.webSocket = new WebSocket(this.url);

    this.webSocket.onopen = (event) => {
      console.log('WebSocket connected');
      this.keepAlive();
    };

    this.webSocket.onmessage = (event) => {
      console.log(`Received message: ${event.data}`);
    };

    this.webSocket.onclose = () => {
      console.log('WebSocket connection closed');
      this.cleanup();
    };

    this.webSocket.onerror = (error) => {
      console.error('WebSocket error: ', error);
      this.cleanup();
    };
  }

  disconnect() {
    if (!this.webSocket) {
      console.log('WebSocket is not connected.');
      return;
    }

    console.log('Closing WebSocket connection...');
    this.webSocket.close();
  }

  cleanup() {
    if (this.keepAliveIntervalId) {
      clearInterval(this.keepAliveIntervalId);
      this.keepAliveIntervalId = null;
    }
    this.webSocket = null;
  }

  keepAlive() {
    if (this.keepAliveIntervalId) {
      console.log('KeepAlive is already running.');
      return;
    }

    this.keepAliveIntervalId = setInterval(() => {
      if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
        console.log('Sending keepalive signal');
        this.webSocket.send('keepalive');
      } else {
        console.log('WebSocket is not open. Stopping keepalive.');
        clearInterval(this.keepAliveIntervalId);
        this.keepAliveIntervalId = null;
      }
    }, 20000);
  }
}

self.WebSocketManager = WebSocketManager;
