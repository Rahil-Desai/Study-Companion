function saveUser(email, password) {
    const users = JSON.parse(localStorage.getItem('users')) || {};
    users[email] = password;
    localStorage.setItem('users', JSON.stringify(users));
}

function getUser(email) {
    const users = JSON.parse(localStorage.getItem('users')) || {};
    return users[email];
}

function setCurrentUser(email) {
    localStorage.setItem('currentUser', email);
}

function getCurrentUser() {
    return localStorage.getItem('currentUser');
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function checkAuth() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'index.html';
    }
    return currentUser;
}

// Dark Mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

function loadDarkMode() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
}

// Timer functionality
let timeLeft = 1500;
let timerId = null;

function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timer').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

document.getElementById('startTimer').addEventListener('click', function() {
    if (timerId === null) {
        timerId = setInterval(() => {
            timeLeft--;
            updateTimer();
            if (timeLeft === 0) {
                clearInterval(timerId);
                timerId = null;
                alert('Time is up! Take a break.');
            }
        }, 1000);
        this.textContent = 'Pause';
    } else {
        clearInterval(timerId);
        timerId = null;
        this.textContent = 'Start';
    }
});

document.getElementById('resetTimer').addEventListener('click', function() {
    clearInterval(timerId);
    timerId = null;
    timeLeft = 1500;
    updateTimer();
    document.getElementById('startTimer').textContent = 'Start';
});

