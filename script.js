// DOM Elements
const getStartedBtn = document.getElementById('getStartedBtn');
const userForm = document.getElementById('userForm');
const workoutPlan = document.getElementById('workoutPlan');
const fitnessForm = document.getElementById('fitnessForm');
const chatToggle = document.getElementById('chatToggle');
const chatbot = document.getElementById('chatbot');
const closeChat = document.getElementById('closeChat');
const userMessage = document.getElementById('userMessage');
const sendMessage = document.getElementById('sendMessage');
const chatMessages = document.getElementById('chatMessages');
const filterBtns = document.querySelectorAll('.filter-btn');
const exerciseCards = document.querySelectorAll('.exercise-card');
const planInfo = document.getElementById('planInfo');
const workoutSchedule = document.getElementById('workoutSchedule');
const exerciseList = document.getElementById('exerciseList');
const savePlanBtn = document.getElementById('savePlanBtn');
const adjustPlanBtn = document.getElementById('adjustPlanBtn');
const setRemindersBtn = document.getElementById('setRemindersBtn');

// Navigation elements
const homeLink = document.getElementById('homeLink');
const workoutsLink = document.getElementById('workoutsLink');
const nutritionLink = document.getElementById('nutritionLink');
const remindersLink = document.getElementById('remindersLink');
const settingsLink = document.getElementById('settingsLink');
const homeSection = document.getElementById('homeSection');
const workoutsSection = document.getElementById('workoutsSection');
const nutritionSection = document.getElementById('nutritionSection');
const remindersSection = document.getElementById('remindersSection');
const settingsSection = document.getElementById('settingsSection');
const savedWorkoutsList = document.getElementById('savedWorkoutsList');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navLinks = document.getElementById('navLinks');

// Notification elements
const notificationBell = document.getElementById('notificationBell');
const notificationPanel = document.getElementById('notificationPanel');
const notificationCount = document.querySelector('.notification-count');
const notificationList = document.getElementById('notificationList');
const clearAllNotifications = document.getElementById('clearAllNotifications');

// Nutrition tracker elements
const foodForm = document.getElementById('foodForm');
const foodName = document.getElementById('foodName');
const mealType = document.getElementById('mealType');
const calories = document.getElementById('calories');
const protein = document.getElementById('protein');
const carbs = document.getElementById('carbs');
const fat = document.getElementById('fat');
const searchFoodBtn = document.getElementById('searchFoodBtn');
const foodSearchResults = document.getElementById('foodSearchResults');
const foodSearchInput = document.getElementById('foodSearchInput');
const performFoodSearch = document.getElementById('performFoodSearch');
const foodResultsList = document.getElementById('foodResultsList');
const mealList = document.getElementById('mealList');
const currentCalories = document.getElementById('currentCalories');
const targetCalories = document.getElementById('targetCalories');
const proteinProgress = document.getElementById('proteinProgress');
const carbsProgress = document.getElementById('carbsProgress');
const fatProgress = document.getElementById('fatProgress');
const proteinValue = document.getElementById('proteinValue');
const carbsValue = document.getElementById('carbsValue');
const fatValue = document.getElementById('fatValue');
const calorieChart = document.getElementById('calorieChart');
// Chart.js instance holder (prevents ReferenceError before first init)
let calorieChartInstance = null;
// Food picker and QR elements
const foodPickerInput = document.getElementById('foodPickerInput');
const foodPickerList = document.getElementById('foodPickerList');
const fillFromPicker = document.getElementById('fillFromPicker');
const qrUpload = document.getElementById('qrUpload');

// Reminder elements
const reminderForm = document.getElementById('reminderForm');
const reminderTitle = document.getElementById('reminderTitle');
const reminderType = document.getElementById('reminderType');
const reminderTime = document.getElementById('reminderTime');
const reminderNote = document.getElementById('reminderNote');
const remindersList = document.getElementById('remindersList');
const reminderPermissions = document.getElementById('reminderPermissions');
const enableNotificationsBtn = document.getElementById('enableNotifications');
// Wearable elements
const connectWearableBtn = document.getElementById('connectWearableBtn');
const disconnectWearableBtn = document.getElementById('disconnectWearableBtn');
const heartRateValue = document.getElementById('heartRateValue');
const batteryLevelValue = document.getElementById('batteryLevelValue');
const deviceStatus = document.getElementById('deviceStatus');
let wearableDevice = null;
let heartRateChar = null;
let batteryLevelChar = null;

// User data storage
let userData = {
    profile: {},
    workoutPlans: [],
    workoutSessions: [], // New: track completed workouts
    meals: [],
    reminders: [],
    notifications: []
};

// Food database from CSV
let foodDatabase = [];
let foodCategories = [];

// Enhanced Data Persistence System
function loadUserData() {
    try {
        const savedData = localStorage.getItem('fitAIUserData');
        if (savedData) {
            const parsedData = JSON.parse(savedData);

            // Merge with default structure to handle new fields
            userData = {
                profile: parsedData.profile || {},
                workoutPlans: parsedData.workoutPlans || [],
                workoutSessions: parsedData.workoutSessions || [],
                meals: parsedData.meals || [],
                reminders: parsedData.reminders || [],
                notifications: parsedData.notifications || [],
                settings: parsedData.settings || {
                    theme: 'light',
                    notifications: true,
                    autoBackup: true
                },
                lastBackup: parsedData.lastBackup || null,
                dataVersion: parsedData.dataVersion || '1.0'
            };

            console.log('✅ User data loaded successfully');
            updateSavedWorkouts();
            updateNotificationCount();

            // Auto-backup if enabled and it's been more than 24 hours
            if (userData.settings.autoBackup) {
                checkAutoBackup();
            }
        } else {
            console.log('ℹ️ No saved data found, using defaults');
            // Initialize with sample data for first-time users
            initializeDefaultData();
        }
    } catch (error) {
        console.error('❌ Error loading user data:', error);
        addNotification('Error loading saved data. Using defaults.', 'error');
        initializeDefaultData();
    }
}

// Enhanced save function with error handling and versioning
function saveUserData() {
    try {
        // Add metadata
        userData.lastSaved = new Date().toISOString();
        userData.dataVersion = '1.0';

        // Save to localStorage
        localStorage.setItem('fitAIUserData', JSON.stringify(userData));

        // Also save a backup copy
        localStorage.setItem('fitAIUserData_backup', JSON.stringify(userData));

        console.log('✅ User data saved successfully');

        // Update last backup time if auto-backup is enabled
        if (userData.settings && userData.settings.autoBackup) {
            userData.lastBackup = new Date().toISOString();
        }

    } catch (error) {
        console.error('❌ Error saving user data:', error);

        // Try to free up space by cleaning old data
        cleanupOldData();

        // Try saving again
        try {
            localStorage.setItem('fitAIUserData', JSON.stringify(userData));
            console.log('✅ User data saved after cleanup');
        } catch (secondError) {
            console.error('❌ Failed to save even after cleanup:', secondError);
            addNotification('Warning: Unable to save data. Storage may be full.', 'error');
        }
    }
}

// Initialize default data for new users
function initializeDefaultData() {
    userData = {
        profile: {
            name: '',
            age: '',
            weight: '',
            height: '',
            fitnessGoal: 'Improve overall fitness',
            goalType: 'general'
        },
        workoutPlans: [],
        workoutSessions: [],
        meals: [],
        reminders: [],
        notifications: [],
        settings: {
            theme: 'light',
            notifications: true,
            autoBackup: true,
            dataRetention: 90 // days
        },
        lastBackup: null,
        dataVersion: '1.0',
        createdAt: new Date().toISOString()
    };

    // Add welcome notification
    addNotification('Welcome to FitAI! Your fitness journey starts here.', 'success');

    // Save initial data
    saveUserData();
}

// Auto-backup system
function checkAutoBackup() {
    if (!userData.lastBackup) return;

    const lastBackup = new Date(userData.lastBackup);
    const now = new Date();
    const hoursSinceBackup = (now - lastBackup) / (1000 * 60 * 60);

    // Auto-backup every 24 hours
    if (hoursSinceBackup >= 24) {
        createDataBackup();
    }
}

// Create downloadable backup
function createDataBackup() {
    try {
        const backupData = {
            ...userData,
            backupDate: new Date().toISOString(),
            appVersion: '1.0'
        };

        const dataStr = JSON.stringify(backupData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        // Save backup to localStorage with timestamp
        const backupKey = `fitAI_backup_${new Date().toISOString().split('T')[0]}`;
        localStorage.setItem(backupKey, dataStr);

        console.log('✅ Backup created successfully');
        userData.lastBackup = new Date().toISOString();

        return dataBlob;
    } catch (error) {
        console.error('❌ Error creating backup:', error);
        return null;
    }
}

// Download backup file
function downloadBackup() {
    const backup = createDataBackup();
    if (backup) {
        const url = URL.createObjectURL(backup);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fitai-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        addNotification('✅ Backup downloaded successfully!', 'success');
    }
}

// Restore from backup
function restoreFromBackup(backupData) {
    try {
        const parsedData = typeof backupData === 'string' ? JSON.parse(backupData) : backupData;

        // Validate backup data structure
        if (!parsedData.workoutPlans && !parsedData.meals && !parsedData.reminders) {
            throw new Error('Invalid backup format');
        }

        // Merge with current data (preserve newer entries)
        userData = {
            ...userData,
            ...parsedData,
            restoredAt: new Date().toISOString()
        };

        // Save restored data
        saveUserData();

        // Update UI
        updateSavedWorkouts();
        updateNotificationCount();
        loadNutritionData();
        updateRemindersList();

        addNotification('✅ Data restored successfully!', 'success');
        console.log('✅ Data restored from backup');

        return true;
    } catch (error) {
        console.error('❌ Error restoring backup:', error);
        addNotification('❌ Error restoring backup. Please check the file format.', 'error');
        return false;
    }
}

// Clean up old data to free space
function cleanupOldData() {
    try {
        const retentionDays = userData.settings?.dataRetention || 90;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

        // Clean old meals
        const originalMealCount = userData.meals.length;
        userData.meals = userData.meals.filter(meal => {
            const mealDate = new Date(meal.timestamp);
            return mealDate >= cutoffDate;
        });

        // Clean old notifications
        const originalNotificationCount = userData.notifications.length;
        userData.notifications = userData.notifications.slice(0, 20); // Keep only latest 20

        // Clean old workout sessions
        const originalSessionCount = userData.workoutSessions.length;
        userData.workoutSessions = userData.workoutSessions.filter(session => {
            const sessionDate = new Date(session.timestamp);
            return sessionDate >= cutoffDate;
        });

        // Clean old backup files from localStorage
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('fitAI_backup_')) {
                const backupDate = key.split('_')[2];
                if (new Date(backupDate) < cutoffDate) {
                    localStorage.removeItem(key);
                }
            }
        });

        const cleanedItems = (originalMealCount - userData.meals.length) +
                           (originalNotificationCount - userData.notifications.length) +
                           (originalSessionCount - userData.workoutSessions.length);

        if (cleanedItems > 0) {
            console.log(`🧹 Cleaned up ${cleanedItems} old data items`);
            addNotification(`Cleaned up ${cleanedItems} old items to free space`, 'info');
        }

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    }
}

// Export data in different formats
function exportData(format = 'json') {
    try {
        let exportData, filename, mimeType;

        switch (format) {
            case 'json':
                exportData = JSON.stringify(userData, null, 2);
                filename = `fitai-data-${new Date().toISOString().split('T')[0]}.json`;
                mimeType = 'application/json';
                break;

            case 'csv':
                exportData = convertToCSV(userData);
                filename = `fitai-data-${new Date().toISOString().split('T')[0]}.csv`;
                mimeType = 'text/csv';
                break;

            default:
                throw new Error('Unsupported export format');
        }

        const blob = new Blob([exportData], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        addNotification(`✅ Data exported as ${format.toUpperCase()}`, 'success');

    } catch (error) {
        console.error('❌ Error exporting data:', error);
        addNotification('❌ Error exporting data', 'error');
    }
}

// Convert data to CSV format
function convertToCSV(data) {
    let csv = '';

    // Export meals
    if (data.meals && data.meals.length > 0) {
        csv += 'MEALS\n';
        csv += 'Date,Name,Calories,Protein,Carbs,Fat\n';
        data.meals.forEach(meal => {
            const date = new Date(meal.timestamp).toLocaleDateString();
            csv += `${date},"${meal.name}",${meal.calories},${meal.protein},${meal.carbs},${meal.fat}\n`;
        });
        csv += '\n';
    }

    // Export workouts
    if (data.workoutPlans && data.workoutPlans.length > 0) {
        csv += 'WORKOUT PLANS\n';
        csv += 'Name,Type,Duration,Difficulty,Exercises\n';
        data.workoutPlans.forEach(plan => {
            const exercises = plan.exercises.map(ex => `${ex.name} ${ex.sets}x${ex.reps}`).join('; ');
            csv += `"${plan.name}","${plan.type}",${plan.duration},"${plan.difficulty}","${exercises}"\n`;
        });
        csv += '\n';
    }

    // Export workout sessions
    if (data.workoutSessions && data.workoutSessions.length > 0) {
        csv += 'WORKOUT SESSIONS\n';
        csv += 'Date,Type,Duration,Intensity\n';
        data.workoutSessions.forEach(session => {
            const date = new Date(session.timestamp).toLocaleDateString();
            csv += `${date},"${session.type}",${session.duration},"${session.intensity}"\n`;
        });
    }

    return csv;
}

// Settings Management Functions
function initializeSettings() {
    updateStorageInfo();
    setupSettingsEventListeners();
    loadSettingsValues();
}

function updateStorageInfo() {
    // Update storage statistics
    document.getElementById('workoutPlansCount').textContent = userData.workoutPlans?.length || 0;
    document.getElementById('workoutSessionsCount').textContent = userData.workoutSessions?.length || 0;
    document.getElementById('mealsCount').textContent = userData.meals?.length || 0;
    document.getElementById('remindersCount').textContent = userData.reminders?.length || 0;

    // Last backup date
    const lastBackup = userData.lastBackup ? new Date(userData.lastBackup).toLocaleDateString() : 'Never';
    document.getElementById('lastBackupDate').textContent = lastBackup;

    // Calculate data size
    const dataSize = new Blob([JSON.stringify(userData)]).size;
    const sizeInKB = Math.round(dataSize / 1024 * 100) / 100;
    document.getElementById('dataSize').textContent = `${sizeInKB} KB`;
}

function setupSettingsEventListeners() {
    // Download backup button
    const downloadBackupBtn = document.getElementById('downloadBackupBtn');
    if (downloadBackupBtn) {
        downloadBackupBtn.addEventListener('click', downloadBackup);
    }

    // Restore data button
    const restoreDataBtn = document.getElementById('restoreDataBtn');
    const restoreFileInput = document.getElementById('restoreFileInput');

    if (restoreDataBtn && restoreFileInput) {
        restoreDataBtn.addEventListener('click', () => {
            restoreFileInput.click();
        });

        restoreFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const backupData = JSON.parse(event.target.result);
                        if (confirm('This will restore your data from the backup file. Current data will be merged. Continue?')) {
                            restoreFromBackup(backupData);
                            updateStorageInfo();
                        }
                    } catch (error) {
                        addNotification('❌ Invalid backup file format', 'error');
                    }
                };
                reader.readAsText(file);
            }
        });
    }

    // Export buttons
    const exportJsonBtn = document.getElementById('exportJsonBtn');
    const exportCsvBtn = document.getElementById('exportCsvBtn');

    if (exportJsonBtn) {
        exportJsonBtn.addEventListener('click', () => exportData('json'));
    }

    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', () => exportData('csv'));
    }

    // Clear data button
    const clearDataBtn = document.getElementById('clearDataBtn');
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', clearAllData);
    }

    // Auto backup toggle
    const autoBackupToggle = document.getElementById('autoBackupToggle');
    if (autoBackupToggle) {
        autoBackupToggle.addEventListener('change', (e) => {
            if (!userData.settings) userData.settings = {};
            userData.settings.autoBackup = e.target.checked;
            saveUserData();
            addNotification(`Auto backup ${e.target.checked ? 'enabled' : 'disabled'}`, 'info');
        });
    }

    // Data retention select
    const dataRetentionSelect = document.getElementById('dataRetentionSelect');
    if (dataRetentionSelect) {
        dataRetentionSelect.addEventListener('change', (e) => {
            if (!userData.settings) userData.settings = {};
            userData.settings.dataRetention = parseInt(e.target.value);
            saveUserData();
            addNotification(`Data retention set to ${e.target.value === '-1' ? 'forever' : e.target.value + ' days'}`, 'info');
        });
    }
}

