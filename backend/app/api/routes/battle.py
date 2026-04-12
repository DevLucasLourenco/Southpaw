from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.schemas.battle import CreateRoomRequest, CreateRoomResponse, RoomSummaryResponse
from app.services.battle_service import battle_manager


router = APIRouter(prefix="/battle", tags=["battle"])


@router.post("/rooms", response_model=CreateRoomResponse)
def create_room(payload: CreateRoomRequest) -> CreateRoomResponse:
    room = battle_manager.create_room(payload.mode)
    return CreateRoomResponse(room_id=room.room_id, join_path=f"/?room={room.room_id}")


@router.get("/rooms/{room_id}", response_model=RoomSummaryResponse)
def get_room(room_id: str) -> RoomSummaryResponse:
    room = battle_manager.get_or_create_room(room_id)
    return RoomSummaryResponse(**room.room_summary())


@router.websocket("/ws/battle/{room_id}")
async def battle_websocket(websocket: WebSocket, room_id: str, name: str = "Duelist", role: str = "player") -> None:
    preferred_role = "spectator" if role == "spectator" else "player"
    connection = await battle_manager.connect(room_id, websocket, name[:24] or "Duelist", preferred_role)
    try:
        while True:
            data = await websocket.receive_json()
            await battle_manager.process_action(room_id, connection, data)
    except WebSocketDisconnect:
        await battle_manager.disconnect(room_id, connection.connection_id)
