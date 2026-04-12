from typing import Protocol


class CardContract(Protocol):
    @property
    def name(self) -> str:
        ...

    @property
    def mana_cost(self) -> int:
        ...

    def export_summary(self) -> dict:
        ...


class PowerContract(Protocol):
    @property
    def ability_name(self) -> str:
        ...

    @property
    def ability_text(self) -> str:
        ...