function loadSettingsValues() {
    // Load current settings values
    const autoBackupToggle = document.getElementById('autoBackupToggle');
    const dataRetentionSelect = document.getElementById('dataRetentionSelect');

    if (autoBackupToggle && userData.settings) {
        autoBackupToggle.checked = userData.settings.autoBackup !== false;
    }

    if (dataRetentionSelect && userData.settings) {
        dataRetentionSelect.value = userData.settings.dataRetention || 90;
    }
}

function clearAllData() {
    const confirmText = 'DELETE ALL DATA';
    const userInput = prompt(`⚠️ WARNING: This will permanently delete ALL your data!\n\nThis includes:\n• All workout plans\n• All workout sessions\n• All meal logs\n• All reminders\n• All notifications\n\nType "${confirmText}" to confirm:`);

    if (userInput === confirmText) {
        // Clear localStorage
        localStorage.removeItem('fitAIUserData');
        localStorage.removeItem('fitAIUserData_backup');
        localStorage.removeItem('hydrationData');

        // Clear backup files
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('fitAI_backup_')) {
                localStorage.removeItem(key);
            }
        });

        // Reinitialize with default data
        initializeDefaultData();

        // Update UI
        updateStorageInfo();
        updateSavedWorkouts();
        updateNotificationCount();
        loadNutritionData();
        updateRemindersList();

        addNotification('✅ All data cleared successfully', 'success');

        // Redirect to home
        setTimeout(() => {
            switchToSection('home');
        }, 2000);

    } else if (userInput !== null) {
        addNotification('❌ Data clear cancelled - incorrect confirmation text', 'error');
    }
}

// Load food database from CSV
function loadFoodDatabase() {
    fetch('calories.csv')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            // Parse CSV data
            const lines = data.split('\n');
            const headers = lines[0].split(',');

            // Skip the header row
            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim() === '') continue;

                const values = lines[i].split(',');
                if (values.length >= 5) {
                    const foodItem = {
                        category: values[0],
                        name: values[1],
                        portion: values[2],
                        calories: parseInt(values[3].replace(' cal', '')),
                        kilojoules: values[4].replace(' kJ', '')
                    };

                    foodDatabase.push(foodItem);

                    // Add category if not already in the list
                    if (!foodCategories.includes(foodItem.category)) {
                        foodCategories.push(foodItem.category);
                    }
                }
            }

            // Sort categories alphabetically
            foodCategories.sort();

            // Create category filter UI
            createFoodCategoryFilters();

            console.log(`Loaded ${foodDatabase.length} food items in ${foodCategories.length} categories`);
            // Populate picker datalist once loaded
            populateFoodPickerDatalist();
        })
        .catch(error => {
            console.error('Error loading food database:', error);
        });
}

// Create food category filters
function createFoodCategoryFilters() {
    const filterContainer = document.createElement('div');
    filterContainer.className = 'food-categories-filter';

    // Add "All" category
    const allButton = document.createElement('button');
    allButton.textContent = 'All';
    allButton.className = 'category-filter-btn active';
    allButton.setAttribute('data-category', 'all');
    filterContainer.appendChild(allButton);

    // Add each category
    foodCategories.forEach(category => {
        const button = document.createElement('button');
        button.textContent = category;
        button.className = 'category-filter-btn';
        button.setAttribute('data-category', category);
        filterContainer.appendChild(button);
    });

    // Add the filter to the food search results
    const searchResults = document.getElementById('foodSearchResults');
    searchResults.insertBefore(filterContainer, searchResults.firstChild);

    // Add event listeners to filter buttons
    document.querySelectorAll('.category-filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active button
            document.querySelectorAll('.category-filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Filter search results by category
            const category = this.getAttribute('data-category');
            const searchTerm = document.getElementById('foodSearchInput').value.trim().toLowerCase();
            filterFoodResults(category, searchTerm);
        });
    });
}

// Filter food results by category and search term
function filterFoodResults(category, searchTerm) {
    let filteredResults = foodDatabase;

    // Filter by category if not "all"
    if (category !== 'all') {
        filteredResults = filteredResults.filter(food => food.category === category);
    }

    // Filter by search term if provided
    if (searchTerm) {
        filteredResults = filteredResults.filter(food =>
            food.name.toLowerCase().includes(searchTerm)
        );
    }

    // Display results (limit to 50 items for performance)
    displayFoodResults(filteredResults.slice(0, 50));
}

// Display food search results
function displayFoodResults(results) {
    const foodResultsList = document.getElementById('foodResultsList');

    if (results.length === 0) {
        foodResultsList.innerHTML = '<p class="empty-state">No results found. Try another search term.</p>';
        return;
    }

    let html = '';
    results.forEach(food => {
        html += `
            <div class="food-result-item" data-name="${food.name}" data-calories="${food.calories}"
                 data-category="${food.category}">
                <div class="food-result-name">${food.name}</div>
                <div class="food-result-category">${food.category}</div>
                <div class="food-result-calories">${food.calories} calories per 100g</div>
            </div>
        `;
    });

    foodResultsList.innerHTML = html;

    // Add event listeners to result items
    document.querySelectorAll('.food-result-item').forEach(item => {
        item.addEventListener('click', function() {
            // Fill form with selected food
            const foodName = this.getAttribute('data-name');
            const caloriesPer100g = parseInt(this.getAttribute('data-calories'));
            const portionSize = parseInt(document.getElementById('portionSize').value) || 100;

            document.getElementById('foodName').value = foodName;
            document.getElementById('calories').value = caloriesPer100g;

            // Calculate total calories based on portion size
            updateTotalCalories(caloriesPer100g, portionSize);

            // Estimate macros based on calories
            // Assuming a balanced distribution: 25% protein, 45% carbs, 30% fat
            const protein = Math.round((caloriesPer100g * 0.25) / 4); // 4 calories per gram of protein
            const carbs = Math.round((caloriesPer100g * 0.45) / 4); // 4 calories per gram of carbs
            const fat = Math.round((caloriesPer100g * 0.30) / 9); // 9 calories per gram of fat

            document.getElementById('protein').value = protein;
            document.getElementById('carbs').value = carbs;
            document.getElementById('fat').value = fat;

            // Hide search results
            document.getElementById('foodSearchResults').classList.add('hidden');
        });
    });
}

// Update total calories based on portion size
function updateTotalCalories(caloriesPer100g, portionSize) {
    const totalCalories = Math.round((caloriesPer100g * portionSize) / 100);
    document.getElementById('totalCalories').textContent = `Total: ${totalCalories} calories for ${portionSize}g`;
    return totalCalories;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Load user data
    loadUserData();

    // Load food database
    loadFoodDatabase();

    // Mobile menu toggle
    mobileMenuToggle.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        // Animate toggle button
        this.classList.toggle('active');
    });

    // Close mobile menu when a link is clicked
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            if (navLinks) navLinks.classList.remove('active');
            if (mobileMenuToggle) mobileMenuToggle.classList.remove('active');
        });
    });

    // Get started button
    getStartedBtn.addEventListener('click', function() {
        userForm.classList.remove('hidden');
        userForm.scrollIntoView({ behavior: 'smooth' });
    });

    // Form submission
    fitnessForm.addEventListener('submit', function(e) {
        e.preventDefault();
        generateWorkoutPlan();
    });

    // Chat toggle
    chatToggle.addEventListener('click', function() {
        chatbot.classList.toggle('hidden');
    });

    // Close chat
    closeChat.addEventListener('click', function() {
        chatbot.classList.add('hidden');
    });

    // Send message
    sendMessage.addEventListener('click', function() {
        sendUserMessage();
    });

    // Send message on enter
    userMessage.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendUserMessage();
        }
    });

    // Filter exercise cards
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.getAttribute('data-category');

            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Filter exercises
            filterExercises(category);
        });
    });

    // Save plan button
    savePlanBtn.addEventListener('click', function() {
        savePlan();
    });

    // Adjust plan button
    adjustPlanBtn.addEventListener('click', function() {
        workoutPlan.classList.add('hidden');
        userForm.classList.remove('hidden');
        userForm.scrollIntoView({ behavior: 'smooth' });
    });

    // Set reminders button
    setRemindersBtn.addEventListener('click', function() {
        switchToSection('reminders');
    });

    // Navigation
    homeLink.addEventListener('click', function(e) {
        e.preventDefault();
        switchToSection('home');
    });

    workoutsLink.addEventListener('click', function(e) {
        e.preventDefault();
        switchToSection('workouts');
    });

    nutritionLink.addEventListener('click', function(e) {
        e.preventDefault();
        switchToSection('nutrition');
    });

    remindersLink.addEventListener('click', function(e) {
        e.preventDefault();
        switchToSection('reminders');
    });

    settingsLink.addEventListener('click', function(e) {
        e.preventDefault();
        switchToSection('settings');
    });

    // Notification bell
    notificationBell.addEventListener('click', function(e) {
        // Only toggle if the click is on the bell image or the notification count
        const bellImage = notificationBell.querySelector('img');
        const notifCount = notificationBell.querySelector('.notification-count');

        if (e.target === bellImage || e.target === notifCount) {
            notificationPanel.classList.toggle('hidden');
        }
    });

    // Clear all notifications
    clearAllNotifications.addEventListener('click', function() {
        userData.notifications = [];
        saveUserData();
        updateNotificationCount();
        updateNotifications();
    });

    // Close panels when clicking outside
    document.addEventListener('click', function(e) {
        if (!notificationPanel.classList.contains('hidden') &&
            !notificationPanel.contains(e.target) &&
            e.target !== notificationBell.querySelector('img') &&
            e.target !== notificationBell.querySelector('.notification-count')) {
            notificationPanel.classList.add('hidden');
        }
    });

    // Load nutrition data from localStorage
    loadNutritionData();

    // Initialize calorie chart
    initCalorieChart();

    // Set user's target calories based on profile if available
    if (userData.profile && userData.profile.weight) {
        const weight = userData.profile.weight;
        const gender = userData.profile.gender;
        const age = userData.profile.age;
        const height = userData.profile.height;

        // Estimate daily calorie needs based on Harris-Benedict equation
        let bmr = 0;
        if (gender === 'male') {
            bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
        } else {
            bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
        }

        // Assuming moderate activity level (1.55 multiplier)
        const dailyCalories = Math.round(bmr * 1.55);
        targetCalories.textContent = dailyCalories;
    }

    // Food form submission
    foodForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addMeal();
    });

    // Search food button
    searchFoodBtn.addEventListener('click', function() {
        foodSearchResults.classList.remove('hidden');
        foodSearchInput.focus();
    });

    // Perform food search
    performFoodSearch.addEventListener('click', function() {
        const searchTerm = foodSearchInput.value.trim().toLowerCase();
        const activeCategory = document.querySelector('.category-filter-btn.active');
        const category = activeCategory ? activeCategory.getAttribute('data-category') : 'all';

        filterFoodResults(category, searchTerm);
    });

    // Food search input on enter
    foodSearchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const searchTerm = this.value.trim().toLowerCase();
            const activeCategory = document.querySelector('.category-filter-btn.active');
            const category = activeCategory ? activeCategory.getAttribute('data-category') : 'all';

            filterFoodResults(category, searchTerm);
        }
    });

    // Check notification permissions
    checkNotificationPermission();

    // Load reminders
    updateRemindersList();

    // Reminder form submission
    reminderForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addReminder();
    });

    // Enable notifications button
    if (enableNotificationsBtn) {
        enableNotificationsBtn.addEventListener('click', function() {
            requestNotificationPermission();
        });
    }

    // Set up reminder checking timer (every minute)
    setInterval(checkReminders, 60000);

    // Check reminders immediately on load
    checkReminders();

    // Hero typewriter effect
    console.log('About to initialize typewriter');
    initHeroTypewriter();

    // Initialize nutrition helpers
    initFoodPicker();
    if (qrUpload) {
        qrUpload.addEventListener('change', handleQrUpload);
    }
    if (fillFromPicker) {
        fillFromPicker.addEventListener('click', applyPickerSelection);
    }

    // Initialize hydration tracker
    initHydrationTracker();

    // Add sample workout data if none exists (for demo purposes)
    if (userData.workoutSessions.length === 0) {
        addSampleWorkoutData();
    }

    // Initialize mobile menu
    initMobileMenu();

    // Initialize chatbot
    initChatbot();

    if (connectWearableBtn) connectWearableBtn.addEventListener('click', connectWearable);
    if (disconnectWearableBtn) disconnectWearableBtn.addEventListener('click', disconnectWearable);

    // Calculate total calories when portion size changes
    document.getElementById('portionSize').addEventListener('input', function() {
        const caloriesPer100g = parseInt(document.getElementById('calories').value) || 0;
        const portionSize = parseInt(this.value) || 0;
        updateTotalCalories(caloriesPer100g, portionSize);
    });

    // Calculate total calories when calories per 100g changes
    document.getElementById('calories').addEventListener('input', function() {
        const caloriesPer100g = parseInt(this.value) || 0;
        const portionSize = parseInt(document.getElementById('portionSize').value) || 0;
        updateTotalCalories(caloriesPer100g, portionSize);
    });
});

// Typewriter animation for hero heading
function initHeroTypewriter() {
    const element = document.getElementById('typewriter');
    if (!element) {
        console.log('Typewriter element not found');
        return;
    }

    const fullText = element.getAttribute('data-text') || 'Your Personal AI Fitness Coach';
    console.log('Starting typewriter with text:', fullText);

    const typingSpeedMs = 80; // per character
    const startDelayMs = 1000; // initial delay

    // Clear any existing content and show we're starting
    element.textContent = '';
    element.style.minWidth = '20px'; // Ensure element has some width

    let index = 0;

    function typeNext() {
        if (index < fullText.length) {
            const currentText = fullText.slice(0, index + 1);
            element.textContent = currentText;
            console.log('Typed:', currentText);
            index++;
            setTimeout(typeNext, typingSpeedMs);
        } else {
            console.log('Typewriter animation completed');
            element.style.minWidth = 'auto'; // Reset width
        }
    }

    // Start the animation with a delay
    console.log('Will start typewriter in', startDelayMs, 'ms');
    setTimeout(() => {
        console.log('Starting typewriter animation now');
        typeNext();
    }, startDelayMs);

    // Fallback: if animation doesn't start within 3 seconds, show full text
    setTimeout(() => {
        if (element.textContent.length === 0) {
            console.log('Typewriter fallback: showing full text');
            element.textContent = fullText;
        }
    }, 3000);
}

// Build datalist for food quick-pick
function populateFoodPickerDatalist() {
    if (!foodPickerList) return;
    const names = Array.from(new Set(foodDatabase.map(f => f.name))).sort((a, b) => a.localeCompare(b));
    foodPickerList.innerHTML = names.map(n => `<option value="${n}"></option>`).join('');
}

function initFoodPicker() {
    // If database already loaded, populate now; otherwise loadFoodDatabase will call it later
    if (foodDatabase.length > 0) populateFoodPickerDatalist();
}

function findFoodByName(query) {
    if (!query) return null;
    const q = query.toLowerCase().trim();
    // Exact match first
    let item = foodDatabase.find(f => f.name.toLowerCase() === q);
    if (item) return item;
    // Starts with
    item = foodDatabase.find(f => f.name.toLowerCase().startsWith(q));
    if (item) return item;
    // Includes
    return foodDatabase.find(f => f.name.toLowerCase().includes(q)) || null;
}

