// Booking functionality

let selectedSeats = [];
let currentEvent = null;

// Load event details for booking page
function loadEventDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = parseInt(urlParams.get('id'));
    
    if (!eventId) {
        showAlert('No event specified. Redirecting to events page.', 'warning');
        setTimeout(() => {
            window.location.href = 'events.html';
        }, 2000);
        return;
    }
    
    const events = getAllEvents();
    currentEvent = events.find(e => e.id === eventId);
    
    if (!currentEvent) {
        showAlert('Event not found. Redirecting to events page.', 'danger');
        setTimeout(() => {
            window.location.href = 'events.html';
        }, 2000);
        return;
    }
    
    // Update page with event details
    document.title = `${currentEvent.title} - EventHub`;
    
    // Update event header
    const eventHeader = document.getElementById('eventHeader');
    if (eventHeader) {
        eventHeader.innerHTML = `
            <h1 class="fw-bold">${currentEvent.title}</h1>
            <div class="d-flex flex-wrap align-items-center gap-3">
                <span class="badge bg-primary">${currentEvent.category}</span>
                <div class="rating">
                    <i class="bi bi-star-fill text-warning"></i>
                    <span class="fw-bold">${currentEvent.rating}</span>
                    <span class="text-muted">(${currentEvent.totalReviews} reviews)</span>
                </div>
                <div class="text-muted">
                    <i class="bi bi-calendar me-1"></i>${formatDate(currentEvent.date)} at ${currentEvent.time}
                </div>
                <div class="text-muted">
                    <i class="bi bi-geo-alt me-1"></i>${currentEvent.location}
                </div>
            </div>
        `;
    }
    
    // Update event images carousel
    const eventImages = document.getElementById('eventImages');
    if (eventImages) {
        eventImages.innerHTML = currentEvent.images.map((img, index) => `
            <div class="carousel-item ${index === 0 ? 'active' : ''}">
                <img src="${img}" class="d-block w-100 rounded" alt="Event image ${index + 1}" style="height: 400px; object-fit: cover;">
            </div>
        `).join('');
    }
    
    // Update event description
    const eventDescription = document.getElementById('eventDescription');
    if (eventDescription) {
        eventDescription.innerHTML = `
            <h3 class="fw-bold mb-3">About This Event</h3>
            <p class="lead">${currentEvent.description}</p>
            
            <h4 class="fw-bold mt-4 mb-3">Performers & Guests</h4>
            <div class="d-flex flex-wrap gap-2 mb-4">
                ${currentEvent.performers.map(performer => `
                    <span class="badge bg-secondary p-2">${performer}</span>
                `).join('')}
            </div>
            
            <div class="row mt-4">
                <div class="col-md-6">
                    <h5 class="fw-bold"><i class="bi bi-calendar-event me-2"></i>Date & Time</h5>
                    <p>${formatDate(currentEvent.date)}</p>
                    <p>${currentEvent.time}</p>
                </div>
                <div class="col-md-6">
                    <h5 class="fw-bold"><i class="bi bi-geo-alt me-2"></i>Location</h5>
                    <p>${currentEvent.location}</p>
                </div>
            </div>
        `;
    }
    
    // Update seat prices
    const seatPrices = document.getElementById('seatPrices');
    if (seatPrices) {
        seatPrices.innerHTML = Object.entries(currentEvent.seatPrices).map(([type, price]) => `
            <div class="d-flex justify-content-between align-items-center p-2 border-bottom">
                <div>
                    <span class="badge seat-${type.toLowerCase()} me-2">${type}</span>
                    <span>${type} Seats</span>
                </div>
                <span class="fw-bold">${formatCurrency(price)}</span>
            </div>
        `).join('');
    }
    
    // Render seat map
    renderSeatMap();
    
    // Update booking summary
    updateBookingSummary();
}

