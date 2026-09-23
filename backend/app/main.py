from fastapi import FastAPI

from app.routers import auth
from app.routers.quotations import buyer_router as buyer_quotations_router
from app.routers.quotations import router as quotations_router
from app.routers.rfqs import router as rfqs_router
from app.routers.rfqs import supplier_router as supplier_rfqs_router
from app.routers.users import router as users_router


app = FastAPI(
    title="Merzado API",
    version="1.0.0",
)


app.include_router(users_router)
app.include_router(auth.router)
app.include_router(rfqs_router)
app.include_router(supplier_rfqs_router)
app.include_router(quotations_router)
app.include_router(buyer_quotations_router)


@app.get("/")
def root():
    return {"message": "Merzado API is running"}