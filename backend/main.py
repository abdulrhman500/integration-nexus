from fastapi import FastAPI

app = FastAPI()

app.include_router(
    items.router,
    prefix="/items",      # This prefix is added to all paths in items.router
    tags=["items"]        # This groups the routes under "items" in the API docs
)



