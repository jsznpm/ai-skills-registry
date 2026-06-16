# Examples

## Validate at the boundary (FastAPI + Pydantic)
```python
from pydantic import BaseModel, EmailStr

class CreateUser(BaseModel):
    email: EmailStr
    age: int

@app.post("/users")
async def create_user(body: CreateUser) -> UserOut:
    return await service.create(body)
```

## Don't block the event loop
Bad:
```python
@app.get("/data")
async def get_data():
    return requests.get(url).json()  # sync call blocks the loop
```
Good:
```python
@app.get("/data")
async def get_data():
    async with httpx.AsyncClient(timeout=5) as client:
        r = await client.get(url)
        return r.json()
```

## Scoped DB session
```python
async def get_db():
    async with async_session() as session:
        yield session
```