// Todo list functionality
document.getElementById('addTodo').addEventListener('click', function() {
    const input = document.getElementById('todoInput');
    const todoText = input.value.trim();
    if (todoText) {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${todoText}</span>
            <button class="btn btn-danger deleteTodo">×</button>
        `;
        document.getElementById('todoList').appendChild(li);
        input.value = '';
    }
});

document.getElementById('todoList').addEventListener('click', function(e) {
    if (e.target.classList.contains('deleteTodo')) {
        e.target.parentElement.remove();
    }
});

// Flashcard functionality
let flashcards = [];
let currentIndex = 0;
let isShowingFront = true;
let studiedToday = new Set();
let filteredCards = [];

function initializeFlashcards() {
    const saved = localStorage.getItem('flashcards');
    if (saved) {
        flashcards = JSON.parse(saved);
        filteredCards = [...flashcards];
    }
    const savedStudied = localStorage.getItem('studiedToday');
    if (savedStudied) {
        studiedToday = new Set(JSON.parse(savedStudied));
    }
    updateDisplay();
    updateCategoryFilters();
}

function addFlashcard() {
    const front = document.getElementById('frontInput').value.trim();
    const back = document.getElementById('backInput').value.trim();
    const category = document.getElementById('categoryInput').value.trim();
    if (front && back) {
        flashcards.push({ front, back, category });
        localStorage.setItem('flashcards', JSON.stringify(flashcards));
        document.getElementById('frontInput').value = '';
        document.getElementById('backInput').value = '';
        document.getElementById('categoryInput').value = '';
        filteredCards = [...flashcards];
        updateDisplay();
        updateCategoryFilters();
    }
}

function updateDisplay() {
    const display = document.getElementById('cardDisplay');
    const countDisplay = document.getElementById('cardCount');
    const statsDisplay = document.getElementById('studyStats');
    countDisplay.textContent = `Total cards: ${flashcards.length}`;
    statsDisplay.textContent = `Cards studied today: ${studiedToday.size}`;
    if (filteredCards.length === 0) {
        display.textContent = 'No flashcards available';
        return;
    }
    const currentCard = filteredCards[currentIndex];
    display.textContent = isShowingFront ? currentCard.front : currentCard.back;
    if (currentCard.category) {
        display.innerHTML += `<br><span class="text-sm text-gray-500">&ensp; Category: ${currentCard.category}</span>`;
    }
}

function updateCategoryFilters() {
    const categories = new Set(flashcards.map(card => card.category).filter(Boolean));
    const filterContainer = document.getElementById('categoryFilters');
    filterContainer.innerHTML = '<button onclick="filterByCategory(null)" class="btn btn-secondary">All</button>';
    categories.forEach(category => {
        filterContainer.innerHTML += `
            <button onclick="filterByCategory('${category}')" class="btn btn-secondary">
                ${category}
            </button>
        `;
    });
}

function filterByCategory(category) {
    if (category === null) {
        filteredCards = [...flashcards];
    } else {
        filteredCards = flashcards.filter(card => card.category === category);
    }
    currentIndex = 0;
    updateDisplay();
}

function shuffleCards() {
    for (let i = filteredCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filteredCards[i], filteredCards[j]] = [filteredCards[j], filteredCards[i]];
    }
    currentIndex = 0;
    updateDisplay();
}

function editCurrentCard() {
    if (filteredCards.length === 0) return;
    const card = filteredCards[currentIndex];
    document.getElementById('frontInput').value = card.front;
    document.getElementById('backInput').value = card.back;
    document.getElementById('categoryInput').value = card.category || '';
    deleteCurrentCard();
}

function deleteCurrentCard() {
    if (filteredCards.length === 0) return;
    const cardToDelete = filteredCards[currentIndex];
    flashcards = flashcards.filter(card => card !== cardToDelete);
    filteredCards = filteredCards.filter(card => card !== cardToDelete);
    if (currentIndex >= filteredCards.length) {
        currentIndex = Math.max(0, filteredCards.length - 1);
    }
    localStorage.setItem('flashcards', JSON.stringify(flashcards));
    updateDisplay();
    updateCategoryFilters();
}

function flipCard() {
    if (filteredCards.length > 0) {
        isShowingFront = !isShowingFront;
        updateDisplay();
    }
}

function nextCard() {
    if (filteredCards.length > 0) {
        currentIndex = (currentIndex + 1) % filteredCards.length;
        isShowingFront = true;
        studiedToday.add(filteredCards[currentIndex].front);
        localStorage.setItem('studiedToday', JSON.stringify([...studiedToday]));
        updateDisplay();
    }
}

function prevCard() {
    if (filteredCards.length > 0) {
        currentIndex = (currentIndex - 1 + filteredCards.length) % filteredCards.length;
        isShowingFront = true;
        updateDisplay();
    }
}

// Quick Notes functionality
const notesTextarea = document.getElementById('notes');
notesTextarea.value = localStorage.getItem('studyNotes') || '';
notesTextarea.addEventListener('input', function() {
    localStorage.setItem('studyNotes', this.value);
});



// Initialize necessary functions when the page loads
window.onload = function() {
    loadDarkMode();
    if (window.location.pathname.includes('dashboard.html')) {
        initializeFlashcards();
    }
};

// 1. Study Streaks - Fixed
const streakDisplay = document.getElementById('streakDisplay');
let streakCount = parseInt(localStorage.getItem('studyStreak')) || 0;
let lastStudyDate = localStorage.getItem('lastStudyDate');

function updateStreak() {
    const today = new Date().toISOString().split('T')[0];

    if (lastStudyDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];

        if (lastStudyDate === yesterdayString) {
            streakCount++;
        } else {
            streakCount = 1;
        }

        lastStudyDate = today;
        localStorage.setItem('lastStudyDate', lastStudyDate);
        localStorage.setItem('studyStreak', streakCount);
    }

    if (streakDisplay) {
        streakDisplay.textContent = `Current study streak: ${streakCount} days`;
    }
}

// 2. Pomodoro Timer Settings - Fixed
let timerSettings = JSON.parse(localStorage.getItem('timerSettings')) || {
    work: 25,
    shortBreak: 5,
    longBreak: 15
};

function initializeTimerSettings() {
    const workTimeInput = document.getElementById('workTime');
    const shortBreakInput = document.getElementById('shortBreak');
    const longBreakInput = document.getElementById('longBreak');
    const updateTimerBtn = document.getElementById('updateTimerSettings');

    if (workTimeInput && shortBreakInput && longBreakInput) {
        workTimeInput.value = timerSettings.work;
        shortBreakInput.value = timerSettings.shortBreak;
        longBreakInput.value = timerSettings.longBreak;
    }

    if (updateTimerBtn) {
        updateTimerBtn.addEventListener('click', function() {
            updateTimerSettings();
        });
    }
}

function updateTimerSettings() {
    const workTimeInput = document.getElementById('workTime');
    const shortBreakInput = document.getElementById('shortBreak');
    const longBreakInput = document.getElementById('longBreak');

    if (workTimeInput && shortBreakInput && longBreakInput) {
        timerSettings = {
            work: parseInt(workTimeInput.value) || 25,
            shortBreak: parseInt(shortBreakInput.value) || 5,
            longBreak: parseInt(longBreakInput.value) || 15
        };

        localStorage.setItem('timerSettings', JSON.stringify(timerSettings));

        // Update the timer display if it exists
        const timerDisplay = document.getElementById('timer');
        if (timerDisplay) {
            timerDisplay.textContent = `${timerSettings.work}:00`;
            timeLeft = timerSettings.work * 60;
        }
    }
}

function resetTimer() {
    const timerDisplay = document.getElementById('timer');
    if (timerDisplay) {
        timerDisplay.textContent = `${timerSettings.work}:00`;
    }
}

// 4. Export/Import Data - Fixed
function setupExportImport() {
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');

    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }
    if (importBtn) {
        importBtn.addEventListener('change', importData);
    }
}

function exportData() {
    const data = {
        flashcards: JSON.parse(localStorage.getItem('flashcards') || '[]'),
        todos: JSON.parse(localStorage.getItem('todos') || '[]'),
        notes: localStorage.getItem('notes') || '',
        timerSettings: JSON.parse(localStorage.getItem('timerSettings') || '{}'),
        streak: {
            count: streakCount,
            lastDate: lastStudyDate
        }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'study-companion-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importData(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);

                if (data.flashcards) localStorage.setItem('flashcards', JSON.stringify(data.flashcards));
                if (data.todos) localStorage.setItem('todos', JSON.stringify(data.todos));
                if (data.notes) localStorage.setItem('notes', data.notes);
                if (data.timerSettings) localStorage.setItem('timerSettings', JSON.stringify(data.timerSettings));
                if (data.streak) {
                    localStorage.setItem('studyStreak', data.streak.count);
                    localStorage.setItem('lastStudyDate', data.streak.lastDate);
                }

                alert('Data imported successfully! Refreshing page...');
                location.reload();
            } catch (error) {
                alert('Error importing data. Please check the file format.');
            }
        };
        reader.readAsText(file);
    }
}

// 5. Study Goals - Fixed
let studyGoals = JSON.parse(localStorage.getItem('studyGoals')) || [];

function initializeGoals() {
    const addGoalBtn = document.getElementById('addGoal');
    const goalsList = document.getElementById('goalsList');

    if (addGoalBtn) {
        addGoalBtn.addEventListener('click', addStudyGoal);
    }

    updateGoalsList();
}

function addStudyGoal() {
    const goalInput = document.getElementById('goalInput');
    const deadlineInput = document.getElementById('goalDeadline');

    if (goalInput && deadlineInput && goalInput.value.trim() !== '') {
        const newGoal = {
            id: Date.now(),
            text: goalInput.value.trim(),
            deadline: deadlineInput.value,
            completed: false
        };

        studyGoals.push(newGoal);
        localStorage.setItem('studyGoals', JSON.stringify(studyGoals));

        goalInput.value = '';
        deadlineInput.value = '';

        updateGoalsList();
    }
}

function updateGoalsList() {
    const goalsList = document.getElementById('goalsList');
    if (!goalsList) return;

    goalsList.innerHTML = '';
    studyGoals.forEach(goal => {
        const li = document.createElement('li');
        li.innerHTML = `
            <input type="checkbox" ${goal.completed ? 'checked' : ''}>
            <span>${goal.text}</span>
            <span>${goal.deadline}</span>
            <button class="btn btn-danger btn-sm">Delete</button>
        `;

        const checkbox = li.querySelector('input');
        checkbox.addEventListener('change', () => toggleGoal(goal.id));

        const deleteBtn = li.querySelector('button');
        deleteBtn.addEventListener('click', () => deleteGoal(goal.id));

        goalsList.appendChild(li);
    });
}

function toggleGoal(goalId) {
    const goalIndex = studyGoals.findIndex(goal => goal.id === goalId);
    if (goalIndex !== -1) {
        studyGoals[goalIndex].completed = !studyGoals[goalIndex].completed;
        localStorage.setItem('studyGoals', JSON.stringify(studyGoals));
        updateGoalsList();
    }
}

function deleteGoal(goalId) {
    studyGoals = studyGoals.filter(goal => goal.id !== goalId);
    localStorage.setItem('studyGoals', JSON.stringify(studyGoals));
    updateGoalsList();
}

// 6. Focus Mode - Fixed
let focusModeActive = false;

function toggleFocusMode() {
    focusModeActive = !focusModeActive;
    const dashboardGrid = document.querySelector('.dashboard-grid');
    const focusModeBtn = document.getElementById('focusModeBtn');

    if (focusModeActive) {
        dashboardGrid.classList.add('focus-mode');
        focusModeBtn.textContent = 'Exit Focus Mode';
    } else {
        dashboardGrid.classList.remove('focus-mode');
        focusModeBtn.textContent = 'Enter Focus Mode';
    }
}

document.getElementById('focusModeBtn').addEventListener('click', toggleFocusMode);

// 7. Study Music Player - Fixed
const studyPlaylist = [
    { title: 'Lo-Fi Beats', url: 'https://cdnjs.cloudflare.com/ajax/libs/ion-sound/3.0.7/sounds/bell_ring.mp3' },
    { title: 'Nature Sounds', url: 'https://cdnjs.cloudflare.com/ajax/libs/ion-sound/3.0.7/sounds/water_droplet.mp3' },
    { title: 'Classical Music', url: 'https://cdnjs.cloudflare.com/ajax/libs/ion-sound/3.0.7/sounds/door_bell.mp3' }
];

let currentTrackIndex = 0;
let audio = new Audio();

function initializeMusicPlayer() {
    const musicDisplay = document.getElementById('musicDisplay');
    const playButton = document.getElementById('playMusic');
    const nextButton = document.getElementById('nextTrack');

    if (musicDisplay) {
        updateMusicDisplay();
    }

    if (playButton) {
        playButton.addEventListener('click', toggleMusic);
    }

    if (nextButton) {
        nextButton.addEventListener('click', nextTrack);
    }
}

function toggleMusic() {
    const playButton = document.getElementById('playMusic');
    if (!playButton) return;

    if (audio.paused) {
        playMusic();
    } else {
        audio.pause();
        playButton.textContent = 'Play';
    }
}

function playMusic() {
    const playButton = document.getElementById('playMusic');
    if (!playButton) return;

    audio.src = studyPlaylist[currentTrackIndex].url;
    audio.play();
    playButton.textContent = 'Pause';
    updateMusicDisplay();
}

function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % studyPlaylist.length;
    if (!audio.paused) {
        playMusic();
    } else {
        updateMusicDisplay();
    }
}

function updateMusicDisplay() {
    const musicDisplay = document.getElementById('musicDisplay');
    if (musicDisplay) {
        musicDisplay.textContent = `Current track: ${studyPlaylist[currentTrackIndex].title}`;
    }
}

// 8. Progress Tracking - Fixed
// Store time data in localStorage
const TIME_STORAGE_KEY = 'computerUsageTime';

// Track active time
let startTime = null;
let isTracking = false;

// Load or initialize time data
function getTimeData() {
    try {
        return JSON.parse(localStorage.getItem(TIME_STORAGE_KEY)) || {};
    } catch {
        return {};
    }
}

// Save time data
function saveTimeData(timeData) {
    localStorage.setItem(TIME_STORAGE_KEY, JSON.stringify(timeData));
}

// Start tracking time
function startTracking() {
    if (!isTracking) {
        startTime = new Date();
        isTracking = true;
    }
}

// Stop tracking and save time
function stopTracking() {
    if (isTracking && startTime) {
        const timeData = getTimeData();
        const today = new Date().toISOString().split('T')[0];
        const minutesSpent = Math.floor((new Date() - startTime) / 60000);

        timeData[today] = (timeData[today] || 0) + minutesSpent;
        saveTimeData(timeData);

        isTracking = false;
        startTime = null;
    }
}

// Get dates for last 7 days
function getLast7Days() {
    return Array.from({length: 7}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toLocaleDateString('en-US', { weekday: 'short' });
    }).reverse();
}

// Get computer usage data for last 7 days
function getUsageData() {
    const timeData = getTimeData();
    return Array.from({length: 7}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().split('T')[0];
        return timeData[dateKey] || 0;
    }).reverse();
}

// Initialize and update chart
function initializeProgressChart() {
    const ctx = document.getElementById('progressChart');
    if (!ctx) return;

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: getLast7Days(),
            datasets: [{
                label: 'Computer Usage (minutes)',
                data: getUsageData(),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value) => {
                            const hours = Math.floor(value / 60);
                            const mins = value % 60;
                            return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const minutes = context.raw;
                            const hours = Math.floor(minutes / 60);
                            const mins = minutes % 60;
                            return `Usage: ${hours}h ${mins}m`;
                        }
                    }
                }
            }
        }
    });

    // Update chart every minute
    setInterval(() => {
        if (isTracking) {
            stopTracking();
            startTracking();
        }
        chart.data.datasets[0].data = getUsageData();
        chart.update();
    }, 60000);
}

// Set up activity tracking
document.addEventListener('DOMContentLoaded', () => {
    initializeProgressChart();

    // Track when page is visible/hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopTracking();
        } else {
            startTracking();
        }
    });

    // Track user activity
    let activityTimeout;
    function resetActivity() {
        clearTimeout(activityTimeout);
        startTracking();
        activityTimeout = setTimeout(stopTracking, 60000); // Stop after 1 minute of inactivity
    }

    // Monitor user activity events
    ['mousedown', 'keydown', 'mousemove', 'scroll'].forEach(eventType => {
        document.addEventListener(eventType, resetActivity, { passive: true });
    });

    // Start tracking if page is visible
    if (!document.hidden) {
        startTracking();
    }
});

// Clean up when page is closed
window.addEventListener('beforeunload', stopTracking);

// 9. Collaborative Study Sessions - Fixed
class ChatSession {
    constructor(topic, host) {
        this.id = Date.now();
        this.topic = topic;
        this.host = host;
        this.participants = [host];
        this.created = new Date().toLocaleString();
        this.messages = [];
    }
}

class ChatMessage {
    constructor(sender, text) {
        this.sender = sender;
        this.text = text;
        this.timestamp = new Date().toLocaleTimeString();
    }
}

// State management
const state = {
    collaborativeSessions: [],
    currentSession: null,
    currentUser: 'Current User' // In a real app, this would come from authentication
};

// DOM utility functions
const getElement = (id) => document.getElementById(id);
const createElement = (tag, className) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    return element;
};

// Event handlers
function initializeCollaborativeSessions() {
    const createSessionBtn = getElement('createSession');
    const chatInput = getElement('chatInput');

    if (createSessionBtn) {
        createSessionBtn.addEventListener('click', createCollaborativeSession);
    }

    if (chatInput) {
        chatInput.addEventListener('keypress', handleChatKeyPress);
    }

    // Add window event listener for cleanup
    window.addEventListener('beforeunload', () => {
        if (state.currentSession) {
            leaveSession();
        }
    });

    updateSessionsList();
}

function handleChatKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

function createCollaborativeSession() {
    const topicInput = getElement('sessionTopic');
    const topic = topicInput?.value.trim();

    if (!topic) {
        showError('Please enter a topic for the session');
        return;
    }

    const newSession = new ChatSession(topic, state.currentUser);
    state.collaborativeSessions.push(newSession);

    if (topicInput) {
        topicInput.value = '';
    }

    updateSessionsList();
    showSuccess('Session created successfully');
}

function updateSessionsList() {
    const sessionsList = getElement('sessionsList');
    if (!sessionsList) return;

    sessionsList.innerHTML = '';

    if (state.collaborativeSessions.length === 0) {
        sessionsList.innerHTML = '<p class="text-muted">No active sessions</p>';
        return;
    }

    state.collaborativeSessions.forEach(session => {
        const sessionElement = createElement('div', 'session-item');
        sessionElement.innerHTML = `
            <h3>${escapeHtml(session.topic)}</h3>
            <p>Host: ${escapeHtml(session.host)}</p>
            <p>Participants: ${session.participants.length}</p>
            <p>Created: ${session.created}</p>
            <button class="btn btn-primary btn-sm" onclick="joinSession(${session.id})">
                ${session.participants.includes(state.currentUser) ? 'Rejoin' : 'Join'}
            </button>
        `;
        sessionsList.appendChild(sessionElement);
    });
}

function joinSession(sessionId) {
    const session = state.collaborativeSessions.find(s => s.id === sessionId);
    if (!session) {
        showError('Session not found');
        return;
    }

    if (state.currentSession) {
        leaveSession();
    }

    state.currentSession = session;
    if (!session.participants.includes(state.currentUser)) {
        session.participants.push(state.currentUser);
    }

    updateSessionsList();
    showChatInterface(session);
    showSuccess('Joined session successfully');
}

function leaveSession() {
    if (!state.currentSession) return;

    state.currentSession.participants = state.currentSession.participants
        .filter(p => p !== state.currentUser);

    // Remove session if empty
    if (state.currentSession.participants.length === 0) {
        state.collaborativeSessions = state.collaborativeSessions
            .filter(s => s.id !== state.currentSession.id);
    }

    state.currentSession = null;
    updateSessionsList();
    hideChatInterface();
    showSuccess('Left session successfully');
}

function showChatInterface(session) {
    const chatContainer = getElement('chatContainer');
    const chatInterface = getElement('chatInterface');

    if (!chatContainer || !chatInterface) return;

    chatContainer.style.display = 'block';
    chatInterface.innerHTML = `
        <div class="chat-header">
            <h3>${escapeHtml(session.topic)}</h3>
            <span class="participant-count">${session.participants.length} participants</span>
        </div>
        <div id="chatMessages" class="chat-messages"></div>
        <div class="chat-input-container">
            <input type="text" id="chatInput" placeholder="Type your message..." maxlength="500">
            <button onclick="sendMessage()" class="btn btn-primary">Send</button>
        </div>
        <button onclick="leaveSession()" class="btn btn-danger mt-3">Leave Session</button>
    `;

    displayMessages(session.messages);

    // Focus input after showing interface
    const chatInput = getElement('chatInput');
    if (chatInput) {
        chatInput.focus();
    }
}

function hideChatInterface() {
    const chatContainer = getElement('chatContainer');
    if (chatContainer) {
        chatContainer.style.display = 'none';
    }
}

function sendMessage() {
    const chatInput = getElement('chatInput');
    const messageText = chatInput?.value.trim();

    if (!messageText || !state.currentSession) return;

    if (messageText.length > 500) {
        showError('Message is too long (max 500 characters)');
        return;
    }

    const message = new ChatMessage(state.currentUser, messageText);
    state.currentSession.messages.push(message);

    if (chatInput) {
        chatInput.value = '';
    }

    displayMessages(state.currentSession.messages);
}

function displayMessages(messages) {
    const chatMessages = getElement('chatMessages');
    if (!chatMessages) return;

    chatMessages.innerHTML = messages.map(msg => `
        <div class="chat-message ${msg.sender === state.currentUser ? 'own-message' : ''}">
            <div class="message-header">
                <span class="sender">${escapeHtml(msg.sender)}</span>
                <span class="timestamp">${msg.timestamp}</span>
            </div>
            <p class="message-text">${escapeHtml(msg.text)}</p>
        </div>
    `).join('');

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Utility functions
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function showError(message) {
    // Implement your preferred error notification system
    console.error(message);
    alert(message); // Replace with a better UI notification
}

function showSuccess(message) {
    // Implement your preferred success notification system
    console.log(message);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeCollaborativeSessions);

// 10. Customizable Dashboard Layout - Fixed
function initializeDragAndDrop() {
    const cards = document.querySelectorAll('.card');
    const dashboardGrid = document.querySelector('.dashboard-grid');

    // Initialize each card
    cards.forEach(card => {
        // Make card draggable
        card.draggable = true;

        // Drag start
        card.addEventListener('dragstart', (e) => {
            card.classList.add('dragging');
        });

        // Drag end
        card.addEventListener('dragend', (e) => {
            card.classList.remove('dragging');
        });
    });

    // Grid event listeners
    if (dashboardGrid) {
        // Prevent default to allow drop
        dashboardGrid.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggingCard = document.querySelector('.dragging');
            const afterElement = getDragAfterElement(dashboardGrid, e.clientY);

            if (draggingCard) {
                if (afterElement) {
                    dashboardGrid.insertBefore(draggingCard, afterElement);
                } else {
                    dashboardGrid.appendChild(draggingCard);
                }
            }
        });

        // Handle drop
        dashboardGrid.addEventListener('drop', (e) => {
            e.preventDefault();
        });
    }
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.card:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeDragAndDrop);

// Initialize all features
document.addEventListener('DOMContentLoaded', function() {
    updateStreak();
    initializeTimerSettings();
    setupExportImport();
    initializeGoals();
    initializeFocusMode();
    initializeMusicPlayer();
    initializeProgressChart();
    initializeCollaborativeSessions();
    initializeDragAndDrop();
});

// New Feature 5: Learning Style Quiz
const learningStyles = [
    { name: "Visual", description: "You learn best through images, diagrams, and spatial understanding." },
    { name: "Auditory", description: "You prefer learning through listening and speaking." },
    { name: "Reading/Writing", description: "You learn most effectively through words, reading, and writing." },
    { name: "Kinesthetic", description: "You learn best through hands-on experiences and physical activities." }
];

function initializeLearningStyleQuiz() {
    const quizContainer = document.createElement('div');
    quizContainer.className = 'card';
    quizContainer.innerHTML = `
        <h2>Learning Style Quiz</h2>
        <div id="quizQuestions"></div>
        <button id="submitQuiz" class="btn btn-primary">Submit Quiz</button>
        <p id="quizResult"></p>
    `;
    document.querySelector('.dashboard-grid').appendChild(quizContainer);

    createQuizQuestions();
    document.getElementById('submitQuiz').addEventListener('click', calculateLearningStyle);
}

function createQuizQuestions() {
    const questions = [
        "I prefer to see information presented in charts or graphs.",
        "I enjoy listening to lectures and podcasts.",
        "I like to take detailed notes during class.",
        "I learn best when I can move around and do hands-on activities."
    ];
    const quizQuestionsDiv = document.getElementById('quizQuestions');
    questions.forEach((question, index) => {
        quizQuestionsDiv.innerHTML += `
            <p>${question}</p>
            <input type="radio" name="q${index}" value="1"> Strongly Disagree
            <input type="radio" name="q${index}" value="2"> Disagree
            <input type="radio" name="q${index}" value="3"> Neutral
            <input type="radio" name="q${index}" value="4"> Agree
            <input type="radio" name="q${index}" value="5"> Strongly Agree
        `;
    });
}

function calculateLearningStyle() {
    const scores = [0, 0, 0, 0]; // Visual, Auditory, Reading/Writing, Kinesthetic
    for (let i = 0; i < 4; i++) {
        const selected = document.querySelector(`input[name="q${i}"]:checked`);
        if (selected) {
            scores[i] = parseInt(selected.value);
        }
    }
    const maxScore = Math.max(...scores);
    const dominantStyle = learningStyles[scores.indexOf(maxScore)];
    document.getElementById('quizResult').innerHTML = `
        Your dominant learning style is: <strong>${dominantStyle.name}</strong><br>
        ${dominantStyle.description}
    `;
}

// Initialize all features
document.addEventListener('DOMContentLoaded', function() {
    initializeLearningStyleQuiz();
});
// 4. Study Resources Library
let studyResources = JSON.parse(localStorage.getItem('studyResources')) || [];

function initializeResourceLibrary() {
    const libraryContainer = document.createElement('div');
    libraryContainer.className = 'card';
    libraryContainer.innerHTML = `
        <h2>Study Resources</h2>
        <input type="text" id="resourceName" placeholder="Resource Name">
        <input type="text" id="resourceLink" placeholder="Resource Link">
        <button id="addResource" class="btn btn-primary">Add Resource</button>
        <ul id="resourceList"></ul>
    `;
    document.querySelector('.dashboard-grid').appendChild(libraryContainer);

    document.getElementById('addResource').addEventListener('click', addResource);
    displayResources();
}

function addResource() {
    const name = document.getElementById('resourceName').value;
    const link = document.getElementById('resourceLink').value;
    if (name && link) {
        studyResources.push({ name, link });
        localStorage.setItem('studyResources', JSON.stringify(studyResources));
        displayResources();
        document.getElementById('resourceName').value = '';
        document.getElementById('resourceLink').value = '';
    }
}

function displayResources() {
    const resourceList = document.getElementById('resourceList');
    resourceList.innerHTML = '';
    studyResources.forEach((resource, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <a href="${resource.link}" target="_blank">${resource.name}</a>
            <button onclick="removeResource(${index})" class="btn btn-danger btn-sm">Remove</button>
        `;
        resourceList.appendChild(li);
    });
}

