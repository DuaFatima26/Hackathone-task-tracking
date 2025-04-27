// Initialize particles.js
document.addEventListener('DOMContentLoaded', function() {
    particlesJS('particles-js', {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: "#ffffff" },
            shape: { type: "circle" },
            opacity: { value: 0.5 },
            size: { value: 3, random: true },
            line_linked: { enable: true, distance: 150, color: "#ffffff", opacity: 0.4, width: 1 },
            move: { enable: true, speed: 2 }
        },
        interactivity: {
            events: {
                onhover: { enable: true, mode: "grab" },
                onclick: { enable: true, mode: "push" }
            }
        }
    });

    // Modal toggle functionality
    const signupBtn = document.getElementById('signup-btn');
    const loginBtn = document.getElementById('login-btn');
    const authModal = document.getElementById('authModal');
    const closeModal = document.getElementById('closeModal');

    if (signupBtn && loginBtn && authModal) {
        signupBtn.addEventListener('click', () => {
            authModal.classList.add('active');
            // Switch to signup tab
            document.querySelector('.tab[data-tab="signup"]').click();
        });

        loginBtn.addEventListener('click', () => {
            authModal.classList.add('active');
            // Switch to login tab
            document.querySelector('.tab[data-tab="login"]').click();
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            authModal.classList.remove('active');
            // Clear any messages
            document.getElementById('authMessage').className = "auth-message";
            document.getElementById('authMessage').textContent = "";
        });
    }

    // Close modal when clicking outside
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.classList.remove('active');
            // Clear any messages
            document.getElementById('authMessage').className = "auth-message";
            document.getElementById('authMessage').textContent = "";
        }
    });

    // Tab switching
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update active content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabId}Form`).classList.add('active');
            
            // Clear any messages
            document.getElementById('authMessage').className = "auth-message";
            document.getElementById('authMessage').textContent = "";
        });
    });

    // Show login from signup
    const showLogin = document.getElementById('showLogin');
    if (showLogin) {
        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('.tab[data-tab="login"]').click();
        });
    }
});