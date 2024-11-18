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



@app.route('/get_workout_log', methods=['GET'])
def get_workout_log():
    date = request.args.get('date')
    print(date)
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
    print(workout_data)
    conn.close()

    return jsonify(workout_data)




if __name__ == '__main__':
    init_db()
    app.run(debug=True)