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
        const whyIneedThis = existingExercises.map((exercise) => {
            return exercise[0];
        });
 
        const exercisesToDelete = whyIneedThis.filter(exercise => !programData.includes(exercise));
        console.log(whyIneedThis);
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

function nextProgram(){
    currentProgramIndex = (currentProgramIndex + 1) % programs.length;
    renderProgram();
}


function lastProgram(){
    currentProgramIndex = (currentProgramIndex - 1 + programs.length) % programs.length;
    renderProgram();
}

function renderProgram(){
    const program = programs[currentProgramIndex];
    const programContainer = document.getElementById('program');
    if (program == undefined) {
        programContainer.innerHTML =    
            `<div>
            <span>No Existing Workout Programs Make a new one with the New Program button</span>
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
        const exercisesInDayX = toList.map((exercise) => exercise[0]);
        const p_ul = document.querySelector('.program ul');
            for(exercises in exercisesInDayX){
                const newListItem = document.createElement('li');
                newListItem.innerHTML = `<li>${exercisesInDayX[exercises]}<button onclick="removeExercise()" class="error"><img src="/static/images/delete.svg"></li>`;
                p_ul.append(newListItem);
            }
    });
    }
    
}

function newProgram(){
    const program = document.getElementById('program');
    program.innerHTML = ''
    program.innerHTML += `<div class="day">
                            <button onclick = "lastProgram()">
                                <img src="/static/images/arrow.svg">
                            </button>
                            <span><input type="text" placeholder="Program Name"></span>
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

document.addEventListener('DOMContentLoaded', async () => {
    await listOfDays();
    renderProgram();
});

