// ========================================
// RESIDENT STATE - Global variables & DOM references
// ========================================

// ========================================
// GLOBAL STATE
// ========================================
let currentPage = 'dashboard';

// ========================================
// DOM REFS - Sidebar & Layout
// ========================================
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const sidebarToggle = document.getElementById('sidebarToggle');
const navItems = document.querySelectorAll('.nav-item[data-page]');
const pageSections = document.querySelectorAll('.page-section');
const pageTitle = document.getElementById('pageTitle');
const userName = document.getElementById('userName');

// ========================================
// DOM REFS - Modals
// ========================================
const editProfileModal = document.getElementById('editProfileModal');
const cancelAppointmentModal = document.getElementById('cancelAppointmentModal');
const viewResidentModal = document.getElementById('viewResidentModal');

// ========================================
// DOM REFS - Quick Actions
// ========================================
const quickActions = document.querySelectorAll('.quick-action');
const viewAllLinks = document.querySelectorAll('.view-all');

// ========================================
// DOM REFS - Edit Profile
// ========================================
const editProfileBtn = document.getElementById('editProfileBtn');
const closeModalBtn = document.getElementById('closeModal');
const cancelEdit = document.getElementById('cancelEdit');
const editProfileForm = document.getElementById('editProfileForm');

// ========================================
// DOM REFS - Notifications
// ========================================
const markAllReadBtn = document.getElementById('markAllReadBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const notificationBadge = document.getElementById('notificationBadge');

// ========================================
// DOM REFS - Record Tabs
// ========================================
const recordTabs = document.querySelectorAll('.record-tab');
const recordContents = document.querySelectorAll('.record-content');

// ========================================
// DOM REFS - Appointment Filters
// ========================================
const appointmentStatusFilter = document.getElementById('appointmentStatusFilter');
const appointmentDateFilter = document.getElementById('appointmentDateFilter');
const clearAppointmentFilters = document.getElementById('clearAppointmentFilters');