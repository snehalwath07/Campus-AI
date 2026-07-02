FROM python:3.11-slim

WORKDIR /app

# Install dependencies first for caching layers
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

EXPOSE 8000

# Execute server runner
CMD ["python", "main.py"]
