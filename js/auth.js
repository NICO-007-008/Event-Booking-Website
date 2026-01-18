// Authentication functionality

// Handle login form submission
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Get all users
    const users = getAllUsers();
    
    // Find user with matching credentials
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Store current user in localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Store remember me preference
        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
        }
        
        showAlert('Login successful! Redirecting...', 'success');
        
        // Redirect based on user role
        setTimeout(() => {
            if (user.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
        }, 1500);
    } else {
        showAlert('Invalid email or password. Please try again.', 'danger');
    }
}

// Handle registration form submission
function handleRegistration(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const phone = document.getElementById('phone').value;
    
    // Validation
    if (password !== confirmPassword) {
        showAlert('Passwords do not match!', 'danger');
        return;
    }
    
    if (password.length < 6) {
        showAlert('Password must be at least 6 characters long', 'danger');
        return;
    }
    
    // Get all users
    const users = getAllUsers();
    
    // Check if email already exists
    if (users.some(u => u.email === email)) {
        showAlert('Email already registered! Please login instead.', 'warning');
        return;
    }
    
    // Create new user
    const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        name: name,
        email: email,
        password: password,
        phone: phone,
        role: 'user',
        createdAt: new Date().toISOString()
    };
    
    // Add to users array and save
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto login the new user
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    showAlert('Registration successful! Welcome to EventHub.', 'success');
    
    // Redirect to home page
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// Initialize login/register forms
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        
        // Check if user should be remembered
        if (localStorage.getItem('rememberMe') === 'true') {
            const currentUser = getCurrentUser();
            if (currentUser) {
                document.getElementById('email').value = currentUser.email;
                document.getElementById('rememberMe').checked = true;
            }
        }
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }
    
    // Redirect if already authenticated
    if (window.location.pathname.includes('login.html') || 
        window.location.pathname.includes('register.html')) {
        redirectIfAuthenticated();
    }
});