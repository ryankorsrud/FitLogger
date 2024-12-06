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
    const day = document.querySelector('.day span input').value;
    const exercises = document.querySelectorAll('.program ul li');
    console.log(exercises);
    let programData = [];
    exercises.forEach(exercise => {
        const exerciseName = exercise ? (exercise.querySelector('input') ? exercise.querySelector('input').value : exercise.textContent.trim()) : undefined;
        if (exerciseName){
            programData.push(exerciseName);
        }
    });

    //console.log(program);
    console.log(day.value)
    console.log(day)
    fetch('/get_program_day?day=${day}', {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
    }) 
    .then(response => response.json())
    .then(existingData => {
        console.log(existingData);
        const existingExercises = existingData.program || [];
        const exercisesToDelete = existingExercises.filter(exercise => !programData.includes(exercise));
    


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
        console.log(existingData);
    })
} 
