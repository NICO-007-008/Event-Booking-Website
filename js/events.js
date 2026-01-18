// Events functionality

// Display featured events on home page
function displayFeaturedEvents() {
    const featuredEventsContainer = document.getElementById('featuredEvents');
    if (!featuredEventsContainer) return;
    
    const events = getAllEvents();
    const featuredEvents = events.filter(event => event.featured).slice(0, 3);
    
    if (featuredEvents.length === 0) {
        featuredEventsContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">
                    No featured events available at the moment. Check back soon!
                </div>
            </div>
        `;
        return;
    }
    
    featuredEventsContainer.innerHTML = featuredEvents.map(event => `
        <div class="col-md-4 mb-4">
            <div class="card event-card h-100 shadow-sm">
                <div class="position-relative">
                    <img src="${event.images[0]}" class="card-img-top event-card-img" alt="${event.title}">
                    ${event.availableSeats < 20 ? `
                        <span class="badge bg-danger event-badge">Almost Full!</span>
                    ` : ''}
                </div>
                <div class="card-body d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title fw-bold mb-0">${event.title}</h5>
                        <span class="badge bg-primary">${event.category}</span>
                    </div>
                    <p class="card-text text-muted small flex-grow-1">${event.description.substring(0, 100)}...</p>
                    <div class="d-flex justify-content-between align-items-center mt-2">
                        <div>
                            <span class="fw-bold text-primary">${formatCurrency(event.price)}</span>
                            <span class="text-muted small ms-1">from</span>
                        </div>
                        <div class="rating">
                            <i class="bi bi-star-fill text-warning"></i>
                            <span class="fw-bold">${event.rating}</span>
                            <span class="text-muted small">(${event.totalReviews})</span>
                        </div>
                    </div>
                    <div class="mt-3">
                        <div class="d-flex justify-content-between small text-muted mb-2">
                            <span><i class="bi bi-calendar me-1"></i>${formatDate(event.date)}</span>
                            <span><i class="bi bi-clock me-1"></i>${event.time}</span>
                        </div>
                        <div class="small text-muted mb-3">
                            <i class="bi bi-geo-alt me-1"></i>${event.location}
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-light text-dark">
                                <i class="bi bi-people me-1"></i>${event.availableSeats} seats left
                            </span>
                            <a href="event-detail.html?id=${event.id}" class="btn btn-primary btn-sm">View Details</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Display all events on events page
function displayAllEvents() {
    const eventsContainer = document.getElementById('allEvents');
    if (!eventsContainer) return;
    
    const events = getAllEvents();
    
    if (events.length === 0) {
        eventsContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">
                    No events available at the moment. Check back soon!
                </div>
            </div>
        `;
        return;
    }
    
    eventsContainer.innerHTML = events.map(event => `
        <div class="col-lg-4 col-md-6 mb-4">
            <div class="card event-card h-100 shadow-sm">
                <div class="position-relative">
                    <img src="${event.images[0]}" class="card-img-top event-card-img" alt="${event.title}">
                    ${event.availableSeats < 10 ? `
                        <span class="badge bg-danger event-badge">Selling Fast!</span>
                    ` : event.featured ? `
                        <span class="badge bg-warning event-badge">Featured</span>
                    ` : ''}
                </div>
                <div class="card-body d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title fw-bold mb-0">${event.title}</h5>
                        <span class="badge bg-primary">${event.category}</span>
                    </div>
                    <p class="card-text text-muted small flex-grow-1">${event.description.substring(0, 100)}...</p>
                    <div class="d-flex justify-content-between align-items-center mt-2">
                        <div>
                            <span class="fw-bold text-primary">${formatCurrency(event.price)}</span>
                            <span class="text-muted small ms-1">from</span>
                        </div>
                        <div class="rating">
                            <i class="bi bi-star-fill text-warning"></i>
                            <span class="fw-bold">${event.rating}</span>
                            <span class="text-muted small">(${event.totalReviews})</span>
                        </div>
                    </div>
                    <div class="mt-3">
                        <div class="d-flex justify-content-between small text-muted mb-2">
                            <span><i class="bi bi-calendar me-1"></i>${formatDate(event.date)}</span>
                            <span><i class="bi bi-clock me-1"></i>${event.time}</span>
                        </div>
                        <div class="small text-muted mb-3">
                            <i class="bi bi-geo-alt me-1"></i>${event.location}
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-light text-dark">
                                <i class="bi bi-people me-1"></i>${event.availableSeats} seats left
                            </span>
                            <a href="event-detail.html?id=${event.id}" class="btn btn-primary btn-sm">Book Now</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Filter events by category or search
function filterEvents() {
    const searchInput = document.getElementById('searchEvents');
    const categoryFilter = document.getElementById('categoryFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            applyFilters();
        });
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            applyFilters();
        });
    }
}

