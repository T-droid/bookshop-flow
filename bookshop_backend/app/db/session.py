from fastapi import FastAPI, Depends
from sqlmodel import  Session
from db.base import engine

from typing import Annotated

def get_session():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]