function removeResource(index) {
    studyResources.splice(index, 1);
    localStorage.setItem('studyResources', JSON.stringify(studyResources));
    displayResources();
}

// Initialize all new features
document.addEventListener('DOMContentLoaded', function() {
    initializeResourceLibrary();
});

// Study Stats
let studyStats = (() => {
    const defaults = {
        totalStudyTime: 0,
        sessionsCompleted: 0,
        cardsReviewed: 0,
        quizzesTaken: 0
    };

    try {
        const saved = localStorage.getItem('studyStats');
        return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    } catch (error) {
        console.error('Error loading study stats:', error);
        return defaults;
    }
})();

function initializeStudyStats() {
    try {
        const dashboardGrid = document.querySelector('.dashboard-grid');
        if (!dashboardGrid) {
            throw new Error('Dashboard grid element not found');
        }

        const statsContainer = document.createElement('div');
        statsContainer.className = 'card study-stats';
        statsContainer.innerHTML = `
            <h2>Study Stats</h2>
            <div class="stats-content">
                <p>Total Study Time: <span id="totalStudyTime">0</span> minutes</p>
                <p>Sessions Completed: <span id="sessionsCompleted">0</span></p>
                <p>Cards Reviewed: <span id="cardsReviewed">0</span></p>
                <p>Quizzes Taken: <span id="quizzesTaken">0</span></p>
            </div>
        `;

        dashboardGrid.appendChild(statsContainer);
        updateStudyStatsDisplay();
    } catch (error) {
        console.error('Error initializing study stats:', error);
    }
}

