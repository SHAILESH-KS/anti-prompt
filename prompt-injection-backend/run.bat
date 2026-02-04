@echo off

echo Starting Prompt Injection Backend API...
echo API will be available at: http://localhost:8000
echo API documentation at: http://localhost:8000/docs
echo.

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install/update dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Run the server
echo Starting server...
python src/main.py