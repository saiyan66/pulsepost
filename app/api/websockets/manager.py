import json
from typing import Dict
from fastapi import WebSocket


class ConnectionManager:
    """
    Manages all active WebSocket connections.
    Maps user_id (string) → WebSocket instance.
    """

    def __init__(self):
        # { "user_id_string": WebSocket }
        self.active: Dict[str, WebSocket] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        """
        Accept the WebSocket handshake and register the connection.
        """
        await websocket.accept()
        self.active[user_id] = websocket

    def disconnect(self, user_id: str):
        self.active.pop(user_id, None)

    async def send_to(self, user_id: str, message: dict):
        """
        Send a JSON message to a specific user.
        """
        ws = self.active.get(str(user_id))
        if ws:
            try:
                await ws.send_json(message)
            except Exception:
                # Connection dropped without proper close frame
                self.disconnect(str(user_id))

    async def broadcast(self, message: dict):
        """
        Send a JSON message to ALL connected users.
        """
        dead = []
        for user_id, ws in self.active.items():
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(user_id)

        # Clean up dead connections after the loop
        for user_id in dead:
            self.disconnect(user_id)

    def is_connected(self, user_id: str) -> bool:
        return str(user_id) in self.active

    @property
    def connection_count(self) -> int:
        return len(self.active)


manager = ConnectionManager()    