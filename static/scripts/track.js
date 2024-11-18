



function removeRow() {
    const button = event.target.closest('button');
    const row = button.closest('tr'); // row containing exercise
    const nextRow = row.nextElementSibling; // row containing "add set" button
    nextRow.remove();
    row.remove();
}


function addRow() {
    // Get the table body to insert new rows
    const tbody = document.querySelector('.workout-log tbody');

    // Create new row for the exercise
    const exerciseRow = document.createElement('tr');
    exerciseRow.innerHTML = `
        <td><input type="text" class="exercise-name" placeholder="Exercise Name"></td>
        <td>
            <ul>
                <li><input class="reps" type="text" placeholder="Log"></li>
            </ul>
        </td>
        <td>
            <ul>
                <li><input class="weight" type="text" placeholder="Log"></li>
            </ul>
        </td>
        <td style="padding: 0px;">
            <button onclick="removeRow(this)" class="error"><img src="/static/images/delete.svg"></button>
        </td>
    `;

    // Create the "Add Set" row
    const addSetRow = document.createElement('tr');
    addSetRow.innerHTML = `
        <td></td>
        <td class="add-set" colspan="2" style="text-align: center; padding: 0; margin: 0;">
            <button onclick="addSet(this)" style="font-size: 12px; padding: 5px; margin: 0;">
                Add Set
                <img src="/static/images/add.svg">
            </button>
        </td>
        <td></td>
    `;

    // Append the exercise and add set rows to the table
    tbody.appendChild(exerciseRow);
    tbody.appendChild(addSetRow);
}

function addSet(button) {
    // Get the parent row of the "Add Set" button
    const row = button.closest('tr');

    // Find the exercise row above it
    const exerciseRow = row.previousElementSibling;

    // Find the <ul> elements for reps and weight
    const repsList = exerciseRow.querySelector('td:nth-child(2) ul');
    const weightList = exerciseRow.querySelector('td:nth-child(3) ul');

    // Add a new <li> to both the reps and weight lists
    const newRepsItem = document.createElement('li');
    newRepsItem.innerHTML = '<input class="reps" type="text" placeholder="Log">';
    repsList.appendChild(newRepsItem);

    const newWeightItem = document.createElement('li');
    newWeightItem.innerHTML = '<input class="weight" type="text" placeholder="Log">';
    weightList.appendChild(newWeightItem);
}

function finishWorkout() {
    const unformattedDate = new Date(document.querySelector('.day').textContent);
    const year = unformattedDate.getFullYear();
    const month = String(unformattedDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(unformattedDate.getDate()).padStart(2, '0');
    const date = `${year}-${month}-${day}`
    

    const rows = document.querySelectorAll('.workout-log tbody tr'); // Get all the rows with exercises

    let workoutData = {};

    rows.forEach(row => {
        const exercise = row.querySelector('td:first-child')?.textContent; // Get exercise name
        const reps = row.querySelectorAll('.reps'); // Get all the reps input elements in the row
        const weights = row.querySelectorAll('.weight'); // Get all the weight input elements in the row

        if (exercise) {
            if (!workoutData[exercise]) {
                workoutData[exercise] = [];
            }

            // Iterate over the number of sets (reps and weights)
            for (let i = 0; i < reps.length; i++) {
                const rep = reps[i].value;
                const weight = weights[i].value;

                console.log(rep);

                if (rep && weight) {
                    workoutData[exercise].push([rep, weight]);
                }
            }
        }
    });

    // Send data to the Flask server
    fetch('/save_workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            date,
            workout: workoutData
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Workout saved successfully!');
        }
    })
    .catch(error => console.error('Error:', error));
}
