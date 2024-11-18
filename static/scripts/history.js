function showWorkoutLog() {
    const workoutDate = document.getElementById('workout-date').value;
    const workoutDisplay = document.getElementById('workout-display');

    if (!workoutDate) {
        workoutDisplay.innerHTML = 'Please select a date to view the workout log.';
        return;
    }

    // Clear the previous workout log and show loading text
    workoutDisplay.innerHTML = 'Loading...';

    // Fetch workout data from the server
    fetch(`/get_workout_log?date=${workoutDate}`)
        .then(response => response.json())
        .then(data => {
            // Check if the data is empty
            if (Object.keys(data).length === 0) {
                workoutDisplay.innerHTML = `No workout found for ${workoutDate}.`;
                return;
            }

            console.log(data);

            // Create the workout log table
            let workoutHTML = ``;
            workoutHTML += `<table class="workout-log">
                                <thead>
                                    <tr>
                                        <th>Exercise</th>
                                        <th>Reps</th>
                                        <th>Weight (lbs)</th>
                                    </tr>
                                </thead>
                                <tbody>`;

            // Loop through the workout data and add rows to the table
            for (let exercise in data) {
                workoutHTML += "<tr><td>" + exercise + "</td><td><ul>"
                console.log(data[exercise]);
                data[exercise][0].forEach((set) =>
                    workoutHTML += "<li>" + String(set) + "</li>"
                )
                workoutHTML += "</ul></td><td><ul>"
                data[exercise][1].forEach((set) =>
                    workoutHTML += "<li>" + String(set) + "</li>"
                )
                workoutHTML += "</ul></td><tr>"
            }

            workoutHTML += `</tbody></table>`;
            workoutDisplay.innerHTML = workoutHTML;
        })
        .catch(error => {
            console.log()
            workoutDisplay.innerHTML = 'Error fetching workout data. Please try again later.';
        });
}