function setFoodFieldsFromItem(item) {
    if (!item) return;
    const caloriesPer100g = parseInt(item.calories) || 0;
    const portionSize = parseInt(document.getElementById('portionSize').value) || 100;
    document.getElementById('foodName').value = item.name;
    document.getElementById('calories').value = caloriesPer100g;

    // Estimate macros (25% protein, 45% carbs, 30% fat)
    const prot = Math.round((caloriesPer100g * 0.25) / 4);
    const carb = Math.round((caloriesPer100g * 0.45) / 4);
    const ft = Math.round((caloriesPer100g * 0.30) / 9);
    document.getElementById('protein').value = prot;
    document.getElementById('carbs').value = carb;
    document.getElementById('fat').value = ft;
    updateTotalCalories(caloriesPer100g, portionSize);
}

function applyPickerSelection() {
    if (!foodPickerInput) return;
    const query = foodPickerInput.value.trim();
    if (!query) return;
    const item = findFoodByName(query);
    if (item) {
        setFoodFieldsFromItem(item);
    } else {
        alert('No matching food found in the database.');
    }
}

// Handle QR upload using jsQR (expects QR content with either name or calories)
function handleQrUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            try {
                // jsQR is loaded via CDN
                const result = window.jsQR ? jsQR(imageData.data, canvas.width, canvas.height) : null;
                if (result && result.data) {
                    const text = String(result.data);
                    // Try to parse calories
                    const kcalMatch = text.match(/(\d+)\s?kcal/i) || text.match(/calories?\s*[:=]?\s*(\d+)/i);
                    if (kcalMatch) {
                        const kcal = parseInt(kcalMatch[1]);
                        if (!Number.isNaN(kcal)) {
                            document.getElementById('calories').value = kcal;
                            const portionSize = parseInt(document.getElementById('portionSize').value) || 100;
                            updateTotalCalories(kcal, portionSize);
                        }
                    }
                    // Try to match a food name
                    const names = Array.from(new Set(foodDatabase.map(f => f.name))).sort((a,b)=>b.length-a.length);
                    let matched = null;
                    const lower = text.toLowerCase();
                    for (const name of names) {
                        if (lower.includes(name.toLowerCase())) { matched = name; break; }
                    }
                    if (matched) {
                        const item = findFoodByName(matched);
                        if (item) setFoodFieldsFromItem(item);
                    } else {
                        // Fallback: put decoded text into name field for user editing
                        document.getElementById('foodName').value = text.substring(0, 80);
                    }
                    addNotification('QR decoded successfully.', 'success');
                } else {
                    alert('Could not decode QR from the image.');
                }
            } catch (err) {
                console.error('QR decode error:', err);
                alert('Error decoding QR image.');
            }
        };
        img.onerror = () => alert('Invalid image file.');
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Web Bluetooth: Heart Rate and Battery Level
async function connectWearable() {
    try {
        if (!navigator.bluetooth) {
            alert('Web Bluetooth is not supported in this browser. Use Chrome on desktop with https or localhost.');
            return;
        }
        deviceStatus && (deviceStatus.textContent = 'Status: Connecting...');
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ services: ['heart_rate'] }],
            optionalServices: ['battery_service']
        });
        wearableDevice = device;
        wearableDevice.addEventListener('gattserverdisconnected', () => {
            deviceStatus && (deviceStatus.textContent = 'Status: Disconnected');
        });
        const server = await device.gatt.connect();

        // Heart Rate service
        const hrService = await server.getPrimaryService('heart_rate');
        heartRateChar = await hrService.getCharacteristic('heart_rate_measurement');
        await heartRateChar.startNotifications();
        heartRateChar.addEventListener('characteristicvaluechanged', handleHeartRateMeasurement);

        // Battery service (optional)
        try {
            const battService = await server.getPrimaryService('battery_service');
            batteryLevelChar = await battService.getCharacteristic('battery_level');
            const battVal = await batteryLevelChar.readValue();
            const level = battVal.getUint8(0);
            if (batteryLevelValue) batteryLevelValue.textContent = String(level);
        } catch (_) {
            // Ignore if device doesn't expose battery service
        }

        deviceStatus && (deviceStatus.textContent = 'Status: Connected');
    } catch (err) {
        console.error('Wearable connect error:', err);
        alert('Failed to connect to wearable.');
        deviceStatus && (deviceStatus.textContent = 'Status: Not connected');
    }
}

function disconnectWearable() {
    try {
        if (wearableDevice && wearableDevice.gatt.connected) {
            wearableDevice.gatt.disconnect();
        }
        deviceStatus && (deviceStatus.textContent = 'Status: Disconnected');
    } catch (err) {
        console.error('Wearable disconnect error:', err);
    }
}

function handleHeartRateMeasurement(event) {
    const data = event.target.value; // DataView
    // Parse Heart Rate Measurement per Bluetooth spec
    const flags = data.getUint8(0);
    const hrValue16Bits = flags & 0x01;
    let index = 1;
    let hr;
    if (hrValue16Bits) {
        hr = data.getUint16(index, /*littleEndian=*/true);
        index += 2;
    } else {
        hr = data.getUint8(index);
        index += 1;
    }
    if (heartRateValue) heartRateValue.textContent = String(hr);
}

// Removed PillNav animation helper

// Switch between sections
function switchToSection(section) {
    // Hide all sections
    homeSection.classList.add('hidden');
    workoutsSection.classList.add('hidden');
    nutritionSection.classList.add('hidden');
    remindersSection.classList.add('hidden');
    settingsSection.classList.add('hidden');

    // Remove active class from all links
    homeLink.classList.remove('active');
    workoutsLink.classList.remove('active');
    nutritionLink.classList.remove('active');
    remindersLink.classList.remove('active');
    settingsLink.classList.remove('active');

    // Show selected section and mark link as active
    switch(section) {
        case 'home':
            homeSection.classList.remove('hidden');
            homeLink.classList.add('active');
            break;
        case 'workouts':
            workoutsSection.classList.remove('hidden');
            workoutsLink.classList.add('active');
            updateSavedWorkouts();
            initWorkoutHeatmap();
            break;
        case 'nutrition':
            nutritionSection.classList.remove('hidden');
            nutritionLink.classList.add('active');
            break;
        case 'reminders':
            remindersSection.classList.remove('hidden');
            remindersLink.classList.add('active');
            updateRemindersList();
            break;
        case 'settings':
            settingsSection.classList.remove('hidden');
            settingsLink.classList.add('active');
            initializeSettings();
            break;
    }

    window.scrollTo(0, 0);
}

// Update saved workouts display
function updateSavedWorkouts() {
    if (userData.workoutPlans.length === 0) {
        savedWorkoutsList.innerHTML = '<p class="empty-state">You haven\'t saved any workout plans yet.</p>';
        return;
    }

    let html = '';
    userData.workoutPlans.forEach((plan, index) => {
        html += `
            <div class="saved-workout-card">
                <div class="saved-workout-header">
                    <span class="saved-workout-title">${plan.name}</span>
                    <div class="saved-workout-actions">
                        <button class="saved-workout-btn view-workout" data-index="${index}">View</button>
                        <button class="saved-workout-btn delete-workout" data-index="${index}">Delete</button>
                    </div>
                </div>
                <div class="saved-workout-info">
                    <span class="saved-workout-stat">Goal: ${capitalize(plan.goal)}</span>
                    <span class="saved-workout-stat">Level: ${capitalize(plan.experience)}</span>
                    <span class="saved-workout-stat">Days: ${plan.days} per week</span>
                    <span class="saved-workout-stat">Created: ${plan.dateCreated}</span>
                </div>
                <p>${plan.description}</p>
            </div>
        `;
    });

    savedWorkoutsList.innerHTML = html;

    // Add event listeners to buttons
    document.querySelectorAll('.view-workout').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            loadWorkoutPlan(index);
        });
    });

    document.querySelectorAll('.delete-workout').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            deleteWorkoutPlan(index);
        });
    });
}

// Load a saved workout plan
function loadWorkoutPlan(index) {
    const plan = userData.workoutPlans[index];

    // Display the plan
    planInfo.innerHTML = plan.planInfoHTML;
    workoutSchedule.innerHTML = plan.scheduleHTML;
    exerciseList.innerHTML = plan.exercisesHTML;

    // Show workout plan section
    switchToSection('home');
    userForm.classList.add('hidden');
    workoutPlan.classList.remove('hidden');
    workoutPlan.scrollIntoView({ behavior: 'smooth' });

    // Add notification
    addNotification(`Workout plan "${plan.name}" loaded.`, 'success');
}

// Delete a workout plan
function deleteWorkoutPlan(index) {
    const planName = userData.workoutPlans[index].name;
    userData.workoutPlans.splice(index, 1);
    saveUserData();
    updateSavedWorkouts();

    // Add notification
    addNotification(`Workout plan "${planName}" deleted.`, 'info');
}

// Calculate BMI
function calculateBMI(weight, height) {
    // Convert height from cm to m
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
}

// Generate workout plan based on user input
function generateWorkoutPlan() {
    // Get form values
    const name = document.getElementById('name').value;
    const age = parseInt(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    const height = parseInt(document.getElementById('height').value);
    const weight = parseInt(document.getElementById('weight').value);
    const goal = document.getElementById('goal').value;
    const experience = document.getElementById('experience').value;
    const time = parseInt(document.getElementById('time').value);
    const limitations = document.getElementById('limitations').value;

    // Save user profile data
    userData.profile = {
        name,
        age,
        gender,
        height,
        weight,
        goal,
        experience,
        time,
        limitations
    };

    // Calculate BMI
    const bmi = calculateBMI(weight, height);

    // Get the workout split based on goal and experience
    const workoutSplit = workoutData.splits[goal][experience];

    // Generate workout info HTML
    let infoHTML = `
        <div class="user-stats">
            <h3>User Profile</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Age:</strong> ${age}</p>
            <p><strong>BMI:</strong> ${bmi} (${getBMICategory(bmi)})</p>
            <p><strong>Goal:</strong> ${capitalize(goal)}</p>
            <p><strong>Experience Level:</strong> ${capitalize(experience)}</p>
        </div>
        <div class="plan-overview">
            <h3>${workoutSplit.name}</h3>
            <p>${workoutSplit.description}</p>
            <p><strong>Training Days:</strong> ${workoutSplit.days} days per week</p>
        </div>
    `;

    // Generate workout schedule HTML
    let scheduleHTML = '<h3>Weekly Schedule</h3><div class="schedule-grid">';

    workoutSplit.schedule.forEach(day => {
        scheduleHTML += `
            <div class="schedule-day">
                <div class="day-header">${day.day}</div>
                <div class="day-content">${day.focus}</div>
            </div>
        `;
    });

    scheduleHTML += '</div>';

    // Generate recommended exercises
    let exercisesHTML = '';

    // Select appropriate exercises based on goal and experience
    const exerciseCategories = selectExerciseCategories(goal);

    exerciseCategories.forEach(category => {
        // Get exercises for this category
        const categoryExercises = workoutData.exercises[category];

        // Select a subset of exercises based on experience
        const numExercises = experience === 'beginner' ? 1 : (experience === 'intermediate' ? 2 : 3);
        const selectedExercises = categoryExercises.slice(0, numExercises);

        selectedExercises.forEach(exercise => {
            exercisesHTML += `
                <div class="exercise-item">
                    <img src="${exercise.gif}" alt="${exercise.name}">
                    <div class="exercise-details">
                        <h4>${exercise.name}</h4>
                        <p>${exercise.description}</p>
                        <p><strong>Sets:</strong> ${exercise.sets} | <strong>Reps:</strong> ${exercise.reps}</p>
                    </div>
                </div>
            `;
        });
    });

    // Update HTML
    planInfo.innerHTML = infoHTML;
    workoutSchedule.innerHTML = scheduleHTML;
    exerciseList.innerHTML = exercisesHTML;

    // Show workout plan section
    userForm.classList.add('hidden');
    workoutPlan.classList.remove('hidden');
    workoutPlan.scrollIntoView({ behavior: 'smooth' });

    // Add notification
    addNotification("Workout plan generated successfully!", "success");
}

// Save workout plan to storage
function savePlan() {
    // Create a plan object
    const plan = {
        id: Date.now(), // Unique identifier
        name: workoutData.splits[userData.profile.goal][userData.profile.experience].name,
        goal: userData.profile.goal,
        experience: userData.profile.experience,
        days: workoutData.splits[userData.profile.goal][userData.profile.experience].days,
        description: workoutData.splits[userData.profile.goal][userData.profile.experience].description,
        dateCreated: new Date().toLocaleDateString(),
        planInfoHTML: planInfo.innerHTML,
        scheduleHTML: workoutSchedule.innerHTML,
        exercisesHTML: exerciseList.innerHTML
    };

    // Add to workout plans array
    userData.workoutPlans.push(plan);

    // Save to localStorage
    saveUserData();

    // Add notification
    addNotification("Workout plan saved successfully!", "success");
}

// Select exercise categories based on goal
function selectExerciseCategories(goal) {
    switch(goal) {
        case 'weightloss':
            return ['chest', 'back', 'leg', 'shoulder'];
        case 'muscle':
            return ['chest', 'back', 'shoulder', 'biceps', 'triceps', 'leg'];
        case 'toning':
            return ['chest', 'back', 'shoulder', 'leg', 'biceps'];
        case 'endurance':
            return ['chest', 'back', 'leg'];
        case 'strength':
            return ['chest', 'back', 'shoulder', 'leg'];
        default:
            return ['chest', 'back', 'leg'];
    }
}

// Get BMI category
function getBMICategory(bmi) {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
}

// Filter exercises by category
function filterExercises(category) {
    exerciseCards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Send user message in chatbot
function sendUserMessage() {
    const message = userMessage.value.trim();
    if (message === '') return;

    // Add user message to chat
    addMessageToChat(message, 'user');

    // Clear input field
    userMessage.value = '';

    // Show typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('message', 'bot', 'typing-indicator');
    typingIndicator.innerHTML = `
        <img src="ai.png" class="bot-avatar">
        <div class="message-content">Typing...</div>
    `;
    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Send message to Gemini API backend
    fetch('http://127.0.0.1:5000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
    })
    .then(response => response.json())
    .then(data => {
        // Remove typing indicator
        const typingIndicators = document.querySelectorAll('.typing-indicator');
        typingIndicators.forEach(indicator => indicator.remove());

        // Add bot response
        if (data.error) {
            addMessageToChat('Sorry, I encountered an error. Please try again later.', 'bot');
            console.error('Error:', data.error);
        } else {
            addMessageToChat(data.response, 'bot');
        }
    })
    .catch(error => {
        // Remove typing indicator
        const typingIndicators = document.querySelectorAll('.typing-indicator');
        typingIndicators.forEach(indicator => indicator.remove());

        // Add error message
        addMessageToChat('Sorry, I encountered an error. Please try again later.', 'bot');
        console.error('Error:', error);
    });
}

// Add message to chat
function addMessageToChat(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);

    if (sender === 'bot') {
        messageElement.innerHTML = `
            <img src="ai.png" class="bot-avatar">
            <div class="message-content">${message}</div>
        `;
    } else {
        messageElement.innerHTML = `
            <div class="message-content">${message}</div>
        `;
    }

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Generate chatbot response
function generateChatbotResponse(message) {
    message = message.toLowerCase();

    // Check for keywords in message
    if (containsAny(message, ['hello', 'hi', 'hey', 'greetings'])) {
        return getRandomResponse(chatbotResponses.greetings);
    } else if (containsAny(message, ['workout', 'exercise', 'training', 'routine', 'plan'])) {
        return getRandomResponse(chatbotResponses.workout);
    } else if (containsAny(message, ['food', 'eat', 'diet', 'nutrition', 'calories'])) {
        return getRandomResponse(chatbotResponses.nutrition);
    } else if (containsAny(message, ['motivation', 'motivate', 'inspired', 'discouraged', 'lazy'])) {
        return getRandomResponse(chatbotResponses.motivation);
    } else {
        return getRandomResponse(chatbotResponses.fallback);
    }
}

// Check if string contains any of the keywords
function containsAny(str, keywords) {
    return keywords.some(keyword => str.includes(keyword));
}

// Get random response from array
function getRandomResponse(responses) {
    const index = Math.floor(Math.random() * responses.length);
    return responses[index];
}

// Add notification
function addNotification(message, type = 'info') {
    const notification = {
        id: Date.now(),
        message,
        type,
        time: new Date().toLocaleTimeString(),
        read: false
    };

    userData.notifications.unshift(notification);

    // Limit to 10 notifications
    if (userData.notifications.length > 10) {
        userData.notifications.pop();
    }

    saveUserData();
    updateNotificationCount();
    updateNotifications();
}

// Update notification count
function updateNotificationCount() {
    const unreadCount = userData.notifications.filter(n => !n.read).length;
    notificationCount.textContent = unreadCount;

    if (unreadCount > 0) {
        notificationCount.style.display = 'flex';
    } else {
        notificationCount.style.display = 'none';
    }
}

// Update notifications display
function updateNotifications() {
    if (userData.notifications.length === 0) {
        notificationList.innerHTML = '<p class="empty-state">No notifications at the moment.</p>';
        return;
    }

    let html = '';
    userData.notifications.forEach(notification => {
        html += `
            <div class="notification-item" data-id="${notification.id}">
                <div class="notification-title">${notification.message}</div>
                <div class="notification-time">${notification.time}</div>
            </div>
        `;

        // Mark as read
        notification.read = true;
    });

    notificationList.innerHTML = html;
    saveUserData();
    updateNotificationCount();
}

// Capitalize first letter
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Load nutrition data from localStorage
function loadNutritionData() {
    // Update meal list
    updateMealList();

    // Update nutrition summary
    updateNutritionSummary();
}

// Initialize calorie chart
function initCalorieChart() {
    if (!calorieChart) return;
    if (calorieChartInstance) calorieChartInstance.destroy();

    // Get data for last 7 days
    const dates = [];
    const calorieData = [];

    // Current date
    const today = new Date();

    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        dates.push(date.toLocaleDateString('en-US', { weekday: 'short' }));

        // Get calories for this date
        const dayCalories = getDayCalories(date);
        calorieData.push(dayCalories);
    }

    // Create chart
    const ctx = calorieChart.getContext('2d');
    calorieChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                label: 'Calories',
                data: calorieData,
                backgroundColor: 'rgba(255, 87, 34, 0.7)',
                borderColor: 'rgba(255, 87, 34, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Calories (kcal)'
                    }
                }
            }
        }
    });
}

