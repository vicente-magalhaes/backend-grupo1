import streamlit as st
import requests
import pandas as pd

# Configuração da página
st.set_page_config(page_title="Dashboard de Vendedores", layout="wide")

st.title("📊 Dashboard de Vendedores - Lab 5")
st.markdown("Este frontend consome dados da **API FastAPI** em tempo real.")

# Botão para buscar dados no Backend
if st.button("🔄 Atualizar Dados do Backend"):
    try:
        # Fazendo a requisição para o servidor FastAPI
        response = requests.get("http://127.0.0.1:8000/sellers")
        
        if response.status_code == 200:
            data = response.json()
            df = pd.DataFrame(data)
            
            # Exibe os dados em uma tabela
            st.subheader("Lista de Vendedores")
            st.dataframe(df, use_container_width=True)
            
            # Exibe uma métrica de exemplo
            total_vendas = df['monthly_sales'].sum()
            st.metric("Vendas Totais", f"R$ {total_vendas:,.2f}")
            
            st.success("Dados recuperados com sucesso!")
        else:
            st.error(f"Erro na API: Status {response.status_code}")
    except Exception as e:
        st.error(f"O Backend está rodando? Certifique-se de que o Terminal 1 está ativo. Erro: {e}")