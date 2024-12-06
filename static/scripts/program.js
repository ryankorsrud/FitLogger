let programs = [
    {
        name: "Legs",
        exercises: [
            "RDL",
            "Squats",
            "Leg Extensions",
            "Leg Curls",
            "Calf Raises",
        ],
    },
    {
        name: "Upper",
        exercises: [
            "Curls",
            "Bench Press",
            "Triceps",
            "Shoulders",
        ],
    },
    {
        name: "Back",
        exercises: [
            "Deadlifts",
            "Lateral Pulldown",
        ]
    }
];
let currentProgramIndex = 0
window.programs = programs;
window.currentProgramIndex = currentProgramIndex;

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

    if (!programs.some(i => i.name == day)) {
        programs.push({
            name: day,
            exercises: programData
            });
        console.log("done");
        console.log(programs);
    } else {
        programs[currentProgramIndex].exercises = programData;
    }

    console.log(programs);

    fetch('/save_program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            day,
            program: programData
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success'){
            alert('Workout saved successfully!');
        }
    })
    .catch(error => console.error('Error:', error));
}

function nextProgram(){
    currentProgramIndex = (currentProgramIndex + 1) % programs.length;
    renderProgram();
}


function lastProgram(){
    currentProgramIndex = (currentProgramIndex - 1 + programs.length) % programs.length;
    renderProgram();
}

// This refreshes the box containing program, pulling from programs to fill the name of day and exercises
function renderProgram(){
    const program = programs[currentProgramIndex];
    const programContainer = document.getElementById('program');
    console.log(currentProgramIndex);
    programContainer.innerHTML = `
                <div class="day">
                    <button onclick="lastProgram()">
                        <img src="/static/images/arrow.svg">
                    </button>
                    <span>${program.name}</span>
                    <button onclick="nextProgram()">
                        <img src="/static/images/arrow.svg" style="transform: rotate(180deg)">
                    </button>
                </div>

                <ul>
                    ${program.exercises.map(exercise => 
                        `<li>${exercise}<button onclick="removeExercise()" class="error"><img src="/static/images/delete.svg"></button></li>`
                    ).join('')}
                </ul>
                <button onclick="addExercise()">Add Exercise</button>
            
    `;
}

document.addEventListener('DOMContentLoaded', () => {renderProgram();});