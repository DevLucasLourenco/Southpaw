from typing import Literal

from pydantic import BaseModel, Field


RoleType = Literal["player", "spectator"]
RoomMode = Literal["pvp", "practice_bot"]


class CreateRoomRequest(BaseModel):
    preferred_role: RoleType = "player"
    mode: RoomMode = "pvp"


class CreateRoomResponse(BaseModel):
    room_id: str
    join_path: str


class RoomSeatSummary(BaseModel):
    seat: Literal["player_one", "player_two"]
    display_name: str | None
    connected: bool


class RoomSummaryResponse(BaseModel):
    room_id: str
    mode: RoomMode = "pvp"
    started: bool
    completed: bool
    round_number: int
    spectators: int
    seats: list[RoomSeatSummary] = Field(default_factory=list)
