from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from jose import JWTError

from app.core.security import decode_token
from app.api.websockets.manager import manager

router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...),
):


    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        token_type = payload.get("type")

        if not user_id or token_type != "access":
            await websocket.close(code=4001)
            return

    except JWTError:
        await websocket.close(code=4001)
        return


    await manager.connect(user_id, websocket)


    await manager.send_to(user_id, {
        "type": "connected",
        "message": f"Connected as user {user_id}",
        "online_count": manager.connection_count,
    })

  
    try:
        while True:
            data = await websocket.receive_json()

            if data.get("type") == "ping":
                await manager.send_to(user_id, {"type": "pong"})

    except WebSocketDisconnect:
       # client closed the tab or navigated away
        manager.disconnect(user_id)

    except Exception:
        manager.disconnect(user_id)