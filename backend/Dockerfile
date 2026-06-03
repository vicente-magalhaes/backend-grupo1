# Use an official Python base image
FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /app

# Install dependencies required by dbbasicapi.py
# psycopg2-binary is used to avoid compiling psycopg2 from source on slim images
RUN pip install --no-cache-dir fastapi uvicorn pydantic psycopg2-binary

# Copy the backend source code into the container
COPY . /app

# Expose the port the backend API runs on
EXPOSE 8000

# Start the FastAPI application using Uvicorn when the container launches
CMD ["uvicorn", "dbbasicapi:app", "--host", "0.0.0.0", "--port", "8000"]