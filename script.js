document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.day').forEach(initDay);
    
    loadTasks();
    loadHealthData();
  });
  
  function initDay(dayElement) {
    const showFormButton = dayElement.querySelector('.show-task-form');
    const taskForm = dayElement.querySelector('.task-form');
    const cancelButton = dayElement.querySelector('.cancel-task');
    
    showFormButton.addEventListener('click', function() {
      showFormButton.classList.add('hidden');
      taskForm.classList.remove('hidden');
    });
    
    cancelButton.addEventListener('click', function() {
      taskForm.classList.add('hidden');
      showFormButton.classList.remove('hidden');
      resetForm(dayElement);
    });
    
    dayElement.querySelector('.add-task').addEventListener('click', function() {
      addTask(dayElement);
    });
  }
  
  function resetForm(dayElement) {
    const form = dayElement.querySelector('.task-form');
    form.querySelector('.task-title').value = '';
    form.querySelector('.task-desc').value = '';
    form.querySelector('.task-repeat').value = 'geen';
    form.querySelector('.task-date').value = '';
  }
  
  function addTask(dayElement) {
    const form = dayElement.querySelector('.task-form');
    const title = form.querySelector('.task-title').value.trim();
    const desc = form.querySelector('.task-desc').value.trim();
    const repeat = form.querySelector('.task-repeat').value;
    const date = form.querySelector('.task-date').value;
    const day = dayElement.dataset.day;
    
    if (!title) {
      alert('Voer een taaknaam in');
      return;
    }
    
    if (repeat === 'geen' && !date) {
      alert('Selecteer een datum voor deze taak');
      return;
    }
    
    const task = {
      title: title,
      desc: desc,
      repeat: repeat,
      date: repeat === 'geen' ? date : repeat
    };
    
    displayTask(dayElement, task);
    saveTask(day, task);
    
    resetForm(dayElement);
    form.classList.add('hidden');
    dayElement.querySelector('.show-task-form').classList.remove('hidden');
  }
  
  function displayTask(dayElement, task) {
    const taskList = dayElement.querySelector('.task-list');
    const taskItem = document.createElement('div');
    taskItem.className = 'task-item';
    
    const taskContent = document.createElement('div');
    taskContent.innerHTML = `
      <span class="task-title">${task.title}</span>
      ${task.desc ? `<span class="task-desc"> - ${task.desc}</span>` : ''}
      <span class="task-meta">(${task.date})</span>
    `;
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-task';
    deleteButton.innerHTML = '❌';
    deleteButton.addEventListener('click', function() {
      taskItem.remove();
      removeTask(dayElement.dataset.day, task);
    });
    
    taskItem.appendChild(taskContent);
    taskItem.appendChild(deleteButton);
    taskList.appendChild(taskItem);
  }
  
  function saveTask(day, task) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || {};
    if (!tasks[day]) tasks[day] = [];
    tasks[day].push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }
  
  function removeTask(day, task) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || {};
    if (tasks[day]) {
      tasks[day] = tasks[day].filter(t => 
        t.title !== task.title || 
        t.desc !== task.desc || 
        t.date !== task.date
      );
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }
  
  function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || {};
    Object.keys(tasks).forEach(day => {
      const dayElement = document.querySelector(`.day[data-day="${day}"]`);
      if (dayElement) {
        tasks[day].forEach(task => displayTask(dayElement, task));
      }
    });
  }
  
  function addSteps() {
    const stepInput = document.getElementById('stepInput');
    const steps = parseInt(stepInput.value) || 0;
    let totalSteps = parseInt(localStorage.getItem('totalSteps')) || 0;
    
    if (steps <= 0) {
      alert('Voer een geldig aantal stappen in');
      return;
    }
    
    if (totalSteps >= 10000) {
      alert('Je hebt je stappendoel al bereikt!');
      return;
    }
    
    totalSteps = Math.min(totalSteps + steps, 10000);
    localStorage.setItem('totalSteps', totalSteps);
    updateStepDisplay(totalSteps);
    stepInput.value = '';
  }
  
  function updateStepDisplay(totalSteps) {
    document.getElementById('totalSteps').textContent = totalSteps.toLocaleString();
    
    if (totalSteps >= 10000) {
      document.getElementById('stepComplete').classList.remove('hidden');
      document.getElementById('stepInput').disabled = true;
      document.getElementById('stepButton').disabled = true;
    } else {
      document.getElementById('stepComplete').classList.add('hidden');
      document.getElementById('stepInput').disabled = false;
      document.getElementById('stepButton').disabled = false;
    }
  }
  
  function addWorkout() {
    const durationInput = document.getElementById('workoutDuration');
    const typeSelect = document.getElementById('workoutType');
    
    const duration = parseInt(durationInput.value) || 0;
    const type = typeSelect.value;
    
    if (duration <= 0) {
      alert('Voer een geldige trainingsduur in');
      return;
    }
    
    if (type === '') {
      alert('Selecteer een trainingstype');
      return;
    }
    
    const date = new Date().toISOString().split('T')[0];
    const workout = { 
      date: date, 
      duration: duration, 
      type: type 
    };
    
    const workouts = JSON.parse(localStorage.getItem('workouts')) || [];
    workouts.push(workout);
    localStorage.setItem('workouts', JSON.stringify(workouts));
    
    displayWorkout(workout);
    updateGymStats();
    
    durationInput.value = '';
    typeSelect.selectedIndex = 0;
  }
  
  function displayWorkout(workout) {
    const workoutList = document.getElementById('workoutList');
    const workoutItem = document.createElement('div');
    workoutItem.className = 'workout-entry';
    
    const formattedDate = new Date(workout.date).toLocaleDateString();
    workoutItem.innerHTML = `
      ${workout.type}: ${workout.duration} min (${formattedDate})
      <button class="entry-delete">✕</button>
    `;
    
    workoutItem.querySelector('.entry-delete').addEventListener('click', function() {
      removeWorkout(workout);
      workoutItem.remove();
      updateGymStats();
    });
    
    workoutList.prepend(workoutItem);
  }
  
  function removeWorkout(workout) {
    const workouts = JSON.parse(localStorage.getItem('workouts')) || [];
    const updatedWorkouts = workouts.filter(w => 
      w.date !== workout.date || 
      w.duration !== workout.duration || 
      w.type !== workout.type
    );
    localStorage.setItem('workouts', JSON.stringify(updatedWorkouts));
  }
  
  function addReading() {
    const pagesInput = document.getElementById('pagesRead');
    const pages = parseInt(pagesInput.value) || 0;
    
    if (pages <= 0) {
      alert('Voer een geldig aantal pagina\'s in');
      return;
    }
    
    const date = new Date().toISOString().split('T')[0];
    const reading = {
      date: date,
      pages: pages
    };
    
    const readings = JSON.parse(localStorage.getItem('readings')) || [];
    readings.push(reading);
    localStorage.setItem('readings', JSON.stringify(readings));
    
    displayReading(reading);
    updateBookStats();
    
    pagesInput.value = '';
  }
  
  function displayReading(reading) {
    const readingList = document.getElementById('readingList');
    const readingItem = document.createElement('div');
    readingItem.className = 'reading-entry';
    
    const formattedDate = new Date(reading.date).toLocaleDateString();
    readingItem.innerHTML = `
      ${reading.pages} pagina's (${formattedDate})
      <button class="entry-delete">✕</button>
    `;
    
    readingItem.querySelector('.entry-delete').addEventListener('click', function() {
      removeReading(reading);
      readingItem.remove();
      updateBookStats();
    });
    
    readingList.prepend(readingItem);
  }
  
  function removeReading(reading) {
    const readings = JSON.parse(localStorage.getItem('readings')) || [];
    const updatedReadings = readings.filter(r => 
      r.date !== reading.date || 
      r.pages !== reading.pages
    );
    localStorage.setItem('readings', JSON.stringify(updatedReadings));
  }
  
  function loadHealthData() {
    const totalSteps = parseInt(localStorage.getItem('totalSteps')) || 0;
    updateStepDisplay(totalSteps);
    
    const workouts = JSON.parse(localStorage.getItem('workouts')) || [];
    const workoutList = document.getElementById('workoutList');
    workoutList.innerHTML = '';
    workouts.forEach(workout => displayWorkout(workout));
    updateGymStats();
    
    const readings = JSON.parse(localStorage.getItem('readings')) || [];
    const readingList = document.getElementById('readingList');
    readingList.innerHTML = '';
    readings.forEach(reading => displayReading(reading));
    updateBookStats();
  }
  
  function updateGymStats() {
    const workouts = JSON.parse(localStorage.getItem('workouts')) || [];
    
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
    startOfWeek.setHours(0, 0, 0, 0);
    
    const weekWorkouts = workouts.filter(w => new Date(w.date) >= startOfWeek);
    const weekCount = weekWorkouts.length;
    
    const weekMinutes = weekWorkouts.reduce((total, w) => total + w.duration, 0);
    
    document.getElementById('gymWeekCount').textContent = weekCount;
    document.getElementById('gymWeekMinutes').textContent = weekMinutes;
  }
  
  function updateBookStats() {
    const readings = JSON.parse(localStorage.getItem('readings')) || [];
    
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
    startOfWeek.setHours(0, 0, 0, 0);
    
    const weekReadings = readings.filter(r => new Date(r.date) >= startOfWeek);
    const weekCount = weekReadings.length;
    
    const weekPages = weekReadings.reduce((total, r) => total + r.pages, 0);
    
    document.getElementById('bookWeekCount').textContent = weekCount;
    document.getElementById('bookWeekPages').textContent = weekPages;
  }
  
  function resetDay() {
    const today = new Date().toISOString().split('T')[0];
    const resetTime = localStorage.getItem('lastResetDate');
    
    if (resetTime !== today) {
      localStorage.setItem('totalSteps', '0');
      localStorage.setItem('lastResetDate', today);
      updateStepDisplay(0);
    }
  }
  
  resetDay();