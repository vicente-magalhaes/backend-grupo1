from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

# Inicializa a aplicação FastAPI
app = FastAPI(title="API de Vendedores")

# Define o modelo de dados exigido no roteiro
class Seller(BaseModel):
    id: int
    seller_name: str
    marketplace: str
    monthly_sales: float

# "Banco de dados" em memória simulando as informações
SELLERS_DB = [
    Seller(id=1, seller_name="Seller 1", marketplace="Mercado Livre", monthly_sales=106880.0),
    Seller(id=2, seller_name="Seller 2", marketplace="Amazon", monthly_sales=25086.5)
]

# Cria o endpoint (a rota) que o frontend vai acessar para pegar os dados
@app.get("/sellers", response_model=List[Seller])
def get_sellers():
    return SELLERS_DB