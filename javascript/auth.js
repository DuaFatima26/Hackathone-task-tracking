
// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCAnHygODaxm6JrFlyNhimgXaUtEt1Jvv8",
    authDomain: "task-tracking-app-56fe8.firebaseapp.com",
    projectId: "task-tracking-app-56fe8",
    storageBucket: "task-tracking-app-56fe8.appspot.com",
    messagingSenderId: "698725088954",
    appId: "1:698725088954:web:d7f10d2843d4676ef0cc83",
    measurementId: "G-SEBLZBDCWJ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Add Google scopes
googleProvider.addScope('email');
googleProvider.addScope('profile');

// DOM Elements
const authModal = document.getElementById('authModal');
const authMessage = document.getElementById('authMessage');

// Helper Functions
function showMessage(message, type) {
    if (authMessage) {
        authMessage.textContent = message;
        authMessage.className = "auth-message " + type;
        
        // Auto-hide message after 5 seconds
        setTimeout(() => {
            if (authMessage.textContent === message) {
                clearMessage();
            }
        }, 5000);
    }
}

function clearMessage() {
    if (authMessage) {
        authMessage.textContent = "";
        authMessage.className = "auth-message";
    }
}

// Improved error handler
function getFriendlyErrorMessage(error) {
    if (!error.code) return "An unknown error occurred";
    
    switch(error.code) {
        case 'auth/invalid-email':
            return "Please enter a valid email address";
        case 'auth/user-disabled':
            return "This account has been disabled";
        case 'auth/user-not-found':
            return "No account found with this email";
        case 'auth/wrong-password':
            return "Incorrect password. Try again or click 'Forgot Password'";
        case 'auth/email-already-in-use':
            return "This email is already registered";
        case 'auth/weak-password':
            return "Password should be at least 6 characters";
        case 'auth/operation-not-allowed':
            return "This operation is not allowed in this environment";
        case 'auth/too-many-requests':
            return "Too many attempts. Please try again later";
        case 'auth/account-exists-with-different-credential':
            return "An account already exists with this email";
        case 'auth/popup-closed-by-user':
            return "Sign in process was cancelled";
        case 'auth/operation-not-supported':
            return "Please use http:// or https:// protocol (use Live Server)";
        case 'auth/invalid-login-credentials':
            return "Invalid login credentials. Check your email and password";
        default:
            return error.message.replace("Firebase: ", "");
    }
}

// Login Handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                // Redirect to dashboard on successful login
                window.location.href = "dashboard.html"; // Replace with your dashboard page path
                clearMessage();
            })
            .catch(error => {
                showMessage(getFriendlyErrorMessage(error), "error");
            });
    });
}

// Signup Handler
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;

        if (password.length < 6) {
            showMessage("Password must be at least 6 characters", "error");
            return;
        }

        auth.createUserWithEmailAndPassword(email, password)
            .then(() => {
                authModal.classList.remove("active");
                alert("🎉 Account Created Successfully! Welcome to TaskMaster!");
                clearMessage();
            })
            .catch(error => {
                showMessage(getFriendlyErrorMessage(error), "error");
            });
    });
}

// Forgot Password
const forgotPassword = document.getElementById('forgotPassword');
if (forgotPassword) {
    forgotPassword.addEventListener('click', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value || prompt("Please enter your email address:");

        if (email) {
            auth.sendPasswordResetEmail(email)
                .then(() => {
                    showMessage("Password reset link sent to your email. Check your inbox!", "success");
                })
                .catch(error => {
                    showMessage(getFriendlyErrorMessage(error), "error");
                });
        }
    });
}

// Google Sign-In Handler
const googleSignIn = document.getElementById('googleSignIn');
if (googleSignIn) {
    googleSignIn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        try {
            const result = await auth.signInWithPopup(googleProvider);
            authModal.classList.remove("active");
            alert(`👋 Welcome ${result.user.displayName || 'User'}! Google login successful!`);
            // Redirect to dashboard
            window.location.href = "dashboard.html"; // Replace with your dashboard page path
            clearMessage();
        } catch (error) {
            showMessage(getFriendlyErrorMessage(error), "error");
        }
    });
}

// Check auth state
auth.onAuthStateChanged(user => {
    if (user) {
        console.log("User logged in:", user.email);
    } else {
        console.log("User logged out");
    }
});