// Render the seat map
function renderSeatMap() {
    const seatMapContainer = document.getElementById('seatMap');
    if (!seatMapContainer || !currentEvent) return;
    
    seatMapContainer.innerHTML = '';
    
    // Add stage indicator
    seatMapContainer.innerHTML += `
        <div class="text-center mb-4 p-3 bg-dark text-white rounded">
            <h5 class="mb-0">STAGE</h5>
        </div>
    `;
    
    // Render each row
    currentEvent.seatMap.forEach((row, rowIndex) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'd-flex justify-content-center mb-2';
        
        // Add row label
        const rowLabel = document.createElement('div');
        rowLabel.className = 'fw-bold me-3 d-flex align-items-center';
        rowLabel.style.width = '40px';
        rowLabel.textContent = `Row ${rowIndex + 1}`;
        rowDiv.appendChild(rowLabel);
        
        // Add seats
        row.forEach(seat => {
            const seatDiv = document.createElement('div');
            seatDiv.className = `seat seat-${seat.type.toLowerCase()} ${seat.occupied ? 'seat-occupied' : 'seat-available'}`;
            seatDiv.textContent = seat.col;
            seatDiv.dataset.id = seat.id;
            seatDiv.dataset.row = seat.row;
            seatDiv.dataset.col = seat.col;
            seatDiv.dataset.type = seat.type;
            seatDiv.dataset.price = currentEvent.seatPrices[seat.type] || currentEvent.price;
            
            if (!seat.occupied) {
                seatDiv.addEventListener('click', () => toggleSeatSelection(seat.id));
            }
            
            rowDiv.appendChild(seatDiv);
        });
        
        seatMapContainer.appendChild(rowDiv);
    });
    
    // Add seat legend
    seatMapContainer.innerHTML += `
        <div class="mt-4 p-3 border rounded">
            <h6 class="fw-bold mb-3">Seat Legend</h6>
            <div class="d-flex flex-wrap gap-3">
                <div class="d-flex align-items-center">
                    <div class="seat seat-available me-2"></div>
                    <span>Available</span>
                </div>
                <div class="d-flex align-items-center">
                    <div class="seat seat-selected me-2"></div>
                    <span>Selected</span>
                </div>
                <div class="d-flex align-items-center">
                    <div class="seat seat-occupied me-2"></div>
                    <span>Occupied</span>
                </div>
                <div class="d-flex align-items-center">
                    <div class="seat seat-vip me-2"></div>
                    <span>VIP</span>
                </div>
                <div class="d-flex align-items-center">
                    <div class="seat seat-premium me-2"></div>
                    <span>Premium</span>
                </div>
                <div class="d-flex align-items-center">
                    <div class="seat seat-standard me-2"></div>
                    <span>Standard</span>
                </div>
            </div>
        </div>
    `;
}

// Toggle seat selection
function toggleSeatSelection(seatId) {
    if (!requireAuth()) return;
    
    // Find seat in current event
    let seat = null;
    for (let row of currentEvent.seatMap) {
        const foundSeat = row.find(s => s.id === seatId);
        if (foundSeat) {
            seat = foundSeat;
            break;
        }
    }
    
    if (!seat || seat.occupied) return;
    
    // Check if seat is already selected
    const seatIndex = selectedSeats.findIndex(s => s.id === seatId);
    
    if (seatIndex === -1) {
        // Add to selected seats
        selectedSeats.push({
            id: seatId,
            row: seat.row,
            col: seat.col,
            type: seat.type,
            price: currentEvent.seatPrices[seat.type] || currentEvent.price
        });
        
        // Update UI
        const seatElement = document.querySelector(`.seat[data-id="${seatId}"]`);
        seatElement.classList.remove('seat-available');
        seatElement.classList.add('seat-selected');
    } else {
        // Remove from selected seats
        selectedSeats.splice(seatIndex, 1);
        
        // Update UI
        const seatElement = document.querySelector(`.seat[data-id="${seatId}"]`);
        seatElement.classList.remove('seat-selected');
        seatElement.classList.add('seat-available');
    }
    
    // Update booking summary
    updateBookingSummary();
}

// Update booking summary
function updateBookingSummary() {
    const summaryContainer = document.getElementById('bookingSummary');
    if (!summaryContainer) return;
    
    if (selectedSeats.length === 0) {
        summaryContainer.innerHTML = `
            <div class="alert alert-info">
                <i class="bi bi-info-circle me-2"></i>Select seats to see booking summary
            </div>
        `;
        return;
    }
    
    // Calculate total
    const subtotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
    const serviceFee = subtotal * 0.05; // 5% service fee
    const total = subtotal + serviceFee;
    
    summaryContainer.innerHTML = `
        <h5 class="fw-bold mb-3">Booking Summary</h5>
        
        <div class="mb-3">
            <h6 class="fw-bold">Selected Seats:</h6>
            <div class="d-flex flex-wrap gap-2 mb-2">
                ${selectedSeats.map(seat => `
                    <span class="badge bg-primary p-2">
                        ${seat.id} (${seat.type})
                    </span>
                `).join('')}
            </div>
        </div>
        
        <div class="border-top border-bottom py-3">
            <div class="d-flex justify-content-between mb-2">
                <span>Subtotal (${selectedSeats.length} seat${selectedSeats.length > 1 ? 's' : ''}):</span>
                <span class="fw-bold">${formatCurrency(subtotal)}</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
                <span>Service Fee:</span>
                <span class="fw-bold">${formatCurrency(serviceFee)}</span>
            </div>
            <div class="d-flex justify-content-between">
                <span>Tax:</span>
                <span class="fw-bold">${formatCurrency(0)}</span>
            </div>
        </div>
        
        <div class="d-flex justify-content-between mt-3 pt-3 border-top">
            <h5 class="fw-bold">Total:</h5>
            <h5 class="fw-bold text-primary">${formatCurrency(total)}</h5>
        </div>
        
        <div class="mt-4">
            ${checkAuthStatus() ? `
                <button class="btn btn-primary w-100 btn-lg" onclick="proceedToPayment()">
                    <i class="bi bi-credit-card me-2"></i>Proceed to Payment
                </button>
            ` : `
                <div class="alert alert-warning">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Please <a href="login.html" class="alert-link">login</a> to book tickets
                </div>
            `}
        </div>
    `;
}

