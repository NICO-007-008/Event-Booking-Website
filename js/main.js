// Main JavaScript file - Shared functionality across pages

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Check if user is logged in and update UI
    updateAuthUI();
    
    // Initialize sample data if not already present
    initializeSampleData();
});

// Update authentication UI elements
function updateAuthUI() {
    const isLoggedIn = checkAuthStatus();
    const loginLink = document.querySelector('a[href="login.html"]');
    const registerLink = document.querySelector('a[href="register.html"]');
    const myBookingsLink = document.querySelector('a[href="my-bookings.html"]');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (isLoggedIn) {
        const currentUser = getCurrentUser();
        
        if (loginLink) loginLink.textContent = `Welcome, ${currentUser.name.split(' ')[0]}`;
        if (registerLink) registerLink.style.display = 'none';
        
        // Create logout button if it doesn't exist
        if (!logoutBtn && document.querySelector('.navbar-nav')) {
            const nav = document.querySelector('.navbar-nav');
            const logoutItem = document.createElement('li');
            logoutItem.className = 'nav-item';
            logoutItem.innerHTML = `
                <button class="nav-link btn btn-link text-danger" id="logoutBtn" style="border: none; background: none;">
                    <i class="bi bi-box-arrow-right me-1"></i>Logout
                </button>
            `;
            nav.appendChild(logoutItem);
            
            // Add logout event listener
            document.getElementById('logoutBtn').addEventListener('click', handleLogout);
        }
    } else {
        if (loginLink) loginLink.textContent = 'Login';
        if (registerLink) registerLink.style.display = 'block';
        if (logoutBtn) logoutBtn.parentElement.remove();
    }
}

// Check authentication status
function checkAuthStatus() {
    const currentUser = localStorage.getItem('currentUser');
    return currentUser !== null;
}

// Get current user data
function getCurrentUser() {
    const currentUser = localStorage.getItem('currentUser');
    return currentUser ? JSON.parse(currentUser) : null;
}

// Get all users from localStorage
function getAllUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
}

// Get all events from localStorage
function getAllEvents() {
    const events = localStorage.getItem('events');
    return events ? JSON.parse(events) : [];
}

