from sqlmodel import SQLModel
from abc import ABC, abstractmethod


class UserBase(SQLModel, ABC):
    """Abstract base class for all user types"""
    
    @property
    @abstractmethod
    def role(self) -> str:
        """Return the user's role"""
        raise NotImplementedError