// Proceed to payment
function proceedToPayment() {
    if (selectedSeats.length === 0) {
        showAlert('Please select at least one seat', 'warning');
        return;
    }
    
    // Calculate total
    const subtotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
    const serviceFee = subtotal * 0.05;
    const total = subtotal + serviceFee;
    
    // Show payment modal
    const paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
    paymentModal.show();
    
    // Update payment summary
    document.getElementById('paymentEventTitle').textContent = currentEvent.title;
    document.getElementById('paymentEventDate').textContent = `${formatDate(currentEvent.date)} at ${currentEvent.time}`;
    document.getElementById('paymentEventLocation').textContent = currentEvent.location;
    document.getElementById('paymentSeats').innerHTML = selectedSeats.map(seat => `
        <div class="d-flex justify-content-between">
            <span>${seat.id} (${seat.type})</span>
            <span>${formatCurrency(seat.price)}</span>
        </div>
    `).join('');
    document.getElementById('paymentSubtotal').textContent = formatCurrency(subtotal);
    document.getElementById('paymentServiceFee').textContent = formatCurrency(serviceFee);
    document.getElementById('paymentTotal').textContent = formatCurrency(total);
    
    // Initialize payment method selection
    initializePaymentMethods();
}

// Initialize payment methods
function initializePaymentMethods() {
    const paymentMethods = document.querySelectorAll('.payment-method');
    paymentMethods.forEach(method => {
        method.addEventListener('click', function() {
            // Remove selected class from all
            paymentMethods.forEach(m => m.classList.remove('selected'));
            
            // Add selected class to clicked
            this.classList.add('selected');
            
            // Enable pay button
            document.getElementById('confirmPaymentBtn').disabled = false;
        });
    });
}

// Handle payment confirmation
function handlePayment() {
    const selectedMethod = document.querySelector('.payment-method.selected');
    if (!selectedMethod) {
        showAlert('Please select a payment method', 'warning');
        return;
    }
    
    const paymentMethod = selectedMethod.querySelector('span').textContent;
    
    // Create booking
    const booking = {
        id: Date.now(),
        userId: getCurrentUser().id,
        eventId: currentEvent.id,
        eventTitle: currentEvent.title,
        seats: [...selectedSeats],
        paymentMethod: paymentMethod,
        transactionId: generateTransactionId(),
        bookingDate: new Date().toISOString(),
        status: 'confirmed',
        totalAmount: selectedSeats.reduce((sum, seat) => sum + seat.price, 0) * 1.05
    };
    
    // Save booking
    const bookings = getAllBookings();
    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    // Update event seat availability
    updateEventSeats(currentEvent.id, selectedSeats);
    
    // Hide payment modal
    const paymentModal = bootstrap.Modal.getInstance(document.getElementById('paymentModal'));
    paymentModal.hide();
    
    // Show success message
    showAlert('Booking successful! Generating receipt...', 'success');
    
    // Show receipt after delay
    setTimeout(() => {
        showReceipt(booking);
    }, 1500);
}

// Update event seats after booking
function updateEventSeats(eventId, bookedSeats) {
    const events = getAllEvents();
    const eventIndex = events.findIndex(e => e.id === eventId);
    
    if (eventIndex === -1) return;
    
    // Mark seats as occupied in the event
    bookedSeats.forEach(bookedSeat => {
        for (let row of events[eventIndex].seatMap) {
            const seat = row.find(s => s.id === bookedSeat.id);
            if (seat) {
                seat.occupied = true;
            }
        }
    });
    
    // Update available seats count
    events[eventIndex].availableSeats -= bookedSeats.length;
    
    // Save updated events
    localStorage.setItem('events', JSON.stringify(events));
}

// Show receipt after booking
function showReceipt(booking) {
    const receiptModal = new bootstrap.Modal(document.getElementById('receiptModal'));
    
    // Populate receipt content
    document.getElementById('receiptContent').innerHTML = generateReceiptHTML(booking);
    
    // Set up download button
    document.getElementById('downloadReceiptBtn').onclick = () => downloadReceipt(booking);
    
    // Set up email button
    document.getElementById('emailReceiptBtn').onclick = () => emailReceipt(booking);
    
    // Show modal
    receiptModal.show();
    
    // Reset selections
    selectedSeats = [];
    renderSeatMap();
    updateBookingSummary();
}

// Initialize booking page
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('event-detail.html')) {
        loadEventDetails();
        
        // Initialize payment modal
        const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
        if (confirmPaymentBtn) {
            confirmPaymentBtn.addEventListener('click', handlePayment);
        }
    }
});