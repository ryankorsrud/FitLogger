function removeRow() {
    const button = event.target.closest('button');
    const row = button.closest('tr'); // row containing exercise
    const nextRow = row.nextElementSibling; // row containing "add set" button
    nextRow.remove();
    row.remove();
}


function addRow() {
    const tbody = document.querySelector('.workout-log tbody');

    const exerciseRow = document.createElement('tr');
    exerciseRow.innerHTML = `
        <td style="display: flex; justify-content: center;"><input style="width: 100%;" type="text" class="exercise-name" placeholder="Exercise"></td>
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

    tbody.appendChild(exerciseRow);
    tbody.appendChild(addSetRow);
}

function addSet(button) {
    const row = button.closest('tr');
    const exerciseRow = row.previousElementSibling;
    const repsList = exerciseRow.querySelector('td:nth-child(2) ul');
    const weightList = exerciseRow.querySelector('td:nth-child(3) ul');

    const newRepsItem = document.createElement('li');
    newRepsItem.innerHTML = '<input class="reps" type="text" placeholder="Log">';
    repsList.appendChild(newRepsItem);

    const newWeightItem = document.createElement('li');
    newWeightItem.innerHTML = '<input class="weight" type="text" placeholder="Log">';
    weightList.appendChild(newWeightItem);
}

function finishWorkout() {
    const unformattedDate = new Date(document.querySelector('.day span').textContent);
    
    const year = unformattedDate.getFullYear();
    const month = String(unformattedDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(unformattedDate.getDate()).padStart(2, '0');
    const date = `${year}-${month}-${day}`
    console.log(date);

    const rows = document.querySelectorAll('.workout-log tbody tr'); // Get all the rows with exercises

    let workoutData = {};

    rows.forEach(row => {
        // Gets the cell with the exercise name and handles the case where the name is inside an input box or inside the td
        const cell = row.querySelector('td:first-child');
        const exercise = cell
        ? cell.querySelector('input') 
        ? cell.querySelector('input').value 
        : cell.textContent.trim()
        : undefined;

        const reps = row.querySelectorAll('.reps');
        const weights = row.querySelectorAll('.weight');

        if (exercise) {
            if (!workoutData[exercise]) {
                workoutData[exercise] = [];
            }

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



function setProgramDay(){
    const day = document.getElementById('selected-day').value;
    const workoutLog = document.querySelector('.workout-log tbody');

    if (!day){
        return;
    }

    fetch(`/get_program_day?day=${day}`)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                return;
            }


            console.log(data);
            data.forEach(exercise => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${exercise}</td>
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
                    </td>`;


                workoutLog.appendChild(row);


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
                workoutLog.appendChild(addSetRow);
            });
        }
        )
}