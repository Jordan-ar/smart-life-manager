# smart-life-manager
Smart Life Manager is a web application that generates personalized workout plans based on user goals, fitness level, and time availability. 
It includes a dynamic onboarding process, a weekly calendar with pre-built routines, and progress tracking features.

Features:
Google OAuth login
Dynamic onboarding questionnaire
Three fitness goals: lose weight, gain muscle, stay healthy
Routine options for 15, 30, or 60 minutes
7-day training cycles with adjustable frequency

Setup Instructions:

Create and activate a virtual environment:
python3 -m venv venv
source venv/bin/activate       # On Windows: venv\Scripts\activate.bat

Install dependencies:
pip install -r requirements.txt

Run the application:
python app.py

Then open http://127.0.0.1:5000 in your browser.

Notes:
All routines are defined in calendar.js.
Session handling uses Flask-Session with filesystem backend.
SQLite is used for storing user progress data.
Onboarding must be completed before accessing the calendar.

Authors:
Capstone project developed by:
Jordan (jm267037@my.stchas.edu) - Project Manager
Tomas (tc285904@my.stchas.edu) - Developer
Manuela (mp272593@my.stchas.edu) - Developer
