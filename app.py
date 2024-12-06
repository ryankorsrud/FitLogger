from flask import Flask, render_template, request, redirect, jsonify, send_from_directory, session  # type: ignore
from werkzeug.security import generate_password_hash, check_password_hash  # type: ignore
import sqlite3

app = Flask(__name__)
#setting a secret key for session management
app.secret_key = 'your_secret_key'  
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
    
    #checking if email id alreasy exists
    cursor.execute("PRAGMA table_info(users)")
    columns = [column[1] for column in cursor.fetchall()]
    if "email" not in columns:
        cursor.execute('ALTER TABLE users ADD COLUMN email TEXT') 
    
    conn.commit()
    conn.close()

init_db()

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        email = request.form['email']
        
        #encryptimg password
        hashed_password = generate_password_hash(password)
        
        conn = sqlite3.connect('workouts.db')
        cursor = conn.cursor()

        cursor.execute('SELECT id FROM users WHERE username = ? OR email = ?', (username, email))
        if cursor.fetchone():
            conn.close()
            return 'Username or email already exists', 400

        
        cursor.execute('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', 
                       (username, hashed_password, email))
        conn.commit()
        conn.close()
        return redirect('/login')  
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
            #setting a session variable for the logged-in user
            session['username'] = username
            return redirect('/')  
        else:
            conn.close()
            return 'Invalid username or password', 400

    return render_template('login.html')

@app.route('/logout')
def logout():
    # clearing session
    session.pop('username', None)
    return redirect('/login')

@app.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'POST':
        username = request.form['username']
        new_password = request.form['new_password']
        
        conn = sqlite3.connect('workouts.db')
        cursor = conn.cursor()
        
        #check if username already exists 
        cursor.execute('SELECT id FROM users WHERE username = ?', (username,))
        user = cursor.fetchone()
        if user:
            #if exists, then hash the passowrd
            hashed_password = generate_password_hash(new_password)
            #and updates passsword
            cursor.execute('UPDATE users SET password = ? WHERE username = ?', (hashed_password, username))
            conn.commit()
            conn.close()
            return 'Password updated successfully! <a href="/login">Login here</a>'
        else:
            conn.close()
            return 'Username does not exist', 400
    
    return render_template('forgot_password.html')



@app.route('/<filename>')
def serve_file(filename):
    return send_from_directory('static', filename)


@app.route('/')
def index():
    if 'username' not in session:
        return redirect('/login')  
    return render_template('track.html', username=session['username'])

@app.route('/track')
def track():
    if 'username' not in session:
        return redirect('/login')  
    return render_template('track.html', username=session['username'])

@app.route('/program')
def program():
    if 'username' not in session:
        return redirect('/login')  
    return render_template('program.html', username=session['username'])

@app.route('/history')
def history():
    if 'username' not in session:
        return redirect('/login')  
    return render_template('history.html', username=session['username'])

@app.route('/personal')
def personal():
    if 'username' not in session:
        return redirect('/login')  
    return render_template('personal.html', username=session['username'])

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

    
    conn = sqlite3.connect('workouts.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT exercise, reps, weight FROM workout WHERE date = ?', (date,))
    rows = cursor.fetchall()

    
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