function updateStudyStatsDisplay() {
    try {
        const elements = {
            totalStudyTime: document.getElementById('totalStudyTime'),
            sessionsCompleted: document.getElementById('sessionsCompleted'),
            cardsReviewed: document.getElementById('cardsReviewed'),
            quizzesTaken: document.getElementById('quizzesTaken')
        };

        // Verify all elements exist
        Object.entries(elements).forEach(([key, element]) => {
            if (!element) {
                throw new Error(`Element ${key} not found`);
            }
            element.textContent = studyStats[key];
        });
    } catch (error) {
        console.error('Error updating study stats display:', error);
    }
}

function updateStudyStats(studyTime = 0, completedSession = false, reviewedCards = 0, quizTaken = false) {
    try {
        // Validate inputs
        if (typeof studyTime !== 'number' || studyTime < 0) {
            throw new Error('Invalid study time value');
        }
        if (typeof reviewedCards !== 'number' || reviewedCards < 0) {
            throw new Error('Invalid reviewed cards value');
        }

        // Update stats
        studyStats.totalStudyTime += Math.floor(studyTime);
        studyStats.sessionsCompleted += completedSession ? 1 : 0;
        studyStats.cardsReviewed += Math.floor(reviewedCards);
        studyStats.quizzesTaken += quizTaken ? 1 : 0;

        // Save to localStorage
        localStorage.setItem('studyStats', JSON.stringify(studyStats));

        // Update display
        updateStudyStatsDisplay();

        return true;
    } catch (error) {
        console.error('Error updating study stats:', error);
        return false;
    }
}

