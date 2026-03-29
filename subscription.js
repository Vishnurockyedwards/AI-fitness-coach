// ── FitAI Subscription · Razorpay Integration ───────────────────────────
//
// SETUP INSTRUCTIONS
// ──────────────────
// 1. Create a free account at https://dashboard.razorpay.com
// 2. Go to Settings → API Keys → Generate Test Key
// 3. Replace YOUR_RAZORPAY_KEY_ID below with your actual key (starts with "rzp_test_")
// 4. For production: swap "rzp_test_..." with "rzp_live_..." and verify your business
//
// NOTE: In a real production app the order/subscription should be created
//       server-side. This file uses a client-only checkout (sufficient for
//       demos and prototypes). Wire up a Node/Python backend when going live.
// ─────────────────────────────────────────────────────────────────────────

const RAZORPAY_KEY_ID = 'rzp_live_SX5vH5QPQkUYWq'; // ← replace this

// Pricing
const PLANS = {
    monthly: { amount: 9900, label: '₹99 / month', period: 'monthly' },   // in paise
    yearly:  { amount: 95040, label: '₹950 / year', period: 'yearly' },   // 99*12 * 0.8 = 950.4
};

let currentPlan = 'monthly';

// ── Billing toggle ───────────────────────────────────────────────────────
document.querySelectorAll('.sub-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.sub-toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentPlan = btn.dataset.billing;
        updatePriceDisplay();
    });
});

function updatePriceDisplay() {
    const plan = PLANS[currentPlan];
    const display = document.getElementById('priceDisplay');
    const payBtnText = document.getElementById('payBtnText');
    const priceNum = plan.amount / 100;

    // Animate the price number
    display.style.transition = 'transform 0.2s, opacity 0.2s';
    display.style.transform  = 'translateY(8px)';
    display.style.opacity    = '0';

    setTimeout(() => {
        if (currentPlan === 'monthly') {
            display.textContent = '99';
            document.querySelector('.sub-period').textContent = '/ mo';
        } else {
            display.textContent = '950';
            document.querySelector('.sub-period').textContent = '/ yr';
        }
        payBtnText.textContent = `Subscribe for ${plan.label}`;
        display.style.transform = 'translateY(0)';
        display.style.opacity   = '1';
    }, 180);
}

// ── Razorpay checkout ────────────────────────────────────────────────────
document.getElementById('payBtn').addEventListener('click', initiatePayment);

function initiatePayment() {
    if (RAZORPAY_KEY_ID === 'YOUR_RAZORPAY_KEY_ID') {
        alert(
            '⚠️  Razorpay key not configured.\n\n' +
            'Please replace YOUR_RAZORPAY_KEY_ID in subscription.js with your actual Razorpay Test Key.\n\n' +
            'Get your key at: https://dashboard.razorpay.com → Settings → API Keys'
        );
        return;
    }

    const btn  = document.getElementById('payBtn');
    const plan = PLANS[currentPlan];

    // Show spinner
    btn.classList.add('sub-btn-loading');
    btn.innerHTML = `<div class="sub-spinner"></div><span>Opening payment…</span>`;

    const options = {
        key: RAZORPAY_KEY_ID,
        amount: plan.amount,                 // amount in paise
        currency: 'INR',
        name: 'FitAI',
        description: `FitAI Pro — ${plan.period} subscription`,
        image: 'https://i.imgur.com/placeholder-logo.png', // replace with your logo URL
        prefill: {
            name:  localStorage.getItem('fitai_username') || '',
            email: localStorage.getItem('fitai_email')    || '',
        },
        theme: {
            color: '#ff5722',
        },
        modal: {
            ondismiss: onPaymentDismissed,
        },
        handler: onPaymentSuccess,
        notes: {
            plan: currentPlan,
        },
    };

    try {
        const rzp = new Razorpay(options);
        rzp.on('payment.failed', onPaymentFailed);
        rzp.open();
    } catch (err) {
        console.error('Razorpay init error:', err);
        resetPayBtn();
        showToast('Could not open payment window. Check your key and try again.', 'error');
    }
}

function onPaymentSuccess(response) {
    // response.razorpay_payment_id  — save this server-side for verification
    // response.razorpay_order_id
    // response.razorpay_signature

    console.log('Payment successful:', response);

    // Persist Pro status locally (replace with real server verification in production)
    localStorage.setItem('fitai_pro', 'true');
    localStorage.setItem('fitai_pro_plan', currentPlan);
    localStorage.setItem('fitai_payment_id', response.razorpay_payment_id);

    resetPayBtn();
    showSuccessModal();
}

function onPaymentFailed(response) {
    console.error('Payment failed:', response.error);
    resetPayBtn();
    showToast(`Payment failed: ${response.error.description || 'Unknown error'}`, 'error');
}

function onPaymentDismissed() {
    resetPayBtn();
    showToast('Payment cancelled. You can try again anytime.', 'info');
}

function resetPayBtn() {
    const btn  = document.getElementById('payBtn');
    const plan = PLANS[currentPlan];
    btn.classList.remove('sub-btn-loading');
    btn.innerHTML = `
        <span id="payBtnText">Subscribe for ${plan.label}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
    `;
}

// ── Success modal ────────────────────────────────────────────────────────
function showSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.classList.remove('hidden');
    document.getElementById('goToAppBtn').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

// ── Toast notification ───────────────────────────────────────────────────
function showToast(message, type = 'info') {
    const existing = document.getElementById('subToast');
    if (existing) existing.remove();

    const colors = {
        info:  'rgba(44,62,80,0.9)',
        error: 'rgba(231,76,60,0.9)',
    };

    const toast = document.createElement('div');
    toast.id = 'subToast';
    toast.textContent = message;
    Object.assign(toast.style, {
        position:     'fixed',
        bottom:       '32px',
        left:         '50%',
        transform:    'translateX(-50%) translateY(80px)',
        background:   colors[type],
        color:        '#fff',
        padding:      '14px 24px',
        borderRadius: '10px',
        fontSize:     '0.88rem',
        fontWeight:   '500',
        boxShadow:    '0 8px 24px rgba(0,0,0,0.3)',
        zIndex:       '10000',
        maxWidth:     '90vw',
        textAlign:    'center',
        transition:   'transform 0.3s ease, opacity 0.3s ease',
        opacity:      '0',
    });

    document.body.appendChild(toast);
    requestAnimationFrame(() => {
        toast.style.transform = 'translateX(-50%) translateY(0)';
        toast.style.opacity   = '1';
    });

    setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(80px)';
        toast.style.opacity   = '0';
        setTimeout(() => toast.remove(), 350);
    }, 4000);
}

// ── On load: check if already Pro ────────────────────────────────────────
(function checkExistingSubscription() {
    if (localStorage.getItem('fitai_pro') === 'true') {
        const btn = document.getElementById('payBtn');
        btn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>
            <span>Already Subscribed</span>
        `;
        btn.disabled = true;
        btn.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
        btn.style.boxShadow  = '0 4px 18px rgba(46,204,113,0.4)';
    }
})();
