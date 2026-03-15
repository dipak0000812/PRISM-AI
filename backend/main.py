from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("CodeGuardian AI starting up...")
    yield
    print("CodeGuardian AI shutting down...")


app = FastAPI(
    title="CodeGuardian AI",
    description="Autonomous Risk Intelligence for GitLab Merge Requests",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "codeguardian-ai",
        "version": "1.0.0"
    }