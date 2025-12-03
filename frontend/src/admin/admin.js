// Admin page logic
const API_URL = import.meta.env.VITE_API_URL || '/api';
const API_KEY_STORAGE = 'baseball_admin_key';

// DOM elements
const loginView = document.getElementById('loginView');
const adminView = document.getElementById('adminView');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const submissionsContainer = document.getElementById('submissionsContainer');

// State
let apiKey = null;

// Initialize
function init() {
  // Check if already logged in
  const storedKey = sessionStorage.getItem(API_KEY_STORAGE);
  if (storedKey) {
    apiKey = storedKey;
    showAdminView();
  } else {
    showLoginView();
  }

  setupEventListeners();
}

// Show login view
function showLoginView() {
  loginView.classList.remove('hidden');
  adminView.classList.add('hidden');
}

// Show admin view
function showAdminView() {
  loginView.classList.add('hidden');
  adminView.classList.remove('hidden');
  loadSubmissions();
}

// Setup event listeners
function setupEventListeners() {
  loginForm.addEventListener('submit', handleLogin);
  logoutBtn.addEventListener('click', handleLogout);
}

// Handle login
async function handleLogin(e) {
  e.preventDefault();

  const formData = new FormData(loginForm);
  const key = formData.get('apiKey');

  try {
    // In development, accept any key
    if (import.meta.env.DEV) {
      apiKey = key;
      sessionStorage.setItem(API_KEY_STORAGE, key);
      showAdminView();
      return;
    }

    // In production, validate with backend
    const response = await fetch(`${API_URL}/admin/submissions`, {
      headers: {
        'X-API-Key': key
      }
    });

    if (response.ok) {
      apiKey = key;
      sessionStorage.setItem(API_KEY_STORAGE, key);
      showAdminView();
    } else {
      loginError.classList.remove('hidden');
    }
  } catch (error) {
    console.error('Login error:', error);
    loginError.classList.remove('hidden');
  }
}

// Handle logout
function handleLogout() {
  apiKey = null;
  sessionStorage.removeItem(API_KEY_STORAGE);
  showLoginView();
}

// Load submissions
async function loadSubmissions() {
  try {
    submissionsContainer.innerHTML = '<div class="loading">Loading submissions</div>';

    // Mock data for development
    if (import.meta.env.DEV) {
      const mockSubmissions = [
        {
          id: '1',
          term: 'Popup fly',
          analogy: 'A sudden urge that goes away just as quickly',
          category: 'Plays & Calls',
          submittedBy: 'User123',
          submittedDate: new Date().toISOString(),
          email: 'user@example.com'
        },
        {
          id: '2',
          term: 'Bases loaded',
          analogy: 'When everyone in the house needs to go at the same time',
          category: 'Game Day',
          submittedBy: 'Anonymous',
          submittedDate: new Date().toISOString()
        }
      ];

      await new Promise(resolve => setTimeout(resolve, 500));
      renderSubmissions(mockSubmissions);
      return;
    }

    // Fetch from backend
    const response = await fetch(`${API_URL}/admin/submissions`, {
      headers: {
        'X-API-Key': apiKey
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch submissions');
    }

    const submissions = await response.json();
    renderSubmissions(submissions);

  } catch (error) {
    console.error('Error loading submissions:', error);
    submissionsContainer.innerHTML = '<div class="no-results">Error loading submissions</div>';
  }
}

// Render submissions
function renderSubmissions(submissions) {
  if (submissions.length === 0) {
    submissionsContainer.innerHTML = '<div class="no-results">No pending submissions</div>';
    return;
  }

  submissionsContainer.innerHTML = `
    <div class="submissions-table">
      ${submissions.map(renderSubmission).join('')}
    </div>
  `;

  // Attach event listeners
  submissions.forEach(submission => {
    document.getElementById(`approve-${submission.id}`).addEventListener('click', () => approveSubmission(submission.id));
    document.getElementById(`reject-${submission.id}`).addEventListener('click', () => rejectSubmission(submission.id));
  });
}

// Render a single submission
function renderSubmission(submission) {
  const date = new Date(submission.submittedDate).toLocaleDateString();

  return `
    <div class="submission-row" data-id="${submission.id}">
      <div>
        <strong style="color: var(--primary-navy);">${escapeHtml(submission.term)}</strong>
        <div class="submission-meta">
          Category: ${escapeHtml(submission.category)}<br>
          By: ${escapeHtml(submission.submittedBy)}<br>
          Date: ${date}
          ${submission.email ? `<br>Email: ${escapeHtml(submission.email)}` : ''}
        </div>
      </div>
      <div>
        <em style="color: var(--gray-700);">"${escapeHtml(submission.analogy)}"</em>
      </div>
      <div></div>
      <div class="submission-actions">
        <button id="approve-${submission.id}" class="btn-approve">✓ Approve</button>
        <button id="reject-${submission.id}" class="btn-reject">✗ Reject</button>
      </div>
    </div>
  `;
}

// Approve submission
async function approveSubmission(id) {
  if (!confirm('Are you sure you want to approve this submission?')) {
    return;
  }

  try {
    // Mock approval in dev
    if (import.meta.env.DEV) {
      await new Promise(resolve => setTimeout(resolve, 300));
      console.log('Approved submission:', id);
      await loadSubmissions();
      return;
    }

    const response = await fetch(`${API_URL}/admin/approve/${id}`, {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey
      }
    });

    if (!response.ok) {
      throw new Error('Failed to approve submission');
    }

    // Reload submissions
    await loadSubmissions();
  } catch (error) {
    console.error('Error approving submission:', error);
    alert('Failed to approve submission. Please try again.');
  }
}

// Reject submission
async function rejectSubmission(id) {
  const reason = prompt('Enter rejection reason (optional):');
  if (reason === null) return; // User cancelled

  try {
    // Mock rejection in dev
    if (import.meta.env.DEV) {
      await new Promise(resolve => setTimeout(resolve, 300));
      console.log('Rejected submission:', id, 'Reason:', reason);
      await loadSubmissions();
      return;
    }

    const response = await fetch(`${API_URL}/admin/reject/${id}`, {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason })
    });

    if (!response.ok) {
      throw new Error('Failed to reject submission');
    }

    // Reload submissions
    await loadSubmissions();
  } catch (error) {
    console.error('Error rejecting submission:', error);
    alert('Failed to reject submission. Please try again.');
  }
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
