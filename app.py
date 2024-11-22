from flask import Flask, render_template, request, redirect, jsonify, send_from_directory, session
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Set a secret key for session management

def init_db():
    conn = sqlite3.connect('workouts.db')
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS workout (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        date TEXT,
                        exercise TEXT,
                        reps TEXT,
                        weight TEXT
                      )''')
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS program (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        day TEXT,
                        program TEXT,
                        UNIQUE(day, program)
                      )''')
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username TEXT UNIQUE,
                        password TEXT
                      )''')
    conn.commit()
    conn.close()

init_db()

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        # Hash the password
        hashed_password = generate_password_hash(password)
        
        conn = sqlite3.connect('workouts.db')
        cursor = conn.cursor()

        # Insert the new user into the database
        try:
            cursor.execute('INSERT INTO users (username, password) VALUES (?, ?)', (username, hashed_password))
            conn.commit()
            conn.close()
            return redirect('/login')  # Redirect to login page after successful sign-up
        except sqlite3.IntegrityError:
            conn.close()
            return 'Username already exists', 400
    return render_template('signup.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        conn = sqlite3.connect('workouts.db')
        cursor = conn.cursor()
        cursor.execute('SELECT password FROM users WHERE username = ?', (username,))
        stored_password = cursor.fetchone()

        if stored_password and check_password_hash(stored_password[0], password):
            # Set a session variable for the logged-in user
            session['username'] = username
            return redirect('/')  # Redirect to home page after successful login
        else:
            conn.close()
            return 'Invalid username or password', 400

    return render_template('login.html')

@app.route('/logout')
def logout():
    # Clear the session and redirect to login page
    session.pop('username', None)
    return redirect('/login')




@app.route('/<filename>')
def serve_file(filename):
    return send_from_directory('static', filename)

# Route to render the workout page
@app.route('/')
def index():
    if 'username' not in session:
        return redirect('/login')  # Redirect to login page if not logged in
    return render_template('track.html')

@app.route('/track')
def track():
    if 'username' not in session:
        return redirect('/login')  # Redirect to login page if not logged in
    return render_template('track.html')

@app.route('/program')
def program():
    if 'username' not in session:
        return redirect('/login')  # Redirect to login page if not logged in
    return render_template('program.html')

@app.route('/history')
def history():
    if 'username' not in session:
        return redirect('/login')  # Redirect to login page if not logged in
    return render_template('history.html')

@app.route('/personal')
def personal():
    if 'username' not in session:
        return redirect('/login')  # Redirect to login page if not logged in
    return render_template('personal.html')

@app.route('/save_workout', methods=['POST'])
def save_workout():
    data = request.json
    date = data.get('date')
    workout = data.get('workout')

    conn = sqlite3.connect('workouts.db')
    cursor = conn.cursor()

    for exercise in workout:
        for set in workout[exercise]:
            reps = set[0]
            weight = set[1]
            cursor.execute('INSERT INTO workout (date, exercise, reps, weight) VALUES (?, ?, ?, ?)', (date, exercise, reps, weight))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})

@app.route('/get_workout_log', methods=['GET'])
def get_workout_log():
    date = request.args.get('date')
    if not date:
        return jsonify({'status': 'error', 'message': 'No date provided'}), 400

    # Fetch workout data for the provided date
    conn = sqlite3.connect('workouts.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT exercise, reps, weight FROM workout WHERE date = ?', (date,))
    rows = cursor.fetchall()

    # Organize the data in a format similar to how it's saved
    workout_data = {}
    for row in rows:
        exercise, reps, weight = row
        if exercise not in workout_data:
            workout_data[exercise] = [[], []]
        workout_data[exercise][0].append(reps)
        workout_data[exercise][1].append(weight)
    conn.close()

    return jsonify(workout_data)

@app.route('/save_program', methods=['POST'])
def save_program():
    data = request.json
    day = data.get('day')
    exercises = data.get('program')

    conn = sqlite3.connect('workouts.db')
    cursor = conn.cursor()

    for exercise in exercises:
        cursor.execute('INSERT INTO program (day, program) VALUES (?, ?) ON CONFLICT(day, program) DO NOTHING', (day, exercise))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})

@app.route('/get_program_day', methods=['GET'])
def get_program_day():
    day = request.args.get('day')
    if not day:
        return jsonify({'status': 'error', 'message': 'No day provided'}), 400

    conn = sqlite3.connect('workouts.db')
    cursor = conn.cursor()
    cursor.execute('SELECT program FROM program WHERE day = ?', (day,))
    data = cursor.fetchall()

    exercises = [val[0] for val in data]
    conn.close()

    return jsonify(exercises)

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
