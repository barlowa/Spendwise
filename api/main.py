from fastapi import FastAPI, Depends
from sqlalchemy import text
from routers import users, transactions
from db.dependencies import get_db
from sqlalchemy.orm import Session
from auth import get_current_user
from models.user import User

app = FastAPI(
    title="Spendwise API", description="API for Spendwise application", version="1.0.0"
)

app.include_router(users.router)
app.include_router(transactions.router)


# endpoint to check if the server is running
@app.get("/")
async def check_server_health():
    return "Server is running"


# database health check endpoint to verify database connectivity
@app.get("/db")
def check_database_connection(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"database": "connected"}


# test the auth
@app.get("/auth-test")
def auth_test(current_user: User = Depends(get_current_user)):

    return {
        "message": "Authentication successful",
    }
