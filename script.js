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
const homeSection = document.getElementById('homeSection');
const workoutsSection = document.getElementById('workoutsSection');
const nutritionSection = document.getElementById('nutritionSection');
const remindersSection = document.getElementById('remindersSection');
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
const enableNotificationsBtn = document.getElementById('enableNotificationsBtn');
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

// Load user data from localStorage
function loadUserData() {
    const savedData = localStorage.getItem('fitAIUserData');
    if (savedData) {
        userData = JSON.parse(savedData);
        updateSavedWorkouts();
        updateNotificationCount();
    }
}

// Save user data to localStorage
function saveUserData() {
    localStorage.setItem('fitAIUserData', JSON.stringify(userData));
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
    enableNotificationsBtn.addEventListener('click', function() {
        requestNotificationPermission();
    });

    // Set up reminder checking timer (every minute)
    setInterval(checkReminders, 60000);

    // Check reminders immediately on load
    checkReminders();

    // Hero typewriter effect
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
    if (!element) return;

    const fullText = element.getAttribute('data-text') || '';
    const typingSpeedMs = 70; // per character
    const startDelayMs = 300; // initial delay

    element.textContent = '';

    let index = 0;
    function typeNext() {
        if (index <= fullText.length) {
            element.textContent = fullText.slice(0, index);
            index += 1;
            setTimeout(typeNext, typingSpeedMs);
        }
    }

    setTimeout(typeNext, startDelayMs);
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

    // Remove active class from all links
    homeLink.classList.remove('active');
    workoutsLink.classList.remove('active');
    nutritionLink.classList.remove('active');
    remindersLink.classList.remove('active');

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
        reminderPermissions.classList.remove('hidden');
        enableNotificationsBtn.disabled = true;
        enableNotificationsBtn.textContent = 'Notifications Not Supported';
        return;
    }

    if (Notification.permission === 'granted') {
        // Permission already granted
        reminderPermissions.classList.add('hidden');
    } else {
        // Permission not granted yet
        reminderPermissions.classList.remove('hidden');
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
    document.querySelectorAll('.day-selector input:checked').forEach(checkbox => {
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

    // Add notification
    addNotification(`Reminder "${title}" set successfully.`, 'success');
}

// Update reminders list
function updateRemindersList() {
    if (userData.reminders.length === 0) {
        remindersList.innerHTML = '<p class="empty-state">No active reminders set.</p>';
        return;
    }

    let html = '';
    userData.reminders.forEach(reminder => {
        // Format time
        const timeFormatted = formatTime(reminder.time);

        // Format days
        const daysHTML = reminder.days.map(day =>
            `<span class="reminder-day">${day}</span>`
        ).join('');

        html += `
            <div class="reminder-item">
                <span class="reminder-type ${reminder.type}">${reminder.type}</span>
                <div class="reminder-title">${reminder.title}</div>
                <span class="reminder-time">${timeFormatted}</span>
                <div class="reminder-days">${daysHTML}</div>
                ${reminder.note ? `<div class="reminder-note">${reminder.note}</div>` : ''}
                <div class="reminder-controls">
                    <button class="reminder-btn edit-reminder" data-id="${reminder.id}">Edit</button>
                    <button class="reminder-btn delete-reminder" data-id="${reminder.id}">Delete</button>
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
        document.querySelectorAll('.day-selector input').forEach(checkbox => {
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


