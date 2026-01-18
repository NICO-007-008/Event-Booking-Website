// Admin Panel Functionality

let currentCharts = {};

// Initialize admin panel
function initializeAdminPanel() {
    if (!requireAdmin()) return;
    
    // Load dashboard data
    loadDashboardData();
    
    // Load events management
    loadEventsManagement();
    
    // Load bookings management
    loadBookingsManagement();
    
    // Load users management
    loadUsersManagement();
    
    // Initialize tab switching
    initializeTabs();
    
    // Add logout handler
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
}

// Load dashboard data
function loadDashboardData() {
    const events = getAllEvents();
    const bookings = getAllBookings();
    const users = getAllUsers();
    
    // Update stats
    document.getElementById('totalEvents').textContent = events.length;
    document.getElementById('totalBookings').textContent = bookings.length;
    document.getElementById('totalUsers').textContent = users.length;
    
    // Calculate total revenue
    const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
    document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
    
    // Load recent bookings
    loadRecentBookings();
    
    // Initialize charts if on reports tab
    const activeTab = document.querySelector('.tab-pane.active');
    if (activeTab && activeTab.id === 'reports') {
        initializeCharts();
    }
}

// Load recent bookings
function loadRecentBookings() {
    const bookings = getAllBookings().slice(-5).reverse(); // Get last 5 bookings
    const events = getAllEvents();
    const users = getAllUsers();
    
    const recentBookingsContainer = document.getElementById('recentBookings');
    if (!recentBookingsContainer) return;
    
    if (bookings.length === 0) {
        recentBookingsContainer.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">No bookings found</td>
            </tr>
        `;
        return;
    }
    
    recentBookingsContainer.innerHTML = bookings.map(booking => {
        const event = events.find(e => e.id === booking.eventId) || {};
        const user = users.find(u => u.id === booking.userId) || {};
        
        return `
            <tr>
                <td><span class="badge bg-light text-dark">${booking.transactionId}</span></td>
                <td>${event.title || 'N/A'}</td>
                <td>${user.name || 'N/A'}</td>
                <td>${new Date(booking.bookingDate).toLocaleDateString()}</td>
                <td>${formatCurrency(booking.totalAmount || 0)}</td>
                <td>
                    <span class="badge ${booking.status === 'confirmed' ? 'bg-success' : 'bg-warning'}">
                        ${booking.status || 'pending'}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

// Load events management
function loadEventsManagement() {
    const events = getAllEvents();
    const eventsTableBody = document.getElementById('eventsTableBody');
    
    if (!eventsTableBody) return;
    
    if (events.length === 0) {
        eventsTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4">No events found</td>
            </tr>
        `;
        return;
    }
    
    eventsTableBody.innerHTML = events.map(event => `
        <tr>
            <td>${event.id}</td>
            <td>
                <strong>${event.title}</strong>
                ${event.featured ? '<span class="badge bg-warning ms-2">Featured</span>' : ''}
            </td>
            <td><span class="badge bg-primary">${event.category}</span></td>
            <td>${formatDate(event.date)}</td>
            <td>
                <div class="progress" style="height: 6px;">
                    <div class="progress-bar ${event.availableSeats < event.totalSeats * 0.2 ? 'bg-danger' : 'bg-success'}" 
                         style="width: ${((event.totalSeats - event.availableSeats) / event.totalSeats) * 100}%">
                    </div>
                </div>
                <small>${event.availableSeats} / ${event.totalSeats} available</small>
            </td>
            <td>${formatCurrency(event.price)}</td>
            <td>
                <span class="badge ${event.availableSeats === 0 ? 'bg-danger' : 'bg-success'}">
                    ${event.availableSeats === 0 ? 'Sold Out' : 'Active'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewEvent(${event.id})" title="View">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning" onclick="editEvent(${event.id})" title="Edit">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteEvent(${event.id})" title="Delete">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    // Initialize search
    const searchInput = document.getElementById('searchEventsAdmin');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = eventsTableBody.querySelectorAll('tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
}

// Load bookings management
function loadBookingsManagement() {
    const bookings = getAllBookings();
    const events = getAllEvents();
    const users = getAllUsers();
    
    const bookingsTableBody = document.getElementById('bookingsTableBody');
    const filterEventSelect = document.getElementById('filterEvent');
    
    if (!bookingsTableBody) return;
    
    // Populate event filter
    if (filterEventSelect) {
        filterEventSelect.innerHTML = '<option value="">All Events</option>' + 
            events.map(event => `<option value="${event.id}">${event.title}</option>`).join('');
    }
    
    if (bookings.length === 0) {
        bookingsTableBody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center py-4">No bookings found</td>
            </tr>
        `;
        return;
    }
    
    // Display all bookings initially
    displayFilteredBookings(bookings, events, users);
}

// Display filtered bookings
function displayFilteredBookings(bookings, events, users) {
    const bookingsTableBody = document.getElementById('bookingsTableBody');
    
    bookingsTableBody.innerHTML = bookings.map(booking => {
        const event = events.find(e => e.id === booking.eventId) || {};
        const user = users.find(u => u.id === booking.userId) || {};
        
        return `
            <tr>
                <td><span class="badge bg-light text-dark">${booking.transactionId}</span></td>
                <td>${event.title || 'N/A'}</td>
                <td>${user.name || 'N/A'}<br><small>${user.email || ''}</small></td>
                <td>
                    ${booking.seats.map(seat => `
                        <span class="badge bg-primary me-1">${seat.id}</span>
                    `).join('')}
                </td>
                <td>${new Date(booking.bookingDate).toLocaleDateString()}</td>
                <td>${formatCurrency(booking.totalAmount || 0)}</td>
                <td>${booking.paymentMethod || 'N/A'}</td>
                <td>
                    <span class="badge ${booking.status === 'confirmed' ? 'bg-success' : 
                                      booking.status === 'cancelled' ? 'bg-danger' : 'bg-warning'}">
                        ${booking.status || 'pending'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewBookingDetails(${booking.id})" title="View">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="cancelBooking(${booking.id})" title="Cancel" 
                        ${booking.status === 'cancelled' ? 'disabled' : ''}>
                        <i class="bi bi-x-circle"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Apply booking filters
function applyBookingFilters() {
    const eventId = document.getElementById('filterEvent').value;
    const date = document.getElementById('filterDate').value;
    const status = document.getElementById('filterStatus').value;
    
    let filteredBookings = getAllBookings();
    const events = getAllEvents();
    const users = getAllUsers();
    
    // Apply event filter
    if (eventId) {
        filteredBookings = filteredBookings.filter(booking => booking.eventId == eventId);
    }
    
    // Apply date filter
    if (date) {
        filteredBookings = filteredBookings.filter(booking => {
            const bookingDate = new Date(booking.bookingDate).toISOString().split('T')[0];
            return bookingDate === date;
        });
    }
    
    // Apply status filter
    if (status) {
        filteredBookings = filteredBookings.filter(booking => booking.status === status);
    }
    
    displayFilteredBookings(filteredBookings, events, users);
}

// Load users management
function loadUsersManagement() {
    const users = getAllUsers();
    const bookings = getAllBookings();
    
    const usersTableBody = document.getElementById('usersTableBody');
    if (!usersTableBody) return;
    
    usersTableBody.innerHTML = users.map(user => {
        const userBookings = bookings.filter(b => b.userId === user.id);
        
        return `
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.phone || 'N/A'}</td>
                <td>
                    <span class="badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}">
                        ${user.role}
                    </span>
                </td>
                <td>${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td>${userBookings.length} bookings</td>
                <td>
                    <button class="btn btn-sm btn-outline-warning" onclick="editUser(${user.id})" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    ${user.role !== 'admin' ? `
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${user.id})" title="Delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

// Initialize charts for reports
function initializeCharts() {
    // Destroy existing charts
    Object.values(currentCharts).forEach(chart => {
        if (chart) chart.destroy();
    });
    
    // Get data
    const bookings = getAllBookings();
    const events = getAllEvents();
    
    // Booking Trends Chart
    const bookingChartCtx = document.getElementById('bookingChart');
    if (bookingChartCtx) {
        const last30Days = getLastNDays(30);
        const bookingsByDay = groupBookingsByDay(bookings, last30Days);
        
        currentCharts.bookingChart = new Chart(bookingChartCtx, {
            type: 'line',
            data: {
                labels: last30Days.map(date => formatDateShort(date)),
                datasets: [{
                    label: 'Bookings',
                    data: bookingsByDay,
                    borderColor: 'rgb(67, 97, 238)',
                    backgroundColor: 'rgba(67, 97, 238, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    // Category Revenue Chart
    const categoryChartCtx = document.getElementById('categoryChart');
    if (categoryChartCtx) {
        const revenueByCategory = calculateRevenueByCategory(bookings, events);
        
        currentCharts.categoryChart = new Chart(categoryChartCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(revenueByCategory),
                datasets: [{
                    data: Object.values(revenueByCategory),
                    backgroundColor: [
                        '#4361ee', '#4cc9f0', '#4bb543', '#ff9e00', '#e63946', '#7209b7'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }
    
    // Payment Methods Chart
    const paymentChartCtx = document.getElementById('paymentChart');
    if (paymentChartCtx) {
        const paymentMethods = groupByPaymentMethod(bookings);
        
        currentCharts.paymentChart = new Chart(paymentChartCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(paymentMethods),
                datasets: [{
                    data: Object.values(paymentMethods),
                    backgroundColor: [
                        '#4361ee', '#4bb543', '#4cc9f0', '#ff9e00', '#7209b7'
                    ]
                }]
            },
            options: {
                responsive: true
            }
        });
    }
    
    // Load top events
    loadTopEvents(bookings, events);
}

// Helper function to get last N days
function getLastNDays(n) {
    const dates = [];
    for (let i = n - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
}

// Helper function to group bookings by day
function groupBookingsByDay(bookings, dates) {
    const bookingsByDate = {};
    bookings.forEach(booking => {
        const date = booking.bookingDate.split('T')[0];
        bookingsByDate[date] = (bookingsByDate[date] || 0) + 1;
    });
    
    return dates.map(date => bookingsByDate[date] || 0);
}

// Helper function to format date short
function formatDateShort(dateString) {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}`;
}

// Calculate revenue by category
function calculateRevenueByCategory(bookings, events) {
    const revenueByCategory = {};
    
    bookings.forEach(booking => {
        const event = events.find(e => e.id === booking.eventId);
        if (event) {
            revenueByCategory[event.category] = (revenueByCategory[event.category] || 0) + (booking.totalAmount || 0);
        }
    });
    
    return revenueByCategory;
}

// Group by payment method
function groupByPaymentMethod(bookings) {
    const methods = {};
    bookings.forEach(booking => {
        const method = booking.paymentMethod || 'Unknown';
        methods[method] = (methods[method] || 0) + 1;
    });
    return methods;
}

// Load top events
function loadTopEvents(bookings, events) {
    const eventBookings = {};
    
    bookings.forEach(booking => {
        eventBookings[booking.eventId] = (eventBookings[booking.eventId] || 0) + 1;
    });
    
    const topEvents = Object.entries(eventBookings)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    const topEventsContainer = document.getElementById('topEvents');
    if (!topEventsContainer) return;
    
    if (topEvents.length === 0) {
        topEventsContainer.innerHTML = '<p class="text-muted">No bookings yet</p>';
        return;
    }
    
    topEventsContainer.innerHTML = topEvents.map(([eventId, count]) => {
        const event = events.find(e => e.id == eventId);
        if (!event) return '';
        
        return `
            <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                <div>
                    <h6 class="mb-0">${event.title}</h6>
                    <small class="text-muted">${event.category}</small>
                </div>
                <span class="badge bg-primary">${count} bookings</span>
            </div>
        `;
    }).join('');
}

// Event Management Functions
function viewEvent(eventId) {
    window.location.href = `event-detail.html?id=${eventId}`;
}

function editEvent(eventId) {
    const events = getAllEvents();
    const event = events.find(e => e.id === eventId);
    
    if (!event) {
        showAlert('Event not found', 'danger');
        return;
    }
    
    const editModalBody = document.getElementById('editEventModalBody');
    editModalBody.innerHTML = `
        <form id="editEventForm" data-event-id="${event.id}">
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label">Event Title</label>
                    <input type="text" class="form-control" name="title" value="${event.title}" required>
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">Category</label>
                    <select class="form-select" name="category" required>
                        <option value="Music" ${event.category === 'Music' ? 'selected' : ''}>Music</option>
                        <option value="Conference" ${event.category === 'Conference' ? 'selected' : ''}>Conference</option>
                        <option value="Food & Drink" ${event.category === 'Food & Drink' ? 'selected' : ''}>Food & Drink</option>
                        <option value="Sports" ${event.category === 'Sports' ? 'selected' : ''}>Sports</option>
                        <option value="Arts" ${event.category === 'Arts' ? 'selected' : ''}>Arts</option>
                        <option value="Workshop" ${event.category === 'Workshop' ? 'selected' : ''}>Workshop</option>
                    </select>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label">Date</label>
                    <input type="date" class="form-control" name="date" value="${formatDateForInput(event.date)}" required>
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">Time</label>
                    <input type="time" class="form-control" name="time" value="${event.time}" required>
                </div>
            </div>
            
            <div class="mb-3">
                <label class="form-label">Location</label>
                <input type="text" class="form-control" name="location" value="${event.location}" required>
            </div>
            
            <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea class="form-control" name="description" rows="3" required>${event.description}</textarea>
            </div>
            
            <div class="row">
                <div class="col-md-4 mb-3">
                    <label class="form-label">Base Price (₱)</label>
                    <input type="number" class="form-control" name="price" value="${event.price}" required>
                </div>
                <div class="col-md-4 mb-3">
                    <label class="form-label">VIP Price (₱)</label>
                    <input type="number" class="form-control" name="vipPrice" value="${event.seatPrices?.VIP || event.price * 1.5}" required>
                </div>
                <div class="col-md-4 mb-3">
                    <label class="form-label">Total Seats</label>
                    <input type="number" class="form-control" name="totalSeats" value="${event.totalSeats}" readonly>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-4 mb-3">
                    <label class="form-label">Premium Price (₱)</label>
                    <input type="number" class="form-control" name="premiumPrice" value="${event.seatPrices?.Premium || event.price * 1.3}" required>
                </div>
                <div class="col-md-4 mb-3">
                    <label class="form-label">Standard Price (₱)</label>
                    <input type="number" class="form-control" name="standardPrice" value="${event.seatPrices?.Standard || event.price}" required>
                </div>
                <div class="col-md-4 mb-3">
                    <label class="form-label">Available Seats</label>
                    <input type="number" class="form-control" name="availableSeats" value="${event.availableSeats}" required>
                </div>
            </div>
            
            <div class="mb-3">
                <label class="form-label">Performers (comma separated)</label>
                <input type="text" class="form-control" name="performers" value="${event.performers?.join(', ') || ''}">
            </div>
            
            <div class="mb-3">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" name="featured" ${event.featured ? 'checked' : ''}>
                    <label class="form-check-label">Featured Event</label>
                </div>
            </div>
            
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" class="btn btn-primary">Save Changes</button>
                <button type="button" class="btn btn-danger" onclick="deleteEvent(${event.id})" data-bs-dismiss="modal">
                    Delete Event
                </button>
            </div>
        </form>
    `;
    
    // Add form submit handler
    const form = document.getElementById('editEventForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        updateEvent(eventId);
    });
    
    // Show modal
    const editModal = new bootstrap.Modal(document.getElementById('editEventModal'));
    editModal.show();
}

function updateEvent(eventId) {
    const form = document.getElementById('editEventForm');
    const formData = new FormData(form);
    
    const events = getAllEvents();
    const eventIndex = events.findIndex(e => e.id === eventId);
    
    if (eventIndex === -1) {
        showAlert('Event not found', 'danger');
        return;
    }
    
    // Update event
    events[eventIndex] = {
        ...events[eventIndex],
        title: formData.get('title'),
        category: formData.get('category'),
        date: formData.get('date'),
        time: formData.get('time'),
        location: formData.get('location'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        seatPrices: {
            'VIP': parseFloat(formData.get('vipPrice')),
            'Premium': parseFloat(formData.get('premiumPrice')),
            'Standard': parseFloat(formData.get('standardPrice'))
        },
        availableSeats: parseInt(formData.get('availableSeats')),
        performers: formData.get('performers') ? formData.get('performers').split(',').map(p => p.trim()) : [],
        featured: formData.get('featured') === 'on'
    };
    
    // Save events
    localStorage.setItem('events', JSON.stringify(events));
    
    // Close modal
    const editModal = bootstrap.Modal.getInstance(document.getElementById('editEventModal'));
    editModal.hide();
    
    // Refresh events list
    loadEventsManagement();
    
    showAlert('Event updated successfully!', 'success');
}

function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
        return;
    }
    
    const events = getAllEvents();
    const eventIndex = events.findIndex(e => e.id === eventId);
    
    if (eventIndex === -1) {
        showAlert('Event not found', 'danger');
        return;
    }
    
    // Check if event has bookings
    const bookings = getAllBookings();
    const eventBookings = bookings.filter(b => b.eventId === eventId);
    
    if (eventBookings.length > 0) {
        if (!confirm(`This event has ${eventBookings.length} bookings. Are you sure you want to delete it?`)) {
            return;
        }
    }
    
    // Remove event
    events.splice(eventIndex, 1);
    localStorage.setItem('events', JSON.stringify(events));
    
    // Refresh events list
    loadEventsManagement();
    
    showAlert('Event deleted successfully!', 'success');
}

function createEvent() {
    const form = document.getElementById('createEventForm');
    const formData = new FormData(form);
    
    const events = getAllEvents();
    const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
    
    const rows = parseInt(formData.get('rows'));
    const cols = Math.ceil(parseInt(formData.get('totalSeats')) / rows);
    
    const newEvent = {
        id: newId,
        title: formData.get('title'),
        description: formData.get('description'),
        date: formData.get('date'),
        time: formData.get('time'),
        location: formData.get('location'),
        category: formData.get('category'),
        price: parseFloat(formData.get('price')),
        rating: 4.5,
        totalReviews: 0,
        images: [
            'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ],
        performers: formData.get('performers') ? formData.get('performers').split(',').map(p => p.trim()) : [],
        seatMap: generateSeatMap(rows, cols),
        seatPrices: {
            'VIP': parseFloat(formData.get('vipPrice')),
            'Premium': parseFloat(formData.get('premiumPrice')),
            'Standard': parseFloat(formData.get('standardPrice'))
        },
        featured: formData.get('featured') === 'on',
        availableSeats: parseInt(formData.get('totalSeats')),
        totalSeats: parseInt(formData.get('totalSeats'))
    };
    
    // Add event
    events.push(newEvent);
    localStorage.setItem('events', JSON.stringify(events));
    
    // Close modal
    const createModal = bootstrap.Modal.getInstance(document.getElementById('createEventModal'));
    createModal.hide();
    
    // Reset form
    form.reset();
    
    // Refresh events list
    loadEventsManagement();
    
    showAlert('Event created successfully!', 'success');
}

// Booking Management Functions
function viewBookingDetails(bookingId) {
    const bookings = getAllBookings();
    const booking = bookings.find(b => b.id == bookingId);
    const events = getAllEvents();
    const users = getAllUsers();
    
    if (!booking) {
        showAlert('Booking not found', 'danger');
        return;
    }
    
    const event = events.find(e => e.id === booking.eventId) || {};
    const user = users.find(u => u.id === booking.userId) || {};
    
    const modalBody = document.getElementById('viewBookingModalBody');
    modalBody.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <h5>Booking Information</h5>
                <p><strong>Transaction ID:</strong> ${booking.transactionId}</p>
                <p><strong>Booking Date:</strong> ${new Date(booking.bookingDate).toLocaleString()}</p>
                <p><strong>Status:</strong> 
                    <span class="badge ${booking.status === 'confirmed' ? 'bg-success' : 'bg-warning'}">
                        ${booking.status}
                    </span>
                </p>
                <p><strong>Payment Method:</strong> ${booking.paymentMethod}</p>
                <p><strong>Total Amount:</strong> ${formatCurrency(booking.totalAmount || 0)}</p>
            </div>
            <div class="col-md-6">
                <h5>Customer Information</h5>
                <p><strong>Name:</strong> ${user.name || 'N/A'}</p>
                <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
                <p><strong>Phone:</strong> ${user.phone || 'N/A'}</p>
            </div>
        </div>
        
        <div class="mt-4">
            <h5>Event Information</h5>
            <p><strong>Event:</strong> ${event.title || 'N/A'}</p>
            <p><strong>Date:</strong> ${event.date ? formatDate(event.date) : 'N/A'}</p>
            <p><strong>Time:</strong> ${event.time || 'N/A'}</p>
            <p><strong>Location:</strong> ${event.location || 'N/A'}</p>
        </div>
        
        <div class="mt-4">
            <h5>Selected Seats</h5>
            <div class="d-flex flex-wrap gap-2">
                ${booking.seats.map(seat => `
                    <span class="badge bg-primary p-2">
                        ${seat.id} (${seat.type})
                    </span>
                `).join('')}
            </div>
        </div>
        
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" onclick="downloadReceipt(${JSON.stringify(booking).replace(/"/g, '&quot;')})">
                <i class="bi bi-download me-1"></i> Download Receipt
            </button>
            ${booking.status !== 'cancelled' ? `
                <button type="button" class="btn btn-danger" onclick="cancelBooking(${booking.id})" data-bs-dismiss="modal">
                    Cancel Booking
                </button>
            ` : ''}
        </div>
    `;
    
    const viewModal = new bootstrap.Modal(document.getElementById('viewBookingModal'));
    viewModal.show();
}

function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }
    
    const bookings = getAllBookings();
    const bookingIndex = bookings.findIndex(b => b.id == bookingId);
    
    if (bookingIndex === -1) {
        showAlert('Booking not found', 'danger');
        return;
    }
    
    // Update booking status
    bookings[bookingIndex].status = 'cancelled';
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    // Refresh bookings list
    loadBookingsManagement();
    
    showAlert('Booking cancelled successfully!', 'success');
}

// User Management Functions
function editUser(userId) {
    // Implement user editing
    showAlert('User editing functionality coming soon!', 'info');
}

function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return;
    }
    
    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.id == userId);
    
    if (userIndex === -1) {
        showAlert('User not found', 'danger');
        return;
    }
    
    // Check if user has bookings
    const bookings = getAllBookings();
    const userBookings = bookings.filter(b => b.userId == userId);
    
    if (userBookings.length > 0) {
        if (!confirm(`This user has ${userBookings.length} bookings. Deleting the user will also delete their bookings. Are you sure?`)) {
            return;
        }
        
        // Remove user's bookings
        const filteredBookings = bookings.filter(b => b.userId != userId);
        localStorage.setItem('bookings', JSON.stringify(filteredBookings));
    }
    
    // Remove user
    users.splice(userIndex, 1);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Refresh users list
    loadUsersManagement();
    
    showAlert('User deleted successfully!', 'success');
}

// Export bookings
function exportBookings() {
    const bookings = getAllBookings();
    const events = getAllEvents();
    const users = getAllUsers();
    
    // Create CSV content
    let csv = 'Transaction ID,Event,Customer,Seats,Booking Date,Amount,Payment Method,Status\n';
    
    bookings.forEach(booking => {
        const event = events.find(e => e.id === booking.eventId) || {};
        const user = users.find(u => u.id === booking.userId) || {};
        
        csv += `"${booking.transactionId}","${event.title || 'N/A'}","${user.name || 'N/A'}",`;
        csv += `"${booking.seats.map(s => s.id).join(', ')}","${new Date(booking.bookingDate).toLocaleDateString()}",`;
        csv += `"${formatCurrency(booking.totalAmount || 0)}","${booking.paymentMethod || 'N/A'}","${booking.status || 'pending'}"\n`;
    });
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showAlert('Bookings exported successfully!', 'success');
}

// Initialize tabs
function initializeTabs() {
    const tabLinks = document.querySelectorAll('[data-bs-toggle="tab"]');
    tabLinks.forEach(link => {
        link.addEventListener('shown.bs.tab', function(e) {
            const target = e.target.getAttribute('href');
            
            if (target === '#reports') {
                // Initialize charts when reports tab is shown
                setTimeout(initializeCharts, 100);
            } else if (target === '#events') {
                loadEventsManagement();
            } else if (target === '#bookings') {
                loadBookingsManagement();
            } else if (target === '#users') {
                loadUsersManagement();
            }
        });
    });
}

// Refresh dashboard
function refreshDashboard() {
    loadDashboardData();
    showAlert('Dashboard refreshed!', 'success');
}

// Initialize admin panel when page loads
document.addEventListener('DOMContentLoaded', initializeAdminPanel);