// Add reset functionality
function resetStudyStats() {
    try {
        studyStats = {
            totalStudyTime: 0,
            sessionsCompleted: 0,
            cardsReviewed: 0,
            quizzesTaken: 0
        };
        localStorage.removeItem('studyStats');
        updateStudyStatsDisplay();
        return true;
    } catch (error) {
        console.error('Error resetting study stats:', error);
        return false;
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    applyDarkMode();
}

function loadDarkMode() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
    applyDarkMode();
}

function applyDarkMode() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    document.querySelectorAll('.card, .btn, input, textarea, select').forEach(element => {
        element.classList.toggle('dark-mode', isDarkMode);
    });
}

// Quiz System
function initializeQuizSystem() {
    const quizButton = document.createElement('button');
    quizButton.textContent = 'Create/Take Quizzes';
    quizButton.className = 'btn btn-primary';
    quizButton.addEventListener('click', navigateToQuizPage);
    document.querySelector('.dashboard-grid').appendChild(quizButton);
    applyDarkMode();
}

function navigateToQuizPage() {
    const dashboard = document.querySelector('.dashboard-grid');
    dashboard.innerHTML = '';
    dashboard.appendChild(createQuizInterface());
    applyDarkMode();
}

function createQuizInterface() {
    const quizContainer = document.createElement('div');
    quizContainer.innerHTML = `
        <h2>Quiz System</h2>
        <button id="createQuizBtn" class="btn btn-primary">Create New Quiz</button>
        <button id="takeQuizBtn" class="btn btn-secondary">Take a Quiz</button>
        <div id="quizContent"></div>
        <button id="backToDashboard" class="btn btn-info">Back to Dashboard</button>
    `;

    quizContainer.querySelector('#createQuizBtn').addEventListener('click', showCreateQuizForm);
    quizContainer.querySelector('#takeQuizBtn').addEventListener('click', showAvailableQuizzes);
    quizContainer.querySelector('#backToDashboard').addEventListener('click', () => {
        location.reload();
        loadDarkMode();
    });

    return quizContainer;
}

