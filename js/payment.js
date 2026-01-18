// Payment functionality

// Initialize payment page
function initializePaymentPage() {
    // This function would be used if we had a separate payment page
    // For now, payment is handled in the booking.js file
    
    // Load booking summary from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('eventId');
    const seatIds = urlParams.get('seats') ? urlParams.get('seats').split(',') : [];
    
    if (!eventId || seatIds.length === 0) {
        showAlert('Invalid booking information', 'danger');
        setTimeout(() => {
            window.location.href = 'events.html';
        }, 2000);
        return;
    }
    
    // The rest of payment page initialization would go here
}

// Handle different payment methods
function processPayment(paymentMethod, paymentDetails) {
    // Simulate payment processing
    showAlert(`Processing ${paymentMethod} payment...`, 'info');
    
    // Simulate API call delay
    return new Promise((resolve) => {
        setTimeout(() => {
            // For demo purposes, always succeed
            resolve({
                success: true,
                transactionId: generateTransactionId(),
                message: 'Payment successful'
            });
        }, 2000);
    });
}

// Validate credit card details
function validateCreditCard(cardNumber, expiry, cvv) {
    // Simple validation for demo
    if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
        return { valid: false, message: 'Invalid card number' };
    }
    
    if (!expiry || !/^\d{2}\/\d{2}$/.test(expiry)) {
        return { valid: false, message: 'Invalid expiry date (MM/YY)' };
    }
    
    if (!cvv || cvv.length !== 3) {
        return { valid: false, message: 'Invalid CVV' };
    }
    
    return { valid: true };
}

// Validate GCash/PayMaya details
function validateMobilePayment(mobileNumber, amount) {
    if (!mobileNumber || mobileNumber.length !== 11) {
        return { valid: false, message: 'Invalid mobile number' };
    }
    
    if (!amount || amount <= 0) {
        return { valid: false, message: 'Invalid amount' };
    }
    
    return { valid: true };
}

// Show payment processing animation
function showPaymentProcessing() {
    const paymentBtn = document.getElementById('confirmPaymentBtn');
    if (paymentBtn) {
        const originalText = paymentBtn.innerHTML;
        paymentBtn.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Processing...
        `;
        paymentBtn.disabled = true;
        
        return () => {
            paymentBtn.innerHTML = originalText;
            paymentBtn.disabled = false;
        };
    }
    return () => {};
}

// Initialize payment page if needed
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('payment.html')) {
        initializePaymentPage();
    }
});