import streamlit as st
import requests
import pandas as pd
import plotly.express as px

# IMPORTANT: In Docker, we use the service name 'backend' defined in compose
# If running standalone, this might need to be 'localhost'
API_URL = "http://backend:8000"
#API_URL = "http://localhost:8000"

st.title("Data Dashboard")
st.write("Fetching status from Backend...")

try:
    response = requests.get(f"{API_URL}/")
    if response.status_code == 200:
        data = response.json()
        st.success(f"Backend Status: {data['message']}")
        st.info(f"Database Connection: {data['db_status']}")
    else:
        st.error("Failed to connect to backend API")
except Exception as e:
    st.error(f"Connection Error: {e}")
    st.warning("Ensure both containers are in the same Docker network.")

# Example Visualization using the required libs
df = pd.DataFrame({
    "x": [1, 2, 3, 4],
    "y": [10, 11, 12, 13]
})
fig = px.line(df, x="x", y="y", title="Sample Plotly Chart")
st.plotly_chart(fig)