// Get calories for a specific date
function getDayCalories(date) {
    const dateString = date.toLocaleDateString();

    // Filter meals for this date
    const dayMeals = userData.meals.filter(meal => {
        const mealDate = new Date(meal.timestamp);
        return mealDate.toLocaleDateString() === dateString;
    });

    // Sum calories
    return dayMeals.reduce((sum, meal) => sum + meal.calories, 0);
}

// Add a meal
function addMeal() {
    // Get form values
    const name = foodName.value.trim();
    const type = mealType.value;
    const portionSize = parseInt(document.getElementById('portionSize').value) || 100;
    const caloriesPer100g = parseInt(calories.value) || 0;
    const prot = parseInt(protein.value) || 0;
    const carb = parseInt(carbs.value) || 0;
    const ft = parseInt(fat.value) || 0;

    // Calculate total calories based on portion size
    const totalCalories = Math.round((caloriesPer100g * portionSize) / 100);

    // Calculate adjusted macros based on portion size
    const adjustedProtein = Math.round((prot * portionSize) / 100);
    const adjustedCarbs = Math.round((carb * portionSize) / 100);
    const adjustedFat = Math.round((ft * portionSize) / 100);

    // Create meal object
    const meal = {
        id: Date.now(),
        name,
        type,
        portionSize,
        caloriesPer100g,
        calories: totalCalories,
        protein: adjustedProtein,
        carbs: adjustedCarbs,
        fat: adjustedFat,
        timestamp: new Date().toISOString()
    };

    // Add to meals array
    userData.meals.push(meal);

    // Save to localStorage
    saveUserData();

    // Update UI
    updateMealList();
    updateNutritionSummary();
    initCalorieChart();

    // Reset form
    foodForm.reset();
    document.getElementById('portionSize').value = '100'; // Reset to default
    document.getElementById('totalCalories').textContent = ''; // Clear total calories

    // Add notification
    addNotification(`Meal "${name}" added to food log.`, 'success');
}

// Update meal list
function updateMealList() {
    // Get today's meals
    const today = new Date().toLocaleDateString();
    const todayMeals = userData.meals.filter(meal => {
        const mealDate = new Date(meal.timestamp);
        return mealDate.toLocaleDateString() === today;
    });

    if (todayMeals.length === 0) {
        mealList.innerHTML = '<p class="empty-state">No meals logged today.</p>';
        return;
    }

    let html = '';
    todayMeals.forEach(meal => {
        // Determine if this meal has portion information
        const portionInfo = meal.portionSize ? `(${meal.portionSize}g)` : '';

        html += `
            <div class="meal-item">
                <div class="meal-info">
                    <div class="meal-name">${meal.name} ${portionInfo}</div>
                    <div class="meal-type">${meal.type}</div>
                    <div class="meal-macros">
                        <span>P: ${meal.protein}g</span>
                        <span>C: ${meal.carbs}g</span>
                        <span>F: ${meal.fat}g</span>
                    </div>
                </div>
                <div class="meal-calories">${meal.calories} kcal</div>
                <button class="delete-meal" data-id="${meal.id}">×</button>
            </div>
        `;
    });

    mealList.innerHTML = html;

    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-meal').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            deleteMeal(id);
        });
    });
}

// Delete a meal
function deleteMeal(id) {
    // Find meal index
    const index = userData.meals.findIndex(meal => meal.id === id);

    if (index !== -1) {
        const mealName = userData.meals[index].name;

        // Remove meal
        userData.meals.splice(index, 1);

        // Save to localStorage
        saveUserData();

        // Update UI
        updateMealList();
        updateNutritionSummary();
        initCalorieChart();

        // Add notification
        addNotification(`Meal "${mealName}" removed from food log.`, 'info');
    }
}

// Update nutrition summary
function updateNutritionSummary() {
    // Get today's meals
    const today = new Date().toLocaleDateString();
    const todayMeals = userData.meals.filter(meal => {
        const mealDate = new Date(meal.timestamp);
        return mealDate.toLocaleDateString() === today;
    });

    // Calculate totals
    const totalCalories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalProtein = todayMeals.reduce((sum, meal) => sum + meal.protein, 0);
    const totalCarbs = todayMeals.reduce((sum, meal) => sum + meal.carbs, 0);
    const totalFat = todayMeals.reduce((sum, meal) => sum + meal.fat, 0);

    // Update UI
    currentCalories.textContent = totalCalories;
    proteinValue.textContent = totalProtein + 'g';
    carbsValue.textContent = totalCarbs + 'g';
    fatValue.textContent = totalFat + 'g';

    // Calculate percentages for progress bars
    const targetCal = parseInt(targetCalories.textContent);
    const caloriePercentage = Math.min((totalCalories / targetCal) * 100, 100);

    // Recommended macro distribution (protein 30%, carbs 45%, fat 25%)
    const targetProtein = (targetCal * 0.3) / 4; // 4 calories per gram of protein
    const targetCarbs = (targetCal * 0.45) / 4; // 4 calories per gram of carbs
    const targetFat = (targetCal * 0.25) / 9; // 9 calories per gram of fat

    const proteinPercentage = Math.min((totalProtein / targetProtein) * 100, 100);
    const carbsPercentage = Math.min((totalCarbs / targetCarbs) * 100, 100);
    const fatPercentage = Math.min((totalFat / targetFat) * 100, 100);

    // Update progress bars
    proteinProgress.style.width = proteinPercentage + '%';
    carbsProgress.style.width = carbsPercentage + '%';
    fatProgress.style.width = fatPercentage + '%';
}

// Check notification permission
function checkNotificationPermission() {
    if (!('Notification' in window)) {
        // Browser doesn't support notifications
        if (reminderPermissions) reminderPermissions.classList.remove('hidden');
        if (enableNotificationsBtn) {
            enableNotificationsBtn.disabled = true;
            enableNotificationsBtn.textContent = 'Notifications Not Supported';
        }
        return;
    }

    if (Notification.permission === 'granted') {
        // Permission already granted
        if (reminderPermissions) reminderPermissions.classList.add('hidden');
    } else {
        // Permission not granted yet
        if (reminderPermissions) reminderPermissions.classList.remove('hidden');
    }
}

// Request notification permission
function requestNotificationPermission() {
    if (!('Notification' in window)) {
        alert('This browser does not support desktop notifications');
        return;
    }

    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            reminderPermissions.classList.add('hidden');

            // Show sample notification
            const notification = new Notification('Notifications Enabled', {
                body: 'You will now receive workout and nutrition reminders.',
                icon: 'ai.png'
            });

            // Add notification to list
            addNotification('Notifications enabled successfully!', 'success');
        }
    });
}

// Add a reminder
function addReminder() {
    // Get form values
    const title = reminderTitle.value.trim();
    const type = reminderType.value;
    const time = reminderTime.value;
    const note = reminderNote.value.trim();

    // Get selected days
    const days = [];
    document.querySelectorAll('.days-selector input:checked').forEach(checkbox => {
        days.push(checkbox.value);
    });

    if (days.length === 0) {
        alert('Please select at least one day for the reminder.');
        return;
    }

    // Create reminder object
    const reminder = {
        id: Date.now(),
        title,
        type,
        time,
        days,
        note,
        enabled: true
    };

    // Add to reminders array
    userData.reminders.push(reminder);

    // Save to localStorage
    saveUserData();

    // Update UI
    updateRemindersList();

    // Reset form
    reminderForm.reset();

    // Reset day checkboxes to default (weekdays checked)
    document.querySelectorAll('.days-selector input').forEach(checkbox => {
        const isWeekday = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(checkbox.value);
        checkbox.checked = isWeekday;
    });

    // Add notification
    addNotification(`Reminder "${title}" set successfully.`, 'success');
}

// Update reminders list
function updateRemindersList() {
    if (userData.reminders.length === 0) {
        remindersList.innerHTML = `
            <div class="no-reminders">
                <div class="no-reminders-icon">⏰</div>
                <h4>No reminders set yet</h4>
                <p>Create your first reminder above to get started!</p>
            </div>
        `;
        return;
    }

    let html = '';
    userData.reminders.forEach(reminder => {
        // Format time
        const timeFormatted = formatTime(reminder.time);

        // Format days
        const daysFormatted = reminder.days.map(day =>
            day.charAt(0).toUpperCase() + day.slice(1, 3)
        ).join(', ');

        // Get type emoji
        const typeEmojis = {
            workout: '🏋️',
            nutrition: '🍎',
            hydration: '💧',
            general: '📋'
        };

        html += `
            <div class="reminder-item">
                <div class="reminder-info">
                    <div class="reminder-title">${reminder.title}</div>
                    <div class="reminder-details">
                        <span class="reminder-type">${typeEmojis[reminder.type] || '📋'} ${reminder.type}</span>
                        <span class="reminder-time">⏰ ${timeFormatted}</span>
                        <span class="reminder-days">📅 ${daysFormatted}</span>
                    </div>
                    ${reminder.note ? `<div class="reminder-note" style="margin-top: 8px; font-size: 0.9rem; color: var(--gray);">${reminder.note}</div>` : ''}
                </div>
                <div class="reminder-actions">
                    <button class="reminder-btn edit-reminder" data-id="${reminder.id}">✏️ Edit</button>
                    <button class="reminder-btn delete delete-reminder" data-id="${reminder.id}">🗑️ Delete</button>
                </div>
            </div>
        `;
    });

    remindersList.innerHTML = html;

    // Add event listeners to buttons
    document.querySelectorAll('.delete-reminder').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            deleteReminder(id);
        });
    });

    document.querySelectorAll('.edit-reminder').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            editReminder(id);
        });
    });
}

// Format time (24h to 12h)
function formatTime(time) {
    const [hour, minute] = time.split(':');
    const hourInt = parseInt(hour);
    const period = hourInt >= 12 ? 'PM' : 'AM';
    const hour12 = hourInt > 12 ? hourInt - 12 : (hourInt === 0 ? 12 : hourInt);

    return `${hour12}:${minute} ${period}`;
}

// Delete a reminder
function deleteReminder(id) {
    // Find reminder index
    const index = userData.reminders.findIndex(reminder => reminder.id === id);

    if (index !== -1) {
        const reminderTitle = userData.reminders[index].title;

        // Remove reminder
        userData.reminders.splice(index, 1);

        // Save to localStorage
        saveUserData();

        // Update UI
        updateRemindersList();

        // Add notification
        addNotification(`Reminder "${reminderTitle}" deleted.`, 'info');
    }
}

// Edit a reminder
function editReminder(id) {
    // Find reminder
    const reminder = userData.reminders.find(reminder => reminder.id === id);

    if (reminder) {
        // Fill form with reminder data
        reminderTitle.value = reminder.title;
        reminderType.value = reminder.type;
        reminderTime.value = reminder.time;
        reminderNote.value = reminder.note || '';

        // Check day checkboxes
        document.querySelectorAll('.days-selector input').forEach(checkbox => {
            checkbox.checked = reminder.days.includes(checkbox.value);
        });

        // Scroll to form
        reminderForm.scrollIntoView({ behavior: 'smooth' });

        // Delete the old reminder
        deleteReminder(id);
    }
}

// Check for due reminders
function checkReminders() {
    if (Notification.permission !== 'granted') {
        return;
    }

    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase().substring(0, 3);
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMinute = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHour}:${currentMinute}`;

    userData.reminders.forEach(reminder => {
        if (reminder.enabled &&
            reminder.days.includes(currentDay) &&
            reminder.time === currentTime) {

            // Send notification
            const notification = new Notification(reminder.title, {
                body: reminder.note || `It's time for your ${reminder.type} activity.`,
                icon: 'ai.png'
            });

            // Add to notifications list
            addNotification(`Reminder: ${reminder.title}`, 'reminder');
        }
    });
}

