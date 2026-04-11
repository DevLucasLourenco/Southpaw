from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.monster import MonsterCatalogResponse, MonsterSummary
from app.services.monster_service import MonsterService


router = APIRouter(prefix="/monsters", tags=["monsters"])


@router.get("", response_model=MonsterCatalogResponse)
def list_monsters(db: Session = Depends(get_db)) -> MonsterCatalogResponse:
    service = MonsterService(db)
    monsters = service.list_monsters()
    return MonsterCatalogResponse(items=monsters, total=len(monsters))


@router.get("/{slug}", response_model=MonsterSummary)
def get_monster(slug: str, db: Session = Depends(get_db)) -> MonsterSummary:
    service = MonsterService(db)
    monster = service.get_monster_by_slug(slug)
    if not monster:
        raise HTTPException(status_code=404, detail="Monster not found")
    return monster

