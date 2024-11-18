from flask import Flask, render_template, request, redirect, jsonify, send_from_directory
import sqlite3

app = Flask(__name__)



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
                        program_name TEXT,
                        exercise TEXT
                      )''')
    conn.commit()
    conn.close()

init_db()

@app.route('/<filename>')
def serve_file(filename):
    return send_from_directory('static', filename)

# Route to render the workout page
@app.route('/')
def index():
    return render_template('track.html')

@app.route('/track')
def track():
    return render_template('track.html')


@app.route('/program')
def program():
    return render_template('program.html')



@app.route('/history')
def history():
    return render_template('history.html')



@app.route('/personal')
def personal():
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



if __name__ == '__main__':
    init_db()
    app.run(debug=True)