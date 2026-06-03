# Use an official Python base image
FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /app

# Install dependencies required by dbbasicapp.py
RUN pip install --no-cache-dir streamlit requests pandas plotly

# Copy the frontend source code into the container
COPY . /app

# Expose the default Streamlit port
EXPOSE 8501

# Start the Streamlit application when the container runs
CMD ["streamlit", "run", "dbbasicapp.py", "--server.port=8501", "--server.address=0.0.0.0"]