function showCreateQuizForm() {
    const quizContent = document.getElementById('quizContent');
    quizContent.innerHTML = `
        <h3>Create a New Quiz</h3>
        <input type="text" id="quizTitle" placeholder="Quiz Title" class="form-control mb-2">
        <div id="questions"></div>
        <button id="addMCQ" class="btn btn-secondary">Add Multiple Choice Question</button>
        <button id="addOpenEnded" class="btn btn-secondary">Add Open-Ended Question</button>
        <button id="saveQuiz" class="btn btn-primary mt-2">Save Quiz</button>
    `;

    document.getElementById('addMCQ').addEventListener('click', () => addQuestionForm('mcq'));
    document.getElementById('addOpenEnded').addEventListener('click', () => addQuestionForm('open'));
    document.getElementById('saveQuiz').addEventListener('click', saveQuiz);
    applyDarkMode();
}

function addQuestionForm(type) {
    const questionsContainer = document.getElementById('questions');
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-form mb-3';
    if (type === 'mcq') {
        questionDiv.innerHTML = `
            <input type="text" placeholder="Question" class="form-control mb-2">
            <input type="text" placeholder="Option 1" class="form-control mb-2">
            <input type="text" placeholder="Option 2" class="form-control mb-2">
            <input type="text" placeholder="Option 3" class="form-control mb-2">
            <input type="text" placeholder="Option 4" class="form-control mb-2">
            <select class="form-control">
                <option value="">Correct Answer</option>
                <option value="0">Option 1</option>
                <option value="1">Option 2</option>
                <option value="2">Option 3</option>
                <option value="3">Option 4</option>
            </select>
        `;
    } else {
        questionDiv.innerHTML = `
            <input type="text" placeholder="Question" class="form-control mb-2">
            <textarea placeholder="Answer" class="form-control" rows="3"></textarea>
        `;
    }
    questionsContainer.appendChild(questionDiv);
    applyDarkMode();
}