function applyFilters() {
    const searchTerm = document.getElementById('searchEvents')?.value.toLowerCase() || '';
    const category = document.getElementById('categoryFilter')?.value || 'all';
    
    const events = getAllEvents();
    const eventsContainer = document.getElementById('allEvents');
    
    if (!eventsContainer) return;
    
    let filteredEvents = events;
    
    // Apply search filter
    if (searchTerm) {
        filteredEvents = filteredEvents.filter(event => 
            event.title.toLowerCase().includes(searchTerm) ||
            event.description.toLowerCase().includes(searchTerm) ||
            event.location.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply category filter
    if (category !== 'all') {
        filteredEvents = filteredEvents.filter(event => event.category === category);
    }
    
    // Display filtered events
    if (filteredEvents.length === 0) {
        eventsContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">
                    No events found matching your criteria.
                </div>
            </div>
        `;
        return;
    }
    
    eventsContainer.innerHTML = filteredEvents.map(event => `
        <div class="col-lg-4 col-md-6 mb-4">
            <div class="card event-card h-100 shadow-sm">
                <div class="position-relative">
                    <img src="${event.images[0]}" class="card-img-top event-card-img" alt="${event.title}">
                    ${event.availableSeats < 10 ? `
                        <span class="badge bg-danger event-badge">Selling Fast!</span>
                    ` : event.featured ? `
                        <span class="badge bg-warning event-badge">Featured</span>
                    ` : ''}
                </div>
                <div class="card-body d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title fw-bold mb-0">${event.title}</h5>
                        <span class="badge bg-primary">${event.category}</span>
                    </div>
                    <p class="card-text text-muted small flex-grow-1">${event.description.substring(0, 100)}...</p>
                    <div class="d-flex justify-content-between align-items-center mt-2">
                        <div>
                            <span class="fw-bold text-primary">${formatCurrency(event.price)}</span>
                            <span class="text-muted small ms-1">from</span>
                        </div>
                        <div class="rating">
                            <i class="bi bi-star-fill text-warning"></i>
                            <span class="fw-bold">${event.rating}</span>
                            <span class="text-muted small">(${event.totalReviews})</span>
                        </div>
                    </div>
                    <div class="mt-3">
                        <div class="d-flex justify-content-between small text-muted mb-2">
                            <span><i class="bi bi-calendar me-1"></i>${formatDate(event.date)}</span>
                            <span><i class="bi bi-clock me-1"></i>${event.time}</span>
                        </div>
                        <div class="small text-muted mb-3">
                            <i class="bi bi-geo-alt me-1"></i>${event.location}
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-light text-dark">
                                <i class="bi bi-people me-1"></i>${event.availableSeats} seats left
                            </span>
                            <a href="event-detail.html?id=${event.id}" class="btn btn-primary btn-sm">Book Now</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Initialize events functionality
document.addEventListener('DOMContentLoaded', function() {
    // Display events based on page
    if (document.getElementById('featuredEvents')) {
        displayFeaturedEvents();
    }
    
    if (document.getElementById('allEvents')) {
        displayAllEvents();
        filterEvents();
    }
});