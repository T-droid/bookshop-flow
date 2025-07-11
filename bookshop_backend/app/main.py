from fastapi import FastAPI
from db.base import create_db_and_tables

app = FastAPI()

@app.on_event("startup")
async def on_startup():
    create_db_and_tables()

@app.get("/")
async def root():
    return {"message": "Hello World"}