function showAvailableQuizzes() {
    const quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
    const quizContent = document.getElementById('quizContent');
    quizContent.innerHTML = '<h3>Available Quizzes</h3>';
    if (quizzes.length === 0) {
        quizContent.innerHTML += '<p>No quizzes available. Create one first!</p>';
    } else {
        quizzes.forEach((quiz, index) => {
            const quizButton = document.createElement('button');
            quizButton.textContent = quiz.title;
            quizButton.className = 'btn btn-outline-primary m-2';
            quizButton.addEventListener('click', () => startQuiz(index));
            quizContent.appendChild(quizButton);
        });
    }
    applyDarkMode();
}

function submitQuiz(quiz) {
    let score = 0;
    let totalQuestions = quiz.questions.length;
    let answeredQuestions = 0;

    quiz.questions.forEach((question, index) => {
        if (question.type === 'mcq') {
            const selected = document.querySelector(`input[name="q${index}"]:checked`);
            if (selected) {
                answeredQuestions++;
                if (parseInt(selected.value) === question.correctAnswer) {
                    score++;
                }
            }
        } else {
            const answerElement = document.getElementById(`q${index}`);
            if (answerElement && answerElement.value.trim() !== '') {
                answeredQuestions++;
            }
        }
    });

    updateStudyStats(0, false, 0, true); // Update quiz taken count

    let message = `Quiz completed!\n`;
    message += `You answered ${answeredQuestions} out of ${totalQuestions} questions.\n`;
    message += `Your score on multiple choice questions: ${score} out of ${totalQuestions}.\n`;

    if (answeredQuestions < totalQuestions) {
        message += `\nNote: You left ${totalQuestions - answeredQuestions} question(s) unanswered.`;
    }

    alert(message);
    showAvailableQuizzes();
}