// Get all bookings from localStorage
function getAllBookings() {
    const bookings = localStorage.getItem('bookings');
    return bookings ? JSON.parse(bookings) : [];
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('currentUser');
    showAlert('Successfully logged out!', 'success');
    
    // Redirect to home page after short delay
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// Initialize sample data if localStorage is empty
function initializeSampleData() {
    // Initialize users if not present
    if (!localStorage.getItem('users')) {
        const sampleUsers = [
            {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
                phone: '09171234567',
                role: 'user'
            },
            {
                id: 2,
                name: 'Jane Smith',
                email: 'jane@example.com',
                password: 'password123',
                phone: '09177654321',
                role: 'user'
            },
            {
                id: 3,
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'admin123',
                phone: '09170000000',
                role: 'admin'
            }
        ];
        localStorage.setItem('users', JSON.stringify(sampleUsers));
    }
    
    // Initialize events if not present
    if (!localStorage.getItem('events')) {
        const sampleEvents = [
            {
                id: 1,
                title: 'Summer Music Festival 2023',
                description: 'A day filled with amazing music from top local and international artists. Experience the ultimate summer festival with food stalls, art installations, and more.',
                date: '2023-07-15',
                time: '14:00',
                location: 'Music Park, Manila',
                category: 'Music',
                price: 1500,
                rating: 4.8,
                totalReviews: 245,
                images: [
                    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                ],
                performers: ['The Local Band', 'DJ Summer', 'International Singer'],
                seatMap: generateSeatMap(10, 15),
                seatPrices: {
                    'VIP': 2500,
                    'Premium': 1800,
                    'Standard': 1500
                },
                featured: true,
                availableSeats: 120,
                totalSeats: 150
            },
            {
                id: 2,
                title: 'Tech Conference 2023',
                description: 'Annual technology conference featuring industry leaders, workshops, and networking opportunities. Learn about the latest trends in AI, blockchain, and cloud computing.',
                date: '2023-08-22',
                time: '09:00',
                location: 'Convention Center, Makati',
                category: 'Conference',
                price: 3500,
                rating: 4.6,
                totalReviews: 189,
                images: [
                    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                ],
                performers: ['Tech CEO', 'AI Researcher', 'Blockchain Expert'],
                seatMap: generateSeatMap(8, 12),
                seatPrices: {
                    'VIP': 5000,
                    'Premium': 4000,
                    'Standard': 3500
                },
                featured: true,
                availableSeats: 85,
                totalSeats: 96
            },
            {
                id: 3,
                title: 'Food and Wine Expo',
                description: 'Experience the finest culinary delights from around the world paired with exquisite wines. Cooking demonstrations and tasting sessions included.',
                date: '2023-09-10',
                time: '11:00',
                location: 'Expo Center, Taguig',
                category: 'Food & Drink',
                price: 1200,
                rating: 4.9,
                totalReviews: 312,
                images: [
                    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                ],
                performers: ['Master Chef', 'Sommelier', 'Pastry Chef'],
                seatMap: generateSeatMap(6, 10),
                seatPrices: {
                    'VIP': 2000,
                    'Premium': 1500,
                    'Standard': 1200
                },
                featured: true,
                availableSeats: 54,
                totalSeats: 60
            }
        ];
        localStorage.setItem('events', JSON.stringify(sampleEvents));
    }
    
    // Initialize bookings if not present
    if (!localStorage.getItem('bookings')) {
        localStorage.setItem('bookings', JSON.stringify([]));
    }
}

// Generate a sample seat map
function generateSeatMap(rows, cols) {
    const seatMap = [];
    const seatTypes = ['VIP', 'Premium', 'Standard'];
    
    for (let row = 1; row <= rows; row++) {
        const seatRow = [];
        for (let col = 1; col <= cols; col++) {
            // Determine seat type based on position
            let type = 'Standard';
            if (row <= 2) type = 'VIP';
            else if (row <= 4) type = 'Premium';
            
            // Randomly occupy some seats (20% chance)
            const occupied = Math.random() < 0.2;
            
            seatRow.push({
                id: `R${row}C${col}`,
                row: row,
                col: col,
                type: type,
                occupied: occupied,
                selected: false
            });
        }
        seatMap.push(seatRow);
    }
    
    return seatMap;
}

// Show alert message
function showAlert(message, type = 'info', duration = 5000) {
    // Remove any existing alerts
    const existingAlert = document.querySelector('.alert-auto-dismiss');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show alert-auto-dismiss`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Add to page
    document.body.appendChild(alertDiv);
    
    // Auto dismiss after duration
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, duration);
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP'
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Format date for input fields
function formatDateForInput(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

// Generate random transaction ID
function generateTransactionId() {
    return 'TXN' + Date.now() + Math.floor(Math.random() * 1000);
}

// Generate receipt HTML
function generateReceiptHTML(booking) {
    const event = getAllEvents().find(e => e.id === booking.eventId);
    const user = getCurrentUser();
    
    if (!event || !user) return '';
    
    const totalAmount = booking.seats.reduce((sum, seat) => {
        return sum + (event.seatPrices[seat.type] || event.price);
    }, 0);
    
    return `
        <div class="receipt">
            <div class="receipt-header text-center mb-4">
                <h2 class="fw-bold text-primary">EventHub</h2>
                <p class="text-muted mb-0">Event Booking Receipt</p>
            </div>
            
            <div class="row mb-4">
                <div class="col-md-6">
                    <h5 class="fw-bold">Booking Details</h5>
                    <p class="mb-1"><strong>Transaction ID:</strong> ${booking.transactionId}</p>
                    <p class="mb-1"><strong>Booking Date:</strong> ${new Date(booking.bookingDate).toLocaleString()}</p>
                    <p class="mb-1"><strong>Payment Method:</strong> ${booking.paymentMethod}</p>
                </div>
                <div class="col-md-6 text-md-end">
                    <h5 class="fw-bold">Customer Details</h5>
                    <p class="mb-1">${user.name}</p>
                    <p class="mb-1">${user.email}</p>
                    <p class="mb-1">${user.phone || 'N/A'}</p>
                </div>
            </div>
            
            <div class="mb-4">
                <h5 class="fw-bold">Event Information</h5>
                <p class="mb-1"><strong>Event:</strong> ${event.title}</p>
                <p class="mb-1"><strong>Date:</strong> ${formatDate(event.date)} at ${event.time}</p>
                <p class="mb-1"><strong>Location:</strong> ${event.location}</p>
            </div>
            
            <div class="mb-4">
                <h5 class="fw-bold">Seat Selection</h5>
                <table class="table table-bordered">
                    <thead class="table-light">
                        <tr>
                            <th>Seat</th>
                            <th>Type</th>
                            <th class="text-end">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${booking.seats.map(seat => `
                            <tr>
                                <td>${seat.id}</td>
                                <td>${seat.type}</td>
                                <td class="text-end">${formatCurrency(event.seatPrices[seat.type] || event.price)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot class="table-light">
                        <tr>
                            <th colspan="2" class="text-end">Total:</th>
                            <th class="text-end">${formatCurrency(totalAmount)}</th>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            <div class="text-center mt-4 pt-4 border-top">
                <p class="text-muted">Thank you for booking with EventHub!</p>
                <p class="text-muted small">Please present this receipt at the event entrance.</p>
            </div>
        </div>
    `;
}

// Download receipt as PDF (simulated)
function downloadReceipt(booking) {
    const receiptContent = generateReceiptHTML(booking);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Receipt - ${booking.transactionId}</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>
                    body { padding: 20px; }
                    @media print {
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                ${receiptContent}
                <div class="text-center mt-3 no-print">
                    <button class="btn btn-primary" onclick="window.print()">Print Receipt</button>
                    <button class="btn btn-secondary" onclick="window.close()">Close</button>
                </div>
            </body>
        </html>
    `);
    printWindow.document.close();
    
    showAlert('Receipt opened in new window. You can print it as PDF.', 'success');
}

// Email receipt (simulated)
function emailReceipt(booking) {
    const user = getCurrentUser();
    showAlert(`Receipt has been sent to ${user.email}`, 'success');
}

// Redirect to login if not authenticated
function requireAuth() {
    if (!checkAuthStatus()) {
        showAlert('Please login to access this page', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return false;
    }
    return true;
}

// Redirect to home if already authenticated (for login/register pages)
function redirectIfAuthenticated() {
    if (checkAuthStatus()) {
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    }
}

// Check if user is admin
function isAdmin() {
    const currentUser = getCurrentUser();
    return currentUser && currentUser.role === 'admin';
}

// Require admin access
function requireAdmin() {
    if (!checkAuthStatus()) {
        showAlert('Please login to access admin panel', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return false;
    }
    
    if (!isAdmin()) {
        showAlert('Access denied. Admin privileges required.', 'danger');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        return false;
    }
    
    return true;
}