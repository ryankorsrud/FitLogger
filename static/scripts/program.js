let programs = [];
let currentProgramIndex = 0;

function addExercise(){
    const program = document.querySelector('.program ul');
    const newListItem = document.createElement('li');
    newListItem.innerHTML =  `
        <input type="text" placeholder="Exercise"><button onclick="removeExercise()" class="error"><img src="/static/images/delete.svg"></button>
    `

    program.append(newListItem);
}

function removeExercise(){
    const button = event.target.closest('button');
    const listItem = button.closest('li');
    listItem.remove();
}

function newProgram(){
    const program = document.getElementById('program');
    program.innerHTML = ''
    program.innerHTML += `<div class="day">
                            <button onclick = "lastProgram()">
                                <img src="/static/images/arrow.svg">
                            </button>
                            <span><input type="text" placeholder="Title of Day (eg. Monday)"></span>
                            <button onclick = "nextProgram()">
                                <img src="/static/images/arrow.svg" style="transform: rotate(180deg)">
                            </button>
                        </div>
                        <ul>
                            <li><input type="text" placeholder="Exercise"><button onclick="removeExercise()" class="error"><img src="/static/images/delete.svg"></button></li>
                        </ul>
                        
                        <button onclick="addExercise()">Add Exercise</button>
                        `;
}

function saveProgram(){
    const day = document.querySelector('.day span input')?
                document.querySelector('.day span input').value:
                document.querySelector('.day span').textContent;
    const exercises = document.querySelectorAll('.program ul li');
    console.log(exercises);
    let programData = [];
    exercises.forEach(exercise => {
        const exerciseName = exercise ? (exercise.querySelector('input') ? exercise.querySelector('input').value : exercise.textContent.trim()) : undefined;
        if (exerciseName){
            programData.push(exerciseName);
        }
    });

    fetch(`/get_program_day?day=${day}`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
    }) 
    .then(response => response.json())
    .then(existingData => {
        const existingExercises = existingData || [];
 
        const exercisesToDelete = existingExercises.filter(exercise => !programData.includes(exercise));
        console.log(exercisesToDelete);
        fetch('/save_program', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                day,
                program: programData,
                deleteExercises: exercisesToDelete
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success'){
                alert('Workout saved successfully!');
            }
        })
        .catch(error => console.error('Error:', error));
        
    })
}

//Shoule be nextDay
function nextProgram(){
    currentProgramIndex = (currentProgramIndex + 1) % programs.length;
    renderProgram();
}

//Shoule be lastDay
function lastProgram(){
    currentProgramIndex = (currentProgramIndex - 1 + programs.length) % programs.length;
    renderProgram();
}

//Should be renderDay
// This refreshes the box containing program, pulling from programs to fill the name of day and exercises
function renderProgram(){
    const program = programs[currentProgramIndex];
    const programContainer = document.getElementById('program');
    if (program == undefined) {
        programContainer.innerHTML =    
            `<div>
            <p>No existing days(set of workout) within this program.</p><p>Add a new day with the New Day button</p>
            </div>`
    } else {
        programContainer.innerHTML = `
            <div class="day">
                <button onclick="lastProgram()">
                    <img src="/static/images/arrow.svg">
                </button>
                <span>${program}</span>
                <button onclick="nextProgram()">
                    <img src="/static/images/arrow.svg" style="transform: rotate(180deg)">
                </button>
            </div>

            <div>
                <ul>

                </ul>
            </div>
            <button onclick="addExercise()">Add Exercise</button>`;
        fetch(`/get_program_day?day=${program}`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        }) 
        .then(response => response.json())
        .then(toList => {
            const exercisesInDayX = toList;
            const p_ul = document.querySelector('.program ul');
            console.log(toList);
                for(exercises in exercisesInDayX){
                    const newListItem = document.createElement('li');
                    newListItem.innerHTML = `<li>${exercisesInDayX[exercises]}<button onclick="removeExercise()" class="error"><img src="/static/images/delete.svg"></li>`;
                    p_ul.append(newListItem);
                }
        });
    }
}

function alertHelp(){
    alert("Days represents sets of workouts done in the same day of a program.\nYou can add an exercise to an existing day/workout set or remove them with the red trash can button. \nEmpty fields will not be saved.\nIf all workouts in a day/set are deleted, the day will be deleted too.");
}

function listOfDays(callback){
    fetch(`/get_list_of_days`, {
        method: 'GET',
        headers: {'Content-Type':'application/json'},
    }) 
    .then(response => response.json())
    .then(daysList => {
        const YINT = daysList.map((day) => day[0]);
        programs = YINT;
    })
    return new Promise(resolve => {
        setTimeout(() => {
            console.log('list of days completed');
            resolve();
        }, 50);  // Simulate delay
    });
}

function cycleProgram(){
    const program = document.querySelector('.top');
    program.innerHTML = `
    <button onclick="refreshPg()">
        <img src="/static/images/arrow.svg">
    </button>
    <span>Program: Just Upper Body</span>
    <button onclick="refreshPg()">
        <img src="/static/images/arrow.svg" style="transform: rotate(180deg)">
    </button>`
    const day = document.getElementById('program');
    day.innerHTML = `
    <div class="day">
                <button onclick="">
                    <img src="/static/images/arrow.svg">
                </button>
                <span>Upper Body</span>
                <button onclick="">
                    <img src="/static/images/arrow.svg" style="transform: rotate(180deg)">
                </button>
            </div>

            <div>
                <ul>
                <li>Behcn Press<button onclick="removeExercise()" class="error"><img src="/static/images/delete.svg"></li>
                <li>Curls<button onclick="removeExercise()" class="error"><img src="/static/images/delete.svg"></li>
                <li>Shoulder Raises<button onclick="removeExercise()" class="error"><img src="/static/images/delete.svg"></li>
                <li>Lateral Pulldowns<button onclick="removeExercise()" class="error"><img src="/static/images/delete.svg"></li>
                </ul>
            </div>
            <button onclick="addExercise()">Add Exercise</button>`
    const buttonChange = document.getElementById('selector');
    buttonChange.innerHTML = `
                <button class="selector-btn" style="color: #10a37f;">
                    Select Program
                    <img class="new" style="filter: invert(45%) sepia(91%) saturate(398%) hue-rotate(115deg) brightness(94%) contrast(93%);" src="/static/images/Sq_blank.svg.png">
                </button>
                <button class="selector-btn" style="color: #10a37f;">
                    New Program
                    <img class="new" style="filter: invert(45%) sepia(91%) saturate(398%) hue-rotate(115deg) brightness(94%) contrast(93%);" src="/static/images/Sq_blank.svg.png">
                </button>`
    document.querySelector('.edit-program').innerHTML = `
                <button onclick="newProgram()" class="edit-program-btn">
                    New Day
                    <img class="add" src="/static/images/new.svg">
                </button>
                <button onclick="fauxSave()" class="edit-program-btn" style="color: #10a37f;">
                    Save Program
                    <img class="new" style="filter: invert(45%) sepia(91%) saturate(398%) hue-rotate(115deg) brightness(94%) contrast(93%);" src="/static/images/check.svg">
                </button>`
}

function refreshPg(){
    location.reload();
}

function fauxSave(){
    alert('Workout saved successfully!');
}

document.addEventListener('DOMContentLoaded', async () => {
    await listOfDays();
    renderProgram();
});
