import { api } from './api.js';

// State
let allTerms = [];
let currentCategory = 'all';
let searchQuery = '';

// DOM Elements
const termsContainer = document.getElementById('termsContainer');
const searchInput = document.getElementById('searchInput');
const categoryButtons = document.querySelectorAll('.category-btn');
const submitBtn = document.getElementById('submitBtn');
const submissionModal = document.getElementById('submissionModal');
const closeModalBtn = document.querySelector('.close-modal');
const cancelBtn = document.getElementById('cancelBtn');
const submissionForm = document.getElementById('submissionForm');
const formSuccess = document.getElementById('formSuccess');
const formError = document.getElementById('formError');

// Initialize app
async function init() {
  try {
    showLoading();
    allTerms = await api.getTerms();
    renderTerms();
    setupEventListeners();
  } catch (error) {
    showError('Failed to load terms. Please refresh the page.');
    console.error('Initialization error:', error);
  }
}

// Show loading state
function showLoading() {
  termsContainer.innerHTML = '<div class="loading">Loading terms</div>';
}

// Show error message
function showError(message) {
  termsContainer.innerHTML = `<div class="no-results">${message}</div>`;
}

// Render terms
function renderTerms() {
  const filteredTerms = getFilteredTerms();

  if (filteredTerms.length === 0) {
    termsContainer.innerHTML = '<div class="no-results">No terms found. Try adjusting your search or category filter.</div>';
    return;
  }

  if (currentCategory === 'all') {
    // Group by category when showing all
    const groupedTerms = groupByCategory(filteredTerms);
    termsContainer.innerHTML = Object.entries(groupedTerms)
      .map(([category, terms]) => renderCategory(category, terms))
      .join('');
  } else {
    // Show single category
    termsContainer.innerHTML = renderCategory(currentCategory, filteredTerms);
  }
}

// Group terms by category
function groupByCategory(terms) {
  const categories = [
    'Scoring Plays',
    'Base Running',
    'On the Mound',
    'Positions & Equipment',
    'Game Day',
    'Plays & Calls',
    'The Stat Sheet'
  ];

  const grouped = {};
  categories.forEach(category => {
    const categoryTerms = terms.filter(term => term.category === category);
    if (categoryTerms.length > 0) {
      grouped[category] = categoryTerms;
    }
  });

  return grouped;
}

// Render a category section
function renderCategory(category, terms) {
  return `
    <div class="category-section">
      <h2 class="category-title">${category}</h2>
      <div class="terms-list">
        ${terms.map(renderTerm).join('')}
      </div>
    </div>
  `;
}

// Render a single term card
function renderTerm(term) {
  return `
    <div class="term-card">
      <div class="term-name">${escapeHtml(term.term)}</div>
      <div class="term-analogy">${escapeHtml(term.analogy)}</div>
    </div>
  `;
}

// Get filtered terms based on search and category
function getFilteredTerms() {
  let filtered = allTerms;

  // Filter by category
  if (currentCategory !== 'all') {
    filtered = filtered.filter(term => term.category === currentCategory);
  }

  // Filter by search query
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(term =>
      term.term.toLowerCase().includes(query) ||
      term.analogy.toLowerCase().includes(query)
    );
  }

  return filtered;
}

// Setup event listeners
function setupEventListeners() {
  // Search input with debouncing
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchQuery = e.target.value.trim();
      renderTerms();
    }, 300);
  });

  // Category buttons
  categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Update active state
      categoryButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Update category and render
      currentCategory = button.dataset.category;
      renderTerms();
    });
  });

  // Modal controls
  submitBtn.addEventListener('click', openModal);
  closeModalBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  // Close modal when clicking outside
  submissionModal.addEventListener('click', (e) => {
    if (e.target === submissionModal) {
      closeModal();
    }
  });

  // Form submission
  submissionForm.addEventListener('submit', handleSubmit);

  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !submissionModal.classList.contains('hidden')) {
      closeModal();
    }
  });
}

// Open submission modal
function openModal() {
  submissionModal.classList.remove('hidden');
  formSuccess.classList.add('hidden');
  formError.classList.add('hidden');
  submissionForm.reset();
}

// Close submission modal
function closeModal() {
  submissionModal.classList.add('hidden');
}

// Handle form submission
async function handleSubmit(e) {
  e.preventDefault();

  const formData = new FormData(submissionForm);
  const termData = {
    term: formData.get('term'),
    analogy: formData.get('analogy'),
    category: formData.get('category'),
    submittedBy: formData.get('submittedBy') || 'Anonymous',
    email: formData.get('email') || null
  };

  try {
    // Hide previous messages
    formSuccess.classList.add('hidden');
    formError.classList.add('hidden');

    // Disable submit button
    const submitButton = submissionForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    await api.submitTerm(termData);

    // Show success message
    formSuccess.classList.remove('hidden');
    submissionForm.reset();

    // Close modal after 2 seconds
    setTimeout(() => {
      closeModal();
    }, 2000);

  } catch (error) {
    console.error('Submission error:', error);
    formError.classList.remove('hidden');
  } finally {
    // Re-enable submit button
    const submitButton = submissionForm.querySelector('button[type="submit"]');
    submitButton.disabled = false;
    submitButton.textContent = 'Submit Term';
  }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
