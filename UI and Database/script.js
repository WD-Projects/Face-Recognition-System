// Configuration - Update with your Python backend URL
const API_BASE_URL = 'http://localhost:5000'; // Change this to your Python Flask backend URL

// Page elements
const loginPage = document.getElementById('loginPage');
const dashboardPage = document.getElementById('dashboardPage');

// Login form elements
const loginForm = document.getElementById('loginForm');
const userTypeSelect = document.getElementById('userType');
const userIdInput = document.getElementById('userId');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('errorMessage');
const loadingMessage = document.getElementById('loadingMessage');

// Dashboard elements
const logoutBtn = document.getElementById('logoutBtn');
const userName = document.getElementById('userName');
const userRole = document.getElementById('userRole');
const userPhoto = document.getElementById('userPhoto');
const profileName = document.getElementById('profileName');
const profileId = document.getElementById('profileId');
const profileType = document.getElementById('profileType');
const profileDept = document.getElementById('profileDept');
const profileEmail = document.getElementById('profileEmail');
const totalClasses = document.getElementById('totalClasses');
const presentClasses = document.getElementById('presentClasses');
const absentClasses = document.getElementById('absentClasses');
const presentPercent = document.getElementById('presentPercent');
const absentPercent = document.getElementById('absentPercent');
const presentBar = document.getElementById('presentBar');
const absentBar = document.getElementById('absentBar');

// Variables
let currentUser = null;

// ============================================
// LOGIN FUNCTIONALITY
// ============================================

loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const userType = userTypeSelect.value;
    const userId = userIdInput.value.trim();
    const password = passwordInput.value;

    // Hide previous messages
    errorMessage.style.display = 'none';
    loadingMessage.style.display = 'none';

    // Basic validation
    if (!userType || !userId || !password) {
        showError('Please fill all fields');
        return;
    }

    // Show loading
    showLoading();

    // Call Python backend API for login
    try {
        const response = await fetch(`${API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_type: userType,
                user_id: userId,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Login successful
            currentUser = data.user;
            hideLoading();
            showDashboard();
        } else {
            // Login failed
            hideLoading();
            showError(data.message || 'Invalid credentials. Please check your ID and password.');
        }
    } catch (error) {
        console.error('Login error:', error);
        hideLoading();
        showError('Unable to connect to server. Please check if the backend is running.');
    }
});

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function showLoading() {
    loadingMessage.style.display = 'flex';
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
}

function hideLoading() {
    loadingMessage.style.display = 'none';
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
}

// ============================================
// DASHBOARD FUNCTIONALITY
// ============================================

function showDashboard() {
    // Hide login page, show dashboard
    loginPage.classList.remove('active');
    dashboardPage.classList.add('active');

    // Populate user data
    updateDashboard();
}

function updateDashboard() {
    if (!currentUser) return;

    // Update profile information from Firebase
    userName.textContent = currentUser.name || 'User';
    userRole.textContent = capitalizeFirst(currentUser.type || 'student');
    profileName.textContent = currentUser.name || '-';
    profileId.textContent = currentUser.id || '-';
    profileType.textContent = capitalizeFirst(currentUser.type || '-');
    profileDept.textContent = currentUser.department || '-';
    profileEmail.textContent = currentUser.email || '-';
    
    // Update photo from MySQL (base64 or URL)
    if (currentUser.photo) {
        // If photo is base64, it should start with 'data:image'
        // If it's a URL, use it directly
        userPhoto.src = currentUser.photo;
    } else {
        userPhoto.src = 'https://via.placeholder.com/150/cccccc/666666?text=No+Photo';
    }

    // Update attendance data from Firebase
    const total = currentUser.total_classes || 24;
    const present = currentUser.present || 0;
    const absent = currentUser.absent || 0;

    totalClasses.textContent = total;
    presentClasses.textContent = present;
    absentClasses.textContent = absent;

    // Calculate percentages
    const presentPercentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
    const absentPercentage = total > 0 ? ((absent / total) * 100).toFixed(1) : 0;

    presentPercent.textContent = presentPercentage + '%';
    absentPercent.textContent = absentPercentage + '%';

    // Update progress bars with animation
    setTimeout(() => {
        presentBar.style.width = presentPercentage + '%';
        absentBar.style.width = absentPercentage + '%';
    }, 100);
}

function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================
// LOGOUT FUNCTIONALITY
// ============================================

logoutBtn.addEventListener('click', function() {
    // Clear current user
    currentUser = null;
    
    // Reset form
    loginForm.reset();
    errorMessage.style.display = 'none';
    loadingMessage.style.display = 'none';
    
    // Reset progress bars
    presentBar.style.width = '0%';
    absentBar.style.width = '0%';
    
    // Show login page
    dashboardPage.classList.remove('active');
    loginPage.classList.add('active');
});

// ============================================
// INITIALIZE
// ============================================

window.addEventListener('load', function() {
    console.log('SEU UMS System loaded');
    console.log('Backend URL:', API_BASE_URL);
});