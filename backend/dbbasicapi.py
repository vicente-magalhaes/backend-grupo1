from fastapi import FastAPI
from pydantic import BaseModel
import asyncio
import psycopg2
import os

app = FastAPI()

# Pydantic model for API response structure
class StatusMsg(BaseModel):
    message: str
    db_status: str

def get_db_connection():
    try:
        conn = psycopg2.connect(
            host=os.getenv("POSTGRES_HOST", "db"),
            database=os.getenv("POSTGRES_DB", "mydb"),
            user=os.getenv("POSTGRES_USER", "user"),
            password=os.getenv("POSTGRES_PASSWORD", "password")
        )
        return True
    except Exception as e:
        print(f"DB Connection failed: {e}")
        return False

@app.get("/", response_model=StatusMsg)
async def root():
    
    db_connected = get_db_connection()
    status = "Connected" if db_connected else "Failed"
    
    return StatusMsg(message="Backend is running", db_status=status)


    #if __name__ == "__main__":
#    uvicorn.run("dbbasicapi:app", host="127.0.0.1", port=8000, reload=True)