function startQuiz(quizIndex) {
    const quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
    const quiz = quizzes[quizIndex];
    const quizContent = document.getElementById('quizContent');
    if (!quizContent) {
        console.error('Quiz content container not found');
        return;
    }

    quizContent.innerHTML = `<h3>${quiz.title}</h3>`;
    quiz.questions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.innerHTML = `<p><strong>Question ${index + 1}:</strong> ${question.question}</p>`;
        if (question.type === 'mcq') {
            question.options.forEach((option, optionIndex) => {
                questionDiv.innerHTML += `
                    <label>
                        <input type="radio" name="q${index}" value="${optionIndex}">
                        ${option}
                    </label><br>
                `;
            });
        } else {
            questionDiv.innerHTML += `<textarea class="form-control" rows="3" id="q${index}"></textarea>`;
        }
        quizContent.appendChild(questionDiv);
    });

    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit Quiz';
    submitButton.className = 'btn btn-primary mt-3';
    submitButton.addEventListener('click', () => submitQuiz(quiz));
    quizContent.appendChild(submitButton);
    applyDarkMode();
}

// ... (rest of the code remains the same)

// Ensure all DOM interactions are wrapped in a DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    loadDarkMode();
    initializeStudyStats();
    initializeQuizSystem();

    // Add event delegation for dynamically created elements
    document.body.addEventListener('click', function(event) {
        if (event.target.id === 'createQuizBtn') {
            showCreateQuizForm();
        } else if (event.target.id === 'takeQuizBtn') {
            showAvailableQuizzes();
        } else if (event.target.id === 'backToDashboard') {
            location.reload();
            loadDarkMode();
        }
    });
});