// Fitness data and templates (keep existing data)
const workoutData = {
    // Sample exercise data by category
    exercises: {
        chest: [
            { name: "Bench Press", gif: "chest1.gif", sets: "3-4", reps: "8-12", description: "Lie on a bench and push the barbell upward from your chest." },
            { name: "Incline Dumbbell Press", gif: "chest2.gif", sets: "3", reps: "10-12", description: "Lie on an inclined bench and push dumbbells upward." },
            { name: "Cable Fly", gif: "chest3.gif", sets: "3", reps: "12-15", description: "Using cable machine, bring your arms together in front of your chest." },
            { name: "Push-Ups", gif: "chest4.gif", sets: "3", reps: "10-20", description: "Body-weight exercise pushing away from the ground." },
            { name: "Chest Dips", gif: "chest5.gif", sets: "3", reps: "8-12", description: "Using parallel bars, lower your body and push back up." }
        ],
        back: [
            { name: "Lat Pulldown", gif: "back1.gif", sets: "3-4", reps: "10-12", description: "Pull the bar down to your chest using a wide grip." },
            { name: "Bent Over Row", gif: "back2.gif", sets: "3", reps: "8-12", description: "Bend at waist and pull a barbell to your abdomen." },
            { name: "Pull-Ups", gif: "back3.gif", sets: "3", reps: "6-12", description: "Pull your body up to a bar using your back muscles." },
            { name: "T-Bar Row", gif: "back4.gif", sets: "3", reps: "8-12", description: "Using a t-bar machine, pull weight toward your chest." },
            { name: "Cable Row", gif: "back5.gif", sets: "3", reps: "10-12", description: "Using a cable machine, pull the handle to your abdomen." }
        ],
        shoulder: [
            { name: "Overhead Press", gif: "shoulder1.gif", sets: "3-4", reps: "8-10", description: "Push weight overhead from shoulder height." },
            { name: "Lateral Raise", gif: "shoulder2.gif", sets: "3", reps: "12-15", description: "Raise dumbbells to the sides to shoulder height." },
            { name: "Front Raise", gif: "shoulder3.gif", sets: "3", reps: "12-15", description: "Raise weights in front of you to shoulder height." },
            { name: "Face Pull", gif: "shoulder4.gif", sets: "3", reps: "12-15", description: "Pull rope attachment to your face using cables." },
            { name: "Reverse Fly", gif: "shoulder5.gif", sets: "3", reps: "12-15", description: "Raise weights to sides while bent over." }
        ],
        biceps: [
            { name: "Barbell Curl", gif: "biceps1.gif", sets: "3", reps: "10-12", description: "Curl a barbell up toward your shoulders." },
            { name: "Hammer Curl", gif: "biceps2.gif", sets: "3", reps: "10-12", description: "Curl dumbbells with palms facing each other." },
            { name: "Preacher Curl", gif: "biceps3.gif", sets: "3", reps: "10-12", description: "Curl barbell using a preacher bench for support." }
        ],
        triceps: [
            { name: "Triceps Pushdown", gif: "triceps1.gif", sets: "3", reps: "12-15", description: "Push cable attachment down using triceps." },
            { name: "Overhead Extension", gif: "triceps2.gif", sets: "3", reps: "10-12", description: "Extend weight overhead using triceps." }
        ],
        leg: [
            { name: "Squats", gif: "leg.gif", sets: "4", reps: "8-12", description: "Bend knees and hips to lower your body down and up." },
            { name: "Leg Press", gif: "leg2.gif", sets: "3-4", reps: "10-12", description: "Push weight away using leg press machine." },
            { name: "Lunges", gif: "leg3.gif", sets: "3", reps: "10-12 each leg", description: "Step forward into a lunge position and return." },
            { name: "Leg Extensions", gif: "leg4.gif", sets: "3", reps: "12-15", description: "Extend legs using leg extension machine." },
            { name: "Deadlift", gif: "leg5.gif", sets: "3-4", reps: "8-10", description: "Lift barbell from floor using legs and back." }
        ]
    },

    // Training splits by goal and experience
    splits: {
        weightloss: {
            beginner: {
                name: "Full-Body Circuit for Beginners",
                days: 3,
                description: "A full-body workout performed 3 days a week to maximize calorie burn while being manageable for beginners.",
                schedule: [
                    { day: "Monday", focus: "Full Body + 20 min Cardio" },
                    { day: "Wednesday", focus: "Full Body + 20 min Cardio" },
                    { day: "Friday", focus: "Full Body + 20 min Cardio" },
                ]
            },
            intermediate: {
                name: "Upper/Lower Split for Fat Loss",
                days: 4,
                description: "A 4-day split alternating between upper and lower body with integrated cardio for optimal fat burning.",
                schedule: [
                    { day: "Monday", focus: "Upper Body + HIIT" },
                    { day: "Tuesday", focus: "Lower Body + Steady Cardio" },
                    { day: "Thursday", focus: "Upper Body + HIIT" },
                    { day: "Friday", focus: "Lower Body + Steady Cardio" },
                ]
            },
            advanced: {
                name: "Push/Pull/Legs for Calorie Burning",
                days: 5,
                description: "A 5-day split to maximize energy expenditure while maintaining muscle mass.",
                schedule: [
                    { day: "Monday", focus: "Push + Cardio" },
                    { day: "Tuesday", focus: "Pull + HIIT" },
                    { day: "Wednesday", focus: "Legs + Cardio" },
                    { day: "Friday", focus: "Upper Body + HIIT" },
                    { day: "Saturday", focus: "Lower Body + Cardio" },
                ]
            }
        },
        muscle: {
            beginner: {
                name: "Full-Body Split for Beginners",
                days: 3,
                description: "A 3-day full-body routine to build a solid foundation of muscle.",
                schedule: [
                    { day: "Monday", focus: "Full Body Strength" },
                    { day: "Wednesday", focus: "Full Body Hypertrophy" },
                    { day: "Friday", focus: "Full Body Strength" },
                ]
            },
            intermediate: {
                name: "Upper/Lower Body Split",
                days: 4,
                description: "A 4-day split focusing on upper and lower body for balanced muscle development.",
                schedule: [
                    { day: "Monday", focus: "Upper Body Strength" },
                    { day: "Tuesday", focus: "Lower Body Strength" },
                    { day: "Thursday", focus: "Upper Body Hypertrophy" },
                    { day: "Friday", focus: "Lower Body Hypertrophy" },
                ]
            },
            advanced: {
                name: "Push/Pull/Legs Split",
                days: 6,
                description: "A 6-day split for maximum muscle building potential.",
                schedule: [
                    { day: "Monday", focus: "Push (Chest, Shoulders, Triceps)" },
                    { day: "Tuesday", focus: "Pull (Back, Biceps)" },
                    { day: "Wednesday", focus: "Legs" },
                    { day: "Thursday", focus: "Push" },
                    { day: "Friday", focus: "Pull" },
                    { day: "Saturday", focus: "Legs" },
                ]
            }
        },
        toning: {
            beginner: {
                name: "Toning Basics for Beginners",
                days: 3,
                description: "A balanced approach to tone muscles while building a fitness foundation.",
                schedule: [
                    { day: "Monday", focus: "Upper Body + Core" },
                    { day: "Wednesday", focus: "Lower Body + Light Cardio" },
                    { day: "Friday", focus: "Full Body Circuit" },
                ]
            },
            intermediate: {
                name: "Body Sculpting Split",
                days: 4,
                description: "A targeted approach to define muscles across the body.",
                schedule: [
                    { day: "Monday", focus: "Push + Core" },
                    { day: "Tuesday", focus: "Pull + HIIT" },
                    { day: "Thursday", focus: "Legs + Core" },
                    { day: "Friday", focus: "Full Body Circuit" },
                ]
            },
            advanced: {
                name: "Advanced Sculpting Program",
                days: 5,
                description: "A comprehensive program for athletic definition and tone.",
                schedule: [
                    { day: "Monday", focus: "Upper Body + Core" },
                    { day: "Tuesday", focus: "Lower Body + Plyometrics" },
                    { day: "Wednesday", focus: "HIIT + Core" },
                    { day: "Thursday", focus: "Push + Pull Supersets" },
                    { day: "Saturday", focus: "Full Body + Core Circuit" },
                ]
            }
        },
        endurance: {
            beginner: {
                name: "Endurance Foundation",
                days: 3,
                description: "Building aerobic capacity and muscular endurance for beginners.",
                schedule: [
                    { day: "Monday", focus: "Upper Body Endurance + Cardio" },
                    { day: "Wednesday", focus: "Lower Body Endurance + Cardio" },
                    { day: "Friday", focus: "Full Body Circuit" },
                ]
            },
            intermediate: {
                name: "Intermediate Endurance Program",
                days: 4,
                description: "A balanced approach to build stamina and muscular endurance.",
                schedule: [
                    { day: "Monday", focus: "Upper Body Endurance" },
                    { day: "Tuesday", focus: "Cardio Intervals" },
                    { day: "Thursday", focus: "Lower Body Endurance" },
                    { day: "Friday", focus: "Mixed Modal Circuit" },
                ]
            },
            advanced: {
                name: "Advanced Endurance Training",
                days: 5,
                description: "A comprehensive program for maximum cardiovascular and muscular endurance.",
                schedule: [
                    { day: "Monday", focus: "Upper Body Endurance" },
                    { day: "Tuesday", focus: "High Intensity Cardio" },
                    { day: "Wednesday", focus: "Lower Body Endurance" },
                    { day: "Friday", focus: "Cardio + Core Circuit" },
                    { day: "Saturday", focus: "Full Body Endurance Challenge" },
                ]
            }
        },
        strength: {
            beginner: {
                name: "Strength Foundations",
                days: 3,
                description: "Building fundamental strength through compound movements.",
                schedule: [
                    { day: "Monday", focus: "Full Body Strength A" },
                    { day: "Wednesday", focus: "Full Body Strength B" },
                    { day: "Friday", focus: "Full Body Strength C" },
                ]
            },
            intermediate: {
                name: "Intermediate Strength Program",
                days: 4,
                description: "A focused approach to build strength in major movement patterns.",
                schedule: [
                    { day: "Monday", focus: "Upper Body Push" },
                    { day: "Tuesday", focus: "Lower Body" },
                    { day: "Thursday", focus: "Upper Body Pull" },
                    { day: "Friday", focus: "Lower Body + Core" },
                ]
            },
            advanced: {
                name: "Advanced Strength Training",
                days: 5,
                description: "A specialized program for maximal strength development.",
                schedule: [
                    { day: "Monday", focus: "Squat Focus" },
                    { day: "Tuesday", focus: "Bench Press Focus" },
                    { day: "Wednesday", focus: "Recovery + Assistance" },
                    { day: "Thursday", focus: "Deadlift Focus" },
                    { day: "Friday", focus: "Overhead Press Focus" },
                ]
            }
        }
    }
};

// Chatbot data
const chatbotResponses = {
    greetings: [
        "Hello! How can I help with your fitness journey today?",
        "Hi there! I'm your AI fitness assistant. What can I help you with?",
        "Welcome! I'm here to help you reach your fitness goals. What do you need?"
    ],
    workout: [
        "A good workout routine should include both strength training and cardio for optimal results.",
        "For best results, aim to exercise 3-5 times per week with a mix of strength and cardio.",
        "Remember to include rest days in your workout plan to allow your muscles to recover and grow."
    ],
    nutrition: [
        "Proper nutrition is crucial for fitness success. Focus on whole foods and adequate protein intake.",
        "Try to eat plenty of protein, fruits, vegetables, and whole grains to fuel your workouts.",
        "Staying hydrated is essential for performance. Aim to drink at least 8 glasses of water daily."
    ],
    motivation: [
        "Consistency is key! Small steps every day lead to big results over time.",
        "Try setting specific, measurable goals to stay motivated on your fitness journey.",
        "Remember why you started whenever you feel like giving up. Your future self will thank you!"
    ],
    fallback: [
        "I'm not sure I understand. Could you rephrase that?",
        "I'm still learning! Can you ask that in a different way?",
        "I don't have information on that yet. Is there something else I can help with?"
    ]
};

// Hydration Tracker Functions
function initHydrationTracker() {
    loadHydrationData();
    startHydrationReminders();
}

function loadHydrationData() {
    const today = new Date().toLocaleDateString();
    const hydrationData = JSON.parse(localStorage.getItem('hydrationData') || '{}');
    const todayWater = hydrationData[today] || 0;

    updateHydrationDisplay(todayWater);
}

function updateHydrationDisplay(currentWater) {
    const goal = 3000; // 3 liters in ml
    const percentage = Math.min((currentWater / goal) * 100, 100);

    const currentWaterEl = document.getElementById('currentWater');
    const waterPercentageEl = document.getElementById('waterPercentage');
    const waterLevelEl = document.getElementById('waterLevel');

    if (currentWaterEl) currentWaterEl.textContent = currentWater;
    if (waterPercentageEl) waterPercentageEl.textContent = Math.round(percentage) + '%';

    // Update water level visual
    if (waterLevelEl) {
        waterLevelEl.style.height = percentage + '%';
    }

    // Show congratulations if goal reached
    if (currentWater >= goal) {
        showHydrationMessage('🎉 Congratulations! You\'ve reached your daily hydration goal!');
    }
}

function addWater(amount) {
    const today = new Date().toLocaleDateString();
    const hydrationData = JSON.parse(localStorage.getItem('hydrationData') || '{}');
    const currentWater = (hydrationData[today] || 0) + amount;

    hydrationData[today] = currentWater;
    localStorage.setItem('hydrationData', JSON.stringify(hydrationData));

    updateHydrationDisplay(currentWater);

    // Show feedback
    showHydrationMessage(`💧 Added ${amount}ml of water! Keep it up!`);

    // Update last water time
    localStorage.setItem('lastWaterTime', Date.now().toString());
}

function resetWater() {
    if (confirm('Are you sure you want to reset today\'s water intake?')) {
        const today = new Date().toLocaleDateString();
        const hydrationData = JSON.parse(localStorage.getItem('hydrationData') || '{}');
        hydrationData[today] = 0;
        localStorage.setItem('hydrationData', JSON.stringify(hydrationData));

        updateHydrationDisplay(0);
        showHydrationMessage('💧 Water intake reset for today.');
    }
}

function showHydrationMessage(message) {
    const reminder = document.getElementById('hydrationReminder');
    if (reminder) {
        reminder.innerHTML = '<strong>' + message + '</strong>';
        reminder.classList.add('show');

        setTimeout(() => {
            reminder.classList.remove('show');
        }, 3000);
    }
}

function startHydrationReminders() {
    // Check if reminders are enabled
    const remindersEnabled = localStorage.getItem('hydrationReminders') !== 'false';
    if (!remindersEnabled) return;

    // Set up reminder every 2 hours (7200000 ms)
    setInterval(() => {
        const now = new Date();
        const hours = now.getHours();

        // Only show reminders during waking hours (7 AM to 10 PM)
        if (hours >= 7 && hours <= 22) {
            showHydrationReminder();
        }
    }, 7200000); // 2 hours

    // Also check immediately if it's been 2+ hours since last water intake
    checkLastWaterIntake();
}

function checkLastWaterIntake() {
    const lastWaterTime = localStorage.getItem('lastWaterTime');
    if (lastWaterTime) {
        const timeSinceLastWater = Date.now() - parseInt(lastWaterTime);
        const twoHours = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

        if (timeSinceLastWater >= twoHours) {
            showHydrationReminder();
        }
    }
}

function showHydrationReminder() {
    // Show visual reminder
    showHydrationMessage('💧 Time to drink water! Stay hydrated for better performance.');

    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('💧 Hydration Reminder', {
            body: 'Time to drink some water! Stay hydrated for better performance.',
            icon: 'ai.png'
        });
    }

    // Add notification to the notification system
    addNotification('💧 Time to drink water! Stay hydrated for better performance.', 'info');
}

// Workout Heatmap Functions
function initWorkoutHeatmap() {
    console.log('Initializing workout heatmap...');
    generateHeatmapCalendar();
    updateHeatmapStats();
}

function generateHeatmapCalendar() {
    const heatmapGrid = document.getElementById('heatmapGrid');
    const heatmapMonths = document.getElementById('heatmapMonths');

    if (!heatmapGrid || !heatmapMonths) return;

    // Clear existing content
    heatmapGrid.innerHTML = '';
    heatmapMonths.innerHTML = '';

    // Generate calendar for the last year
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    // Get workout data
    const workoutData = getWorkoutDataByDate();

    // Generate month labels
    const months = [];
    const currentDate = new Date(oneYearAgo);

    while (currentDate <= today) {
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        if (months.length === 0 || months[months.length - 1].getMonth() !== monthStart.getMonth()) {
            months.push(monthStart);
        }
        currentDate.setDate(currentDate.getDate() + 7);
    }

    // Add month labels
    months.forEach(month => {
        const monthLabel = document.createElement('div');
        monthLabel.textContent = month.toLocaleDateString('en-US', { month: 'short' });
        heatmapMonths.appendChild(monthLabel);
    });

    // Generate day squares
    const startDate = new Date(oneYearAgo);
    const currentDay = new Date(startDate);

    while (currentDay <= today) {
        const dayElement = document.createElement('div');
        dayElement.className = 'heatmap-day';

        const dateString = currentDay.toLocaleDateString();
        const workoutCount = workoutData[dateString] || 0;
        const level = getWorkoutLevel(workoutCount);

        dayElement.setAttribute('data-level', level);
        dayElement.setAttribute('data-date', dateString);
        dayElement.setAttribute('data-count', workoutCount);

        // Add hover tooltip
        dayElement.addEventListener('mouseenter', showHeatmapTooltip);
        dayElement.addEventListener('mouseleave', hideHeatmapTooltip);

        heatmapGrid.appendChild(dayElement);
        currentDay.setDate(currentDay.getDate() + 1);
    }
}

function getWorkoutDataByDate() {
    const workoutData = {};

    userData.workoutSessions.forEach(session => {
        const date = new Date(session.date).toLocaleDateString();
        workoutData[date] = (workoutData[date] || 0) + 1;
    });

    return workoutData;
}

function getWorkoutLevel(count) {
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count === 2) return 2;
    if (count === 3) return 3;
    return 4; // 4+ workouts
}

function showHeatmapTooltip(event) {
    const tooltip = document.getElementById('heatmapTooltip');
    if (!tooltip) return;

    const date = event.target.getAttribute('data-date');
    const count = event.target.getAttribute('data-count');

    const workoutText = count === '1' ? 'workout' : 'workouts';
    tooltip.textContent = `${count} ${workoutText} on ${date}`;

    const rect = event.target.getBoundingClientRect();
    tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';

    tooltip.classList.add('show');
}

function hideHeatmapTooltip() {
    const tooltip = document.getElementById('heatmapTooltip');
    if (tooltip) {
        tooltip.classList.remove('show');
    }
}

function updateHeatmapStats() {
    const totalWorkouts = userData.workoutSessions.length;
    const currentStreak = calculateCurrentStreak();
    const longestStreak = calculateLongestStreak();
    const thisWeekWorkouts = calculateThisWeekWorkouts();

    const totalWorkoutsEl = document.getElementById('totalWorkouts');
    const currentStreakEl = document.getElementById('currentStreak');
    const longestStreakEl = document.getElementById('longestStreak');
    const thisWeekWorkoutsEl = document.getElementById('thisWeekWorkouts');

    if (totalWorkoutsEl) totalWorkoutsEl.textContent = totalWorkouts;
    if (currentStreakEl) currentStreakEl.textContent = currentStreak;
    if (longestStreakEl) longestStreakEl.textContent = longestStreak;
    if (thisWeekWorkoutsEl) thisWeekWorkoutsEl.textContent = thisWeekWorkouts;
}

function calculateCurrentStreak() {
    if (userData.workoutSessions.length === 0) return 0;

    const today = new Date();
    const workoutDates = userData.workoutSessions
        .map(session => new Date(session.date).toLocaleDateString())
        .filter((date, index, arr) => arr.indexOf(date) === index) // Remove duplicates
        .sort((a, b) => new Date(b) - new Date(a)); // Sort descending

    let streak = 0;
    let currentDate = new Date(today);

    for (let i = 0; i < workoutDates.length; i++) {
        const workoutDate = new Date(workoutDates[i]);
        const daysDiff = Math.floor((currentDate - workoutDate) / (1000 * 60 * 60 * 24));

        if (daysDiff <= 1) {
            streak++;
            currentDate = workoutDate;
        } else {
            break;
        }
    }

    return streak;
}

function calculateLongestStreak() {
    if (userData.workoutSessions.length === 0) return 0;

    const workoutDates = userData.workoutSessions
        .map(session => new Date(session.date).toLocaleDateString())
        .filter((date, index, arr) => arr.indexOf(date) === index) // Remove duplicates
        .sort((a, b) => new Date(a) - new Date(b)); // Sort ascending

    let longestStreak = 0;
    let currentStreak = 1;

    for (let i = 1; i < workoutDates.length; i++) {
        const prevDate = new Date(workoutDates[i - 1]);
        const currentDate = new Date(workoutDates[i]);
        const daysDiff = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));

        if (daysDiff === 1) {
            currentStreak++;
        } else {
            longestStreak = Math.max(longestStreak, currentStreak);
            currentStreak = 1;
        }
    }

    return Math.max(longestStreak, currentStreak);
}

function calculateThisWeekWorkouts() {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)

    return userData.workoutSessions.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate >= startOfWeek && sessionDate <= today;
    }).length;
}



function addSampleWorkoutData() {
    const sampleWorkouts = [];
    const today = new Date();

    // Generate sample workouts for the last 3 months
    for (let i = 0; i < 90; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);

        // Random chance of having a workout (about 40% chance)
        if (Math.random() < 0.4) {
            const workoutTypes = ['strength', 'cardio', 'hiit', 'yoga', 'pilates'];
            const intensities = ['light', 'moderate', 'vigorous', 'intense'];

            sampleWorkouts.push({
                id: Date.now() + i,
                date: date.toISOString().split('T')[0],
                type: workoutTypes[Math.floor(Math.random() * workoutTypes.length)],
                duration: 30 + Math.floor(Math.random() * 60), // 30-90 minutes
                intensity: intensities[Math.floor(Math.random() * intensities.length)],
                notes: 'Sample workout data',
                timestamp: date.toISOString()
            });
        }
    }

    userData.workoutSessions = sampleWorkouts;
    saveUserData();
}

// Mobile Menu Functionality
function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', function() {
            // Toggle active class on menu toggle
            this.classList.toggle('active');

            // Toggle active class on nav links
            navLinks.classList.toggle('active');

            // Prevent body scroll when menu is open
            if (navLinks.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Close menu when clicking on nav links
        const navLinkItems = navLinks.querySelectorAll('.nav-link');
        navLinkItems.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileMenuToggle.contains(e.target) && !navLinks.contains(e.target)) {
                mobileMenuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Close menu on window resize if it gets too wide
        window.addEventListener('resize', function() {
            if (window.innerWidth > 992) {
                mobileMenuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
}

// Enhanced Responsive Utilities
function initResponsiveFeatures() {
    // Optimize animations for mobile
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
        // Reduce particle count on mobile
        if (typeof particlesJS !== 'undefined') {
            const particlesConfig = document.querySelector('#particles-js');
            if (particlesConfig) {
                particlesConfig.style.opacity = '0.3';
            }
        }

        // Disable complex animations on mobile for better performance
        document.body.classList.add('mobile-device');
    }

    // Handle orientation change
    window.addEventListener('orientationchange', function() {
        setTimeout(function() {
            // Recalculate layouts after orientation change
            window.dispatchEvent(new Event('resize'));
        }, 100);
    });

    // Optimize touch interactions
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
    }
}

// Initialize responsive features on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initResponsiveFeatures);
} else {
    initResponsiveFeatures();
}

// AI Fitness Chatbot Implementation
let chatHistory = [];
let isTyping = false;

function initChatbot() {
    const chatToggle = document.getElementById('chatToggle');
    const chatbot = document.getElementById('chatbot');
    const closeChat = document.getElementById('closeChat');
    const sendMessage = document.getElementById('sendMessage');
    const userMessage = document.getElementById('userMessage');
    const voiceBtn = document.getElementById('voice-btn');

    // Toggle chatbot visibility
    if (chatToggle && chatbot) {
        chatToggle.addEventListener('click', () => {
            chatbot.classList.toggle('hidden');
            if (!chatbot.classList.contains('hidden')) {
                userMessage.focus();
                // Add welcome message if first time opening
                if (chatHistory.length === 0) {
                    addWelcomeMessage();
                }
            }
        });
    }

    // Close chatbot
    if (closeChat && chatbot) {
        closeChat.addEventListener('click', () => {
            chatbot.classList.add('hidden');
        });
    }

    // Send message on button click
    if (sendMessage && userMessage) {
        sendMessage.addEventListener('click', () => {
            sendUserMessage();
        });
    }

    // Send message on Enter key
    if (userMessage) {
        userMessage.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendUserMessage();
            }
        });
    }

    // Voice input functionality
    if (voiceBtn && 'webkitSpeechRecognition' in window) {
        initVoiceRecognition(voiceBtn, userMessage);
    } else if (voiceBtn) {
        voiceBtn.style.display = 'none'; // Hide if not supported
    }
}

function addWelcomeMessage() {
    const welcomeMessages = [
        "Hello! I'm your AI fitness assistant. I can help you with workouts, nutrition, and fitness goals. What would you like to know?",
        "Welcome to FitAI! I'm here to help you achieve your fitness goals. Ask me about exercises, meal planning, or workout routines!",
        "Hi there! Ready to get fit? I can provide workout suggestions, nutrition advice, and answer any fitness questions you have."
    ];

    const randomWelcome = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    addBotMessage(randomWelcome);
}

function sendUserMessage() {
    const userMessage = document.getElementById('userMessage');
    const message = userMessage.value.trim();

    if (message && !isTyping) {
        // Add user message to chat
        addUserMessage(message);

        // Clear input
        userMessage.value = '';

        // Add to chat history
        chatHistory.push({ role: 'user', content: message });

        // Show typing indicator
        showTypingIndicator();

        // Generate bot response
        setTimeout(() => {
            const response = generateBotResponse(message);
            hideTypingIndicator();
            addBotMessage(response.message);
            chatHistory.push({ role: 'bot', content: response.message });

            // Execute any actions
            if (response.actions && response.actions.length > 0) {
                executeActions(response.actions);
            }
        }, 1000 + Math.random() * 2000); // Random delay for realism
    }
}

function addUserMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    messageDiv.innerHTML = `
        <div class="message-content">${escapeHtml(message)}</div>
        <div class="message-time">${getCurrentTime()}</div>
    `;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function addBotMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot';
    messageDiv.innerHTML = `
        <img src="ai.png" class="bot-avatar" alt="AI Assistant">
        <div class="message-content">${message}</div>
        <div class="message-time">${getCurrentTime()}</div>
    `;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();

    // Add subtle animation
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(20px)';
    setTimeout(() => {
        messageDiv.style.transition = 'all 0.3s ease';
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateY(0)';
    }, 100);
}

function showTypingIndicator() {
    isTyping = true;
    const chatMessages = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
        <img src="ai.png" class="bot-avatar" alt="AI Assistant">
        <div class="message-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    scrollToBottom();
}

function hideTypingIndicator() {
    isTyping = false;
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function generateBotResponse(userMessage) {
    const message = userMessage.toLowerCase();

    // Check for action requests first
    const actionResponse = checkForActions(message, userMessage);
    if (actionResponse) {
        return actionResponse;
    }

    // Check for contextual responses
    const contextualResponse = getContextualResponse(userMessage);
    if (contextualResponse) {
        return { message: contextualResponse, actions: [] };
    }

    // Fitness knowledge base responses
    const responses = {
        // Greetings
        greetings: [
            "Hello! Ready to crush your fitness goals today? 💪",
            "Hi there! What fitness challenge can I help you tackle?",
            "Hey! Great to see you're staying active. How can I assist you?"
        ],

        // Workout related
        workout: [
            "Great question about workouts! Here are some effective exercises:\n\n🏋️ **Strength Training:**\n• Push-ups: 3 sets of 10-15 reps\n• Squats: 3 sets of 12-20 reps\n• Planks: Hold for 30-60 seconds\n\n🏃 **Cardio:**\n• Running: 20-30 minutes\n• Jump rope: 10-15 minutes\n• Burpees: 3 sets of 8-12 reps\n\nWould you like a specific workout plan?",
            "I'd love to help you with your workout routine! What's your fitness level and what are your goals? Are you looking to:\n\n• Build muscle 💪\n• Lose weight 🏃‍♀️\n• Improve endurance 🚴‍♂️\n• Increase flexibility 🧘‍♀️",
            "Awesome! Let's get you moving. Here's a quick full-body workout:\n\n**Warm-up (5 min):**\n• Arm circles\n• Leg swings\n• Light jogging in place\n\n**Main workout (20 min):**\n• Squats: 45 sec\n• Push-ups: 45 sec\n• Mountain climbers: 45 sec\n• Rest: 15 sec between exercises\n\nRepeat 3 rounds!"
        ],

        // Nutrition related
        nutrition: [
            "Nutrition is key to reaching your fitness goals! Here are some tips:\n\n🥗 **Balanced Meals:**\n• 50% vegetables and fruits\n• 25% lean protein\n• 25% whole grains\n\n💧 **Hydration:**\n• Drink 8-10 glasses of water daily\n• More if you're active!\n\n⏰ **Timing:**\n• Eat protein within 30 min after workouts\n• Don't skip breakfast\n\nWhat specific nutrition goals do you have?",
            "Great nutrition question! Here's what I recommend:\n\n**Pre-workout (1-2 hours before):**\n• Banana with peanut butter\n• Oatmeal with berries\n• Greek yogurt with honey\n\n**Post-workout (within 30 min):**\n• Protein shake with fruit\n• Chicken and rice\n• Chocolate milk\n\nNeed help with meal planning?",
            "Fueling your body right is crucial! Here are my top nutrition tips:\n\n🍎 **Whole Foods First:**\n• Choose unprocessed foods\n• Colorful fruits and vegetables\n• Lean proteins and healthy fats\n\n📊 **Portion Control:**\n• Use your hand as a guide\n• Palm-sized protein\n• Fist-sized vegetables\n• Thumb-sized fats\n\nWhat's your biggest nutrition challenge?"
        ],

        // Weight loss
        weightLoss: [
            "Weight loss is about creating a calorie deficit safely! Here's my approach:\n\n🔥 **Calorie Balance:**\n• Burn more than you consume\n• Aim for 1-2 lbs per week\n• Don't go below 1200 calories/day\n\n🏃‍♀️ **Exercise Mix:**\n• 150 min moderate cardio/week\n• 2-3 strength training sessions\n• Daily walks\n\n🥗 **Smart Eating:**\n• High protein, high fiber foods\n• Smaller, frequent meals\n• Stay hydrated\n\nWhat's your current weight loss goal?",
            "Sustainable weight loss is the way to go! Here's what works:\n\n**Week 1-2: Foundation**\n• Track your current eating habits\n• Add 10 min daily walks\n• Drink water before meals\n\n**Week 3-4: Building**\n• Increase exercise to 30 min\n• Focus on whole foods\n• Get 7-8 hours sleep\n\n**Week 5+: Consistency**\n• Maintain healthy habits\n• Adjust as needed\n• Celebrate small wins!\n\nReady to start your journey?"
        ],

        // Muscle building
        muscleBuilding: [
            "Building muscle requires the right combination of training and nutrition! Here's the formula:\n\n💪 **Training:**\n• Lift weights 3-4x per week\n• Focus on compound movements\n• Progressive overload\n• 8-12 reps for muscle growth\n\n🍗 **Nutrition:**\n• 1.6-2.2g protein per kg body weight\n• Eat in a slight calorie surplus\n• Post-workout protein within 30 min\n\n😴 **Recovery:**\n• 7-9 hours sleep\n• Rest days between sessions\n• Stay hydrated\n\nWhat muscle groups do you want to focus on?",
            "Great choice focusing on muscle building! Here's your roadmap:\n\n**Beginner Program:**\n• Full body workouts 3x/week\n• Squats, deadlifts, bench press\n• Start with bodyweight if needed\n\n**Intermediate Program:**\n• Upper/lower split 4x/week\n• Add isolation exercises\n• Track your progress\n\n**Advanced Program:**\n• Push/pull/legs split\n• Periodization\n• Advanced techniques\n\nWhat's your current experience level?"
        ],

        // Motivation and goals
        motivation: [
            "I love your motivation! Remember:\n\n🎯 **Set SMART Goals:**\n• Specific, Measurable, Achievable\n• Relevant, Time-bound\n\n🏆 **Celebrate Small Wins:**\n• Every workout counts\n• Progress isn't always linear\n• Consistency beats perfection\n\n💪 **Stay Strong:**\n• You're stronger than you think\n• Every day is a new opportunity\n• I believe in you!\n\nWhat's your biggest fitness goal right now?",
            "Your dedication is inspiring! Here's how to stay motivated:\n\n📸 **Track Progress:**\n• Take photos\n• Measure strength gains\n• Note how you feel\n\n👥 **Find Support:**\n• Workout buddy\n• Online communities\n• Share your journey\n\n🎉 **Reward Yourself:**\n• New workout clothes\n• Massage after milestones\n• Healthy treats\n\nYou've got this! What keeps you motivated?"
        ],

        // Default responses
        default: [
            "That's a great question! While I specialize in fitness and nutrition, I'd recommend consulting with a healthcare professional for specific medical advice. Is there anything fitness-related I can help you with?",
            "I'm here to help with your fitness journey! I can assist with workout plans, nutrition advice, motivation, and general fitness questions. What would you like to know?",
            "Interesting question! I'm focused on helping you achieve your fitness goals. I can provide workout routines, nutrition tips, and motivation. What fitness topic interests you most?",
            "I'd love to help you with that! As your AI fitness assistant, I'm best at providing workout guidance, nutrition advice, and fitness motivation. What specific fitness goal can I help you achieve?"
        ]
    };

    // Determine response category based on keywords
    if (message.includes('hello') || message.includes('hi') || message.includes('hey') || message.includes('good morning') || message.includes('good afternoon')) {
        return { message: getRandomResponse(responses.greetings), actions: [] };
    }

    if (message.includes('workout') || message.includes('exercise') || message.includes('training') || message.includes('gym') || message.includes('fitness routine')) {
        return { message: getRandomResponse(responses.workout), actions: [] };
    }

    if (message.includes('nutrition') || message.includes('diet') || message.includes('food') || message.includes('meal') || message.includes('eat') || message.includes('calories')) {
        return { message: getRandomResponse(responses.nutrition), actions: [] };
    }

    if (message.includes('weight loss') || message.includes('lose weight') || message.includes('fat loss') || message.includes('slim down')) {
        return { message: getRandomResponse(responses.weightLoss), actions: [] };
    }

    if (message.includes('muscle') || message.includes('bulk') || message.includes('gain weight') || message.includes('build') || message.includes('strength')) {
        return { message: getRandomResponse(responses.muscleBuilding), actions: [] };
    }

    if (message.includes('motivation') || message.includes('goal') || message.includes('inspire') || message.includes('encourage') || message.includes('help me')) {
        return { message: getRandomResponse(responses.motivation), actions: [] };
    }

    // Specific exercise questions
    if (message.includes('push up') || message.includes('pushup')) {
        return {
            message: "Push-ups are excellent for upper body strength! Here's proper form:\n\n✅ **Correct Form:**\n• Start in plank position\n• Lower chest to floor\n• Push back up\n• Keep core tight\n\n📈 **Progression:**\n• Beginner: Wall push-ups\n• Intermediate: Knee push-ups\n• Advanced: Standard push-ups\n• Expert: Diamond/one-arm push-ups\n\nHow many can you do currently?",
            actions: []
        };
    }

    if (message.includes('squat')) {
        return {
            message: "Squats are the king of lower body exercises! Here's how to do them right:\n\n✅ **Perfect Squat Form:**\n• Feet shoulder-width apart\n• Lower like sitting in a chair\n• Knees track over toes\n• Chest up, core engaged\n\n🎯 **Common Mistakes:**\n• Knees caving inward\n• Not going deep enough\n• Leaning too far forward\n\n💪 **Variations:**\n• Bodyweight squats\n• Goblet squats\n• Jump squats\n• Pistol squats\n\nNeed help with your squat form?",
            actions: []
        };
    }

    if (message.includes('plank')) {
        return {
            message: "Planks are amazing for core strength! Here's your plank guide:\n\n✅ **Proper Plank Form:**\n• Forearms on ground\n• Body in straight line\n• Engage core and glutes\n• Breathe normally\n\n⏱️ **Progression Plan:**\n• Week 1: 20-30 seconds\n• Week 2: 30-45 seconds\n• Week 3: 45-60 seconds\n• Week 4: 60+ seconds\n\n🔥 **Variations:**\n• Side planks\n• Plank up-downs\n• Plank with leg lifts\n\nHow long can you hold a plank?",
            actions: []
        };
    }

    // Return default response if no specific match
    return { message: getRandomResponse(responses.default), actions: [] };
}

function getRandomResponse(responseArray) {
    return responseArray[Math.floor(Math.random() * responseArray.length)];
}

// Action Detection and Execution
function checkForActions(message, originalMessage) {
    const actions = [];
    let responseMessage = "";

    // Workout Plan Creation
    if (message.includes('create workout') || message.includes('add workout') || message.includes('make workout') ||
        message.includes('workout plan') || message.includes('new workout')) {

        const workoutPlan = createWorkoutPlan(message);
        actions.push({
            type: 'CREATE_WORKOUT',
            data: workoutPlan
        });

        responseMessage = `🏋️ **Workout Plan Created!**\n\nI've created a "${workoutPlan.name}" workout plan for you with ${workoutPlan.exercises.length} exercises.\n\n**Exercises included:**\n${workoutPlan.exercises.map(ex => `• ${ex.name} - ${ex.sets}x${ex.reps}`).join('\n')}\n\n✅ **This workout has been added to your "My Workouts" section!** You can view and manage it there.\n\nWould you like me to create another workout or modify this one?`;

        return { message: responseMessage, actions: actions };
    }

    // Nutrition/Meal Logging
    if (message.includes('log food') || message.includes('add food') || message.includes('ate') ||
        message.includes('log meal') || message.includes('add meal') || message.includes('i had') ||
        message.includes('i eat') || message.includes('breakfast') || message.includes('lunch') ||
        message.includes('dinner') || message.includes('snack')) {

        const mealData = extractMealData(originalMessage);
        if (mealData) {
            actions.push({
                type: 'LOG_FOOD',
                data: mealData
            });

            responseMessage = `🍽️ **Food Logged!**\n\nI've added "${mealData.name}" to your nutrition tracker:\n• Calories: ${Math.round(mealData.calories)}\n• Protein: ${Math.round(mealData.protein)}g\n• Carbs: ${Math.round(mealData.carbs)}g\n• Fat: ${Math.round(mealData.fat)}g\n\n✅ **Check your Nutrition Tracker to see updated totals!**\n\nNeed help logging more foods?`;

            return { message: responseMessage, actions: actions };
        } else {
            // Food not recognized, ask for clarification
            responseMessage = `🤔 **I didn't recognize that food!**\n\nI can help you log these foods:\n\n🍎 **Fruits:** Apple, Banana, Orange, Grapes, Strawberries, Blueberries\n🥩 **Proteins:** Chicken, Salmon, Beef, Eggs, Tofu, Turkey\n🍚 **Carbs:** Rice, Bread, Pasta, Oatmeal, Quinoa, Potato\n🥬 **Vegetables:** Broccoli, Spinach, Carrots, Tomato\n🥛 **Dairy:** Milk, Yogurt, Cheese\n🍕 **Meals:** Salad, Sandwich, Pizza, Burger\n\nTry saying something like:\n• "I ate chicken and rice"\n• "Log an apple"\n• "I had a salad for lunch"\n\nWhat food would you like to log?`;

            return { message: responseMessage, actions: [] };
        }
    }

    // Hydration Logging
    if (message.includes('drank water') || message.includes('log water') || message.includes('add water') ||
        message.includes('water intake')) {

        const waterAmount = extractWaterAmount(originalMessage);
        actions.push({
            type: 'LOG_WATER',
            data: { amount: waterAmount }
        });

        responseMessage = `💧 **Water Logged!**\n\nI've added ${waterAmount}ml of water to your hydration tracker.\n\n✅ **Check your Nutrition Tracker to see your updated hydration progress!**\n\nKeep up the great hydration habits!`;

        return { message: responseMessage, actions: actions };
    }

    // Reminder Creation
    if (message.includes('remind me') || message.includes('set reminder') || message.includes('create reminder')) {
        const reminderData = extractReminderData(originalMessage);
        if (reminderData) {
            actions.push({
                type: 'CREATE_REMINDER',
                data: reminderData
            });

            responseMessage = `⏰ **Reminder Set!**\n\nI've created a reminder for "${reminderData.title}" at ${reminderData.time}.\n\n✅ **Check your Reminders section to manage all your reminders!**\n\nNeed help setting up more reminders?`;

            return { message: responseMessage, actions: actions };
        }
    }

    // Goal Setting
    if (message.includes('set goal') || message.includes('my goal') || message.includes('target')) {
        const goalData = extractGoalData(originalMessage);
        if (goalData) {
            actions.push({
                type: 'SET_GOAL',
                data: goalData
            });

            responseMessage = `🎯 **Goal Set!**\n\nI've updated your fitness goal: "${goalData.description}"\n\n✅ **Your profile has been updated with this goal!**\n\nI'll help you track progress towards this goal. What's your plan to achieve it?`;

            return { message: responseMessage, actions: actions };
        }
    }

    return null; // No actions detected
}

// Helper Functions for Data Extraction
function createWorkoutPlan(message) {
    // Determine workout type based on keywords
    let workoutType = 'Full Body';
    let exercises = [];

    if (message.includes('upper body') || message.includes('arms') || message.includes('chest')) {
        workoutType = 'Upper Body';
        exercises = [
            { name: 'Push-ups', sets: 3, reps: 12, rest: 60 },
            { name: 'Pull-ups', sets: 3, reps: 8, rest: 60 },
            { name: 'Dips', sets: 3, reps: 10, rest: 60 },
            { name: 'Pike Push-ups', sets: 3, reps: 8, rest: 60 }
        ];
    } else if (message.includes('lower body') || message.includes('legs') || message.includes('glutes')) {
        workoutType = 'Lower Body';
        exercises = [
            { name: 'Squats', sets: 3, reps: 15, rest: 60 },
            { name: 'Lunges', sets: 3, reps: 12, rest: 60 },
            { name: 'Calf Raises', sets: 3, reps: 20, rest: 45 },
            { name: 'Glute Bridges', sets: 3, reps: 15, rest: 60 }
        ];
    } else if (message.includes('cardio') || message.includes('hiit')) {
        workoutType = 'HIIT Cardio';
        exercises = [
            { name: 'Burpees', sets: 4, reps: 10, rest: 30 },
            { name: 'Jump Squats', sets: 4, reps: 15, rest: 30 },
            { name: 'Mountain Climbers', sets: 4, reps: 20, rest: 30 },
            { name: 'High Knees', sets: 4, reps: 30, rest: 30 }
        ];
    } else if (message.includes('core') || message.includes('abs')) {
        workoutType = 'Core Strength';
        exercises = [
            { name: 'Plank', sets: 3, reps: '45 sec', rest: 60 },
            { name: 'Bicycle Crunches', sets: 3, reps: 20, rest: 45 },
            { name: 'Russian Twists', sets: 3, reps: 30, rest: 45 },
            { name: 'Dead Bug', sets: 3, reps: 12, rest: 60 }
        ];
    } else {
        // Default full body workout
        exercises = [
            { name: 'Squats', sets: 3, reps: 12, rest: 60 },
            { name: 'Push-ups', sets: 3, reps: 10, rest: 60 },
            { name: 'Lunges', sets: 3, reps: 10, rest: 60 },
            { name: 'Plank', sets: 3, reps: '30 sec', rest: 60 },
            { name: 'Jumping Jacks', sets: 3, reps: 20, rest: 45 }
        ];
    }

    return {
        id: Date.now(),
        name: workoutType + ' Workout',
        type: workoutType.toLowerCase().replace(' ', '_'),
        exercises: exercises,
        duration: exercises.length * 4, // Rough estimate
        difficulty: 'Intermediate',
        createdBy: 'AI Assistant',
        createdAt: new Date().toISOString()
    };
}

function extractMealData(message) {
    // Expanded food database with more variations
    const commonFoods = {
        // Fruits
        'apple': { calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
        'banana': { calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
        'orange': { calories: 62, protein: 1.2, carbs: 15, fat: 0.2 },
        'grapes': { calories: 62, protein: 0.6, carbs: 16, fat: 0.2 },
        'strawberries': { calories: 32, protein: 0.7, carbs: 8, fat: 0.3 },
        'blueberries': { calories: 84, protein: 1.1, carbs: 21, fat: 0.5 },

        // Proteins
        'chicken breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
        'chicken': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
        'salmon': { calories: 208, protein: 22, carbs: 0, fat: 12 },
        'tuna': { calories: 132, protein: 28, carbs: 0, fat: 1 },
        'beef': { calories: 250, protein: 26, carbs: 0, fat: 15 },
        'pork': { calories: 242, protein: 27, carbs: 0, fat: 14 },
        'turkey': { calories: 135, protein: 30, carbs: 0, fat: 1 },
        'egg': { calories: 70, protein: 6, carbs: 0.6, fat: 5 },
        'eggs': { calories: 140, protein: 12, carbs: 1.2, fat: 10 },
        'tofu': { calories: 76, protein: 8, carbs: 2, fat: 5 },

        // Carbs
        'rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
        'bread': { calories: 80, protein: 4, carbs: 14, fat: 1 },
        'pasta': { calories: 131, protein: 5, carbs: 25, fat: 1.1 },
        'oatmeal': { calories: 150, protein: 5, carbs: 27, fat: 3 },
        'quinoa': { calories: 222, protein: 8, carbs: 39, fat: 4 },
        'potato': { calories: 161, protein: 4.3, carbs: 37, fat: 0.2 },
        'sweet potato': { calories: 112, protein: 2, carbs: 26, fat: 0.1 },

        // Vegetables
        'broccoli': { calories: 25, protein: 3, carbs: 5, fat: 0.3 },
        'spinach': { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
        'carrots': { calories: 41, protein: 0.9, carbs: 10, fat: 0.2 },
        'tomato': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
        'cucumber': { calories: 16, protein: 0.7, carbs: 4, fat: 0.1 },
        'lettuce': { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2 },

        // Dairy
        'milk': { calories: 150, protein: 8, carbs: 12, fat: 8 },
        'yogurt': { calories: 100, protein: 10, carbs: 6, fat: 4 },
        'cheese': { calories: 113, protein: 7, carbs: 1, fat: 9 },

        // Nuts & Seeds
        'almonds': { calories: 164, protein: 6, carbs: 6, fat: 14 },
        'peanuts': { calories: 161, protein: 7, carbs: 5, fat: 14 },
        'walnuts': { calories: 185, protein: 4, carbs: 4, fat: 18 },

        // Common meals
        'salad': { calories: 150, protein: 8, carbs: 15, fat: 8 },
        'sandwich': { calories: 300, protein: 15, carbs: 35, fat: 12 },
        'pizza': { calories: 285, protein: 12, carbs: 36, fat: 10 },
        'burger': { calories: 540, protein: 25, carbs: 40, fat: 31 }
    };

    const lowerMessage = message.toLowerCase();

    // Check for multiple foods in one message
    const foundFoods = [];
    for (const [food, nutrition] of Object.entries(commonFoods)) {
        if (lowerMessage.includes(food)) {
            foundFoods.push({
                name: food.charAt(0).toUpperCase() + food.slice(1),
                ...nutrition
            });
        }
    }

    // If multiple foods found, combine them
    if (foundFoods.length > 1) {
        const combinedMeal = foundFoods.reduce((total, food) => ({
            name: total.name + (total.name ? ' + ' : '') + food.name,
            calories: total.calories + food.calories,
            protein: total.protein + food.protein,
            carbs: total.carbs + food.carbs,
            fat: total.fat + food.fat
        }), { name: '', calories: 0, protein: 0, carbs: 0, fat: 0 });

        return {
            ...combinedMeal,
            timestamp: new Date().toISOString()
        };
    }

    // If single food found, check for portion size
    if (foundFoods.length === 1) {
        const food = foundFoods[0];
        const portionMultiplier = extractPortionSize(lowerMessage);

        return {
            name: food.name + (portionMultiplier !== 1 ? ` (${portionMultiplier}x portion)` : ''),
            calories: Math.round(food.calories * portionMultiplier),
            protein: Math.round(food.protein * portionMultiplier * 10) / 10,
            carbs: Math.round(food.carbs * portionMultiplier * 10) / 10,
            fat: Math.round(food.fat * portionMultiplier * 10) / 10,
            timestamp: new Date().toISOString()
        };
    }

    // If no specific food found, try to estimate based on food type keywords
    const estimatedFood = estimateFoodNutrition(lowerMessage);
    if (estimatedFood) {
        return {
            ...estimatedFood,
            timestamp: new Date().toISOString()
        };
    }

    // If no specific food found, ask for clarification instead of defaulting
    return null;
}

function estimateFoodNutrition(message) {
    // Try to estimate nutrition based on food type keywords
    const foodTypes = {
        // Protein-rich foods
        protein: {
            keywords: ['meat', 'fish', 'protein', 'steak', 'pork chop', 'lamb', 'duck', 'shrimp', 'crab', 'lobster'],
            nutrition: { calories: 200, protein: 25, carbs: 2, fat: 8 }
        },
        // Carb-rich foods
        carbs: {
            keywords: ['noodles', 'spaghetti', 'cereal', 'bagel', 'muffin', 'pancakes', 'waffles', 'toast'],
            nutrition: { calories: 180, protein: 6, carbs: 35, fat: 2 }
        },
        // Vegetables
        vegetables: {
            keywords: ['vegetable', 'veggie', 'greens', 'salad mix', 'bell pepper', 'onion', 'garlic', 'mushroom'],
            nutrition: { calories: 30, protein: 2, carbs: 6, fat: 0.2 }
        },
        // Fruits
        fruits: {
            keywords: ['fruit', 'berry', 'melon', 'peach', 'pear', 'plum', 'cherry', 'kiwi', 'mango', 'pineapple'],
            nutrition: { calories: 80, protein: 1, carbs: 20, fat: 0.3 }
        },
        // Dairy
        dairy: {
            keywords: ['dairy', 'cream', 'butter', 'ice cream', 'smoothie'],
            nutrition: { calories: 120, protein: 6, carbs: 8, fat: 8 }
        },
        // Snacks
        snacks: {
            keywords: ['chips', 'crackers', 'cookies', 'candy', 'chocolate', 'nuts', 'trail mix'],
            nutrition: { calories: 150, protein: 3, carbs: 15, fat: 9 }
        }
    };

    for (const [type, data] of Object.entries(foodTypes)) {
        for (const keyword of data.keywords) {
            if (message.includes(keyword)) {
                return {
                    name: keyword.charAt(0).toUpperCase() + keyword.slice(1) + ' (estimated)',
                    ...data.nutrition
                };
            }
        }
    }

    return null;
}

function extractPortionSize(message) {
    // Look for portion indicators
    const portionPatterns = [
        { pattern: /(\d+)\s*(cups?|cup)/i, multiplier: (match) => parseFloat(match[1]) },
        { pattern: /(\d+)\s*(pieces?|piece)/i, multiplier: (match) => parseFloat(match[1]) },
        { pattern: /(\d+)\s*(slices?|slice)/i, multiplier: (match) => parseFloat(match[1]) },
        { pattern: /(\d+)\s*(servings?|serving)/i, multiplier: (match) => parseFloat(match[1]) },
        { pattern: /half|1\/2/i, multiplier: () => 0.5 },
        { pattern: /quarter|1\/4/i, multiplier: () => 0.25 },
        { pattern: /double|twice/i, multiplier: () => 2 },
        { pattern: /triple/i, multiplier: () => 3 },
        { pattern: /large|big/i, multiplier: () => 1.5 },
        { pattern: /small|little/i, multiplier: () => 0.7 },
        { pattern: /medium/i, multiplier: () => 1 }
    ];

    for (const { pattern, multiplier } of portionPatterns) {
        const match = message.match(pattern);
        if (match) {
            return multiplier(match);
        }
    }

    return 1; // Default portion size
}

function extractWaterAmount(message) {
    // Extract water amount from message
    const match = message.match(/(\d+)\s*(ml|milliliters?|liters?|l|cups?|glasses?)/i);
    if (match) {
        let amount = parseInt(match[1]);
        const unit = match[2].toLowerCase();

        // Convert to ml
        if (unit.includes('l') && !unit.includes('ml')) {
            amount *= 1000; // liters to ml
        } else if (unit.includes('cup')) {
            amount *= 240; // cups to ml
        } else if (unit.includes('glass')) {
            amount *= 250; // glasses to ml
        }

        return Math.min(amount, 2000); // Cap at 2L per entry
    }

    return 250; // Default glass of water
}

function extractReminderData(message) {
    const lowerMessage = message.toLowerCase();

    // Extract time if mentioned
    const timeMatch = message.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
    let time = '09:00';

    if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
        const ampm = timeMatch[3];

        if (ampm && ampm.toLowerCase() === 'pm' && hours !== 12) {
            hours += 12;
        } else if (ampm && ampm.toLowerCase() === 'am' && hours === 12) {
            hours = 0;
        }

        time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    // Determine reminder type and title
    let type = 'general';
    let title = 'Fitness Reminder';

    if (lowerMessage.includes('workout') || lowerMessage.includes('exercise')) {
        type = 'workout';
        title = 'Workout Time';
    } else if (lowerMessage.includes('water') || lowerMessage.includes('drink')) {
        type = 'hydration';
        title = 'Drink Water';
    } else if (lowerMessage.includes('meal') || lowerMessage.includes('eat')) {
        type = 'nutrition';
        title = 'Meal Time';
    }

    return {
        id: Date.now(),
        title: title,
        type: type,
        time: time,
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        note: 'Set by AI Assistant',
        active: true
    };
}

function extractGoalData(message) {
    const lowerMessage = message.toLowerCase();
    let goalType = 'general';
    let description = 'Improve overall fitness';

    if (lowerMessage.includes('lose weight') || lowerMessage.includes('weight loss')) {
        goalType = 'weight_loss';
        description = 'Lose weight and improve body composition';
    } else if (lowerMessage.includes('gain muscle') || lowerMessage.includes('build muscle')) {
        goalType = 'muscle_gain';
        description = 'Build muscle and increase strength';
    } else if (lowerMessage.includes('endurance') || lowerMessage.includes('cardio')) {
        goalType = 'endurance';
        description = 'Improve cardiovascular endurance';
    } else if (lowerMessage.includes('strength')) {
        goalType = 'strength';
        description = 'Increase overall strength';
    }

    return {
        type: goalType,
        description: description,
        setAt: new Date().toISOString()
    };
}

// Action Execution - Integrates with existing app data
function executeActions(actions) {
    actions.forEach(action => {
        switch (action.type) {
            case 'CREATE_WORKOUT':
                executeCreateWorkout(action.data);
                break;
            case 'LOG_FOOD':
                executeLogFood(action.data);
                break;
            case 'LOG_WATER':
                executeLogWater(action.data);
                break;
            case 'CREATE_REMINDER':
                executeCreateReminder(action.data);
                break;
            case 'SET_GOAL':
                executeSetGoal(action.data);
                break;
        }
    });
}

function executeCreateWorkout(workoutData) {
    // Add to existing workout plans array
    userData.workoutPlans.push(workoutData);
    saveUserData();

    // Update the UI if we're on the workouts page
    if (!document.getElementById('workoutsSection').classList.contains('hidden')) {
        updateSavedWorkouts();
    }

    // Show success notification
    addNotification(`✅ Workout plan "${workoutData.name}" created successfully!`, 'success');

    // Add action buttons to the chat
    setTimeout(() => {
        addActionButtons([
            {
                text: '📋 View My Workouts',
                action: () => {
                    switchToSection('workouts');
                    document.getElementById('chatbot').classList.add('hidden');
                }
            },
            {
                text: '🏋️ Create Another Workout',
                action: () => {
                    const userMessage = document.getElementById('userMessage');
                    userMessage.value = 'Create another workout plan';
                    sendUserMessage();
                }
            }
        ]);
    }, 1000);
}

function executeLogFood(foodData) {
    // Add to meals array
    userData.meals.push(foodData);
    saveUserData();

    // Update nutrition display if we're on nutrition page
    if (!document.getElementById('nutritionSection').classList.contains('hidden')) {
        updateNutritionSummary();
    }

    // Show success notification
    addNotification(`🍽️ Logged ${foodData.name} (${foodData.calories} calories)`, 'success');

    // Add action buttons
    setTimeout(() => {
        addActionButtons([
            {
                text: '📊 View Nutrition Tracker',
                action: () => {
                    switchToSection('nutrition');
                    document.getElementById('chatbot').classList.add('hidden');
                }
            },
            {
                text: '🍎 Log More Food',
                action: () => {
                    const userMessage = document.getElementById('userMessage');
                    userMessage.value = 'Log more food';
                    sendUserMessage();
                }
            }
        ]);
    }, 1000);
}

function executeLogWater(waterData) {
    // Add water to hydration tracker
    if (typeof addWater === 'function') {
        addWater(waterData.amount);
    }

    // Show success notification
    addNotification(`💧 Logged ${waterData.amount}ml of water`, 'success');

    // Add action buttons
    setTimeout(() => {
        addActionButtons([
            {
                text: '💧 View Hydration Tracker',
                action: () => {
                    switchToSection('nutrition');
                    document.getElementById('chatbot').classList.add('hidden');
                }
            }
        ]);
    }, 1000);
}

function executeCreateReminder(reminderData) {
    // Add to reminders array
    userData.reminders.push(reminderData);
    saveUserData();

    // Update reminders display if we're on reminders page
    if (!document.getElementById('remindersSection').classList.contains('hidden')) {
        updateRemindersList();
    }

    // Show success notification
    addNotification(`⏰ Reminder "${reminderData.title}" set for ${reminderData.time}`, 'success');

    // Add action buttons
    setTimeout(() => {
        addActionButtons([
            {
                text: '⏰ View My Reminders',
                action: () => {
                    switchToSection('reminders');
                    document.getElementById('chatbot').classList.add('hidden');
                }
            }
        ]);
    }, 1000);
}

function executeSetGoal(goalData) {
    // Update user profile with goal
    if (!userData.profile) userData.profile = {};
    userData.profile.fitnessGoal = goalData.description;
    userData.profile.goalType = goalData.type;
    saveUserData();

    // Show success notification
    addNotification(`🎯 Fitness goal updated: ${goalData.description}`, 'success');
}

// Add Action Buttons to Chat
function addActionButtons(buttons) {
    const chatMessages = document.getElementById('chatMessages');
    const actionButtonsDiv = document.createElement('div');
    actionButtonsDiv.className = 'action-buttons-container';
    actionButtonsDiv.innerHTML = `
        <div class="action-buttons-title">Quick Actions:</div>
        <div class="action-buttons">
            ${buttons.map(btn => `
                <button class="action-btn" onclick="(${btn.action.toString()})()">${btn.text}</button>
            `).join('')}
        </div>
    `;
    chatMessages.appendChild(actionButtonsDiv);
    scrollToBottom();
}

// Enhanced Quick Actions with Integration
function addQuickActions() {
    const chatMessages = document.getElementById('chatMessages');
    const quickActionsDiv = document.createElement('div');
    quickActionsDiv.className = 'quick-actions';
    quickActionsDiv.innerHTML = `
        <div class="quick-action-title">What can I help you with?</div>
        <button class="quick-action-btn" onclick="askQuickQuestion('Create a full body workout plan')">🏋️ Create Workout</button>
        <button class="quick-action-btn" onclick="askQuickQuestion('Log my breakfast')">🍽️ Log Food</button>
        <button class="quick-action-btn" onclick="askQuickQuestion('I drank 500ml of water')">💧 Log Water</button>
        <button class="quick-action-btn" onclick="askQuickQuestion('Remind me to workout at 7am')">⏰ Set Reminder</button>
        <button class="quick-action-btn" onclick="askQuickQuestion('My goal is to lose weight')">🎯 Set Goal</button>
        <button class="quick-action-btn" onclick="askQuickQuestion('Give me motivation')">💪 Motivation</button>
    `;
    chatMessages.appendChild(quickActionsDiv);
    scrollToBottom();
}

// Voice Recognition Feature
function initVoiceRecognition(voiceBtn, userMessage) {
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    let isListening = false;

    voiceBtn.addEventListener('click', () => {
        if (!isListening) {
            recognition.start();
            isListening = true;
            voiceBtn.textContent = '🔴 Listening...';
            voiceBtn.style.background = '#ff4444';
        } else {
            recognition.stop();
            isListening = false;
            voiceBtn.textContent = '🎤 Speak';
            voiceBtn.style.background = '';
        }
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userMessage.value = transcript;
        isListening = false;
        voiceBtn.textContent = '🎤 Speak';
        voiceBtn.style.background = '';

        // Auto-send the message
        setTimeout(() => {
            sendUserMessage();
        }, 500);
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        isListening = false;
        voiceBtn.textContent = '🎤 Speak';
        voiceBtn.style.background = '';

        if (event.error === 'not-allowed') {
            addBotMessage("I need microphone permission to use voice input. Please enable it in your browser settings.");
        }
    };

    recognition.onend = () => {
        isListening = false;
        voiceBtn.textContent = '🎤 Speak';
        voiceBtn.style.background = '';
    };
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function scrollToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Quick Action Buttons
function addQuickActions() {
    const chatMessages = document.getElementById('chatMessages');
    const quickActionsDiv = document.createElement('div');
    quickActionsDiv.className = 'quick-actions';
    quickActionsDiv.innerHTML = `
        <div class="quick-action-title">Quick Actions:</div>
        <button class="quick-action-btn" onclick="askQuickQuestion('Give me a quick workout')">🏋️ Quick Workout</button>
        <button class="quick-action-btn" onclick="askQuickQuestion('Healthy meal ideas')">🥗 Meal Ideas</button>
        <button class="quick-action-btn" onclick="askQuickQuestion('Motivate me')">💪 Motivation</button>
        <button class="quick-action-btn" onclick="askQuickQuestion('Weight loss tips')">⚖️ Weight Loss</button>
    `;
    chatMessages.appendChild(quickActionsDiv);
    scrollToBottom();
}

function askQuickQuestion(question) {
    const userMessage = document.getElementById('userMessage');
    userMessage.value = question;
    sendUserMessage();

    // Remove quick actions after use
    const quickActions = document.querySelector('.quick-actions');
    if (quickActions) {
        quickActions.remove();
    }
}

// Add quick actions when chatbot opens for the first time
function addWelcomeMessage() {
    const welcomeMessages = [
        "Hello! I'm your AI fitness assistant. I can help you with workouts, nutrition, and fitness goals. What would you like to know?",
        "Welcome to FitAI! I'm here to help you achieve your fitness goals. Ask me about exercises, meal planning, or workout routines!",
        "Hi there! Ready to get fit? I can provide workout suggestions, nutrition advice, and answer any fitness questions you have."
    ];

    const randomWelcome = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    addBotMessage(randomWelcome);

    // Add quick actions after welcome message
    setTimeout(() => {
        addQuickActions();
    }, 1000);
}

// Enhanced chatbot with context awareness
function getContextualResponse(userMessage) {
    const recentMessages = chatHistory.slice(-3); // Last 3 messages for context
    const hasWorkoutContext = recentMessages.some(msg =>
        msg.content.toLowerCase().includes('workout') ||
        msg.content.toLowerCase().includes('exercise')
    );
    const hasNutritionContext = recentMessages.some(msg =>
        msg.content.toLowerCase().includes('nutrition') ||
        msg.content.toLowerCase().includes('food') ||
        msg.content.toLowerCase().includes('diet')
    );

    // Provide contextual follow-up responses
    if (hasWorkoutContext && userMessage.toLowerCase().includes('more')) {
        return "Here are some additional workout variations:\n\n🔥 **HIIT Circuit:**\n• Burpees: 30 sec\n• Jump squats: 30 sec\n• Push-ups: 30 sec\n• Mountain climbers: 30 sec\n• Rest: 30 sec\nRepeat 4 rounds!\n\n💪 **Strength Focus:**\n• Deadlifts: 3x8\n• Pull-ups: 3x5-10\n• Overhead press: 3x8\n• Rows: 3x10\n\nWhich style interests you more?";
    }

    if (hasNutritionContext && userMessage.toLowerCase().includes('more')) {
        return "Here are more nutrition tips:\n\n🍽️ **Meal Prep Ideas:**\n• Sunday prep for the week\n• Batch cook proteins\n• Pre-cut vegetables\n• Portion containers\n\n🥤 **Healthy Snacks:**\n• Greek yogurt with berries\n• Apple with almond butter\n• Hummus with vegetables\n• Trail mix (portion controlled)\n\n⏰ **Timing Tips:**\n• Eat every 3-4 hours\n• Don't skip meals\n• Hydrate before meals\n\nNeed specific meal plans?";
    }

    return null; // No contextual response needed
}


