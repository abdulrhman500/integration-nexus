
.PHONY: help start-backend start-frontend install

help:
	@echo "----------------------------------------------------"
	@echo " Assessment Helper Commands"
	@echo "----------------------------------------------------"
	@echo " make install         - Installs all dependencies"
	@echo " make start-backend   - Starts the Python backend server"
	@echo " make start-frontend  - Starts the React frontend server"
	@echo "----------------------------------------------------"

install:
	@echo "--> Installing backend dependencies..."
	pip install -r backend/requirements.txt
	@echo "--> Installing frontend dependencies..."
	(cd frontend && npm install)
	@echo "--> Installation complete!"

start-backend:
	@echo "--> Starting backend
	(cd backend && uvicorn main:app --reload)

start-frontend:
	@echo "--> Starting frontend
	(cd frontend && npm start)