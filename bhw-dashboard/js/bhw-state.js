// ========================================
// BHW STATE - Global variables & DOM references
// ========================================

// ========================================
// GLOBAL STATE
// ========================================
let currentPage = 'dashboard';
let residents = [];
let bmiRecords = [];
let prenatalRecords = [];
let immunizationRecords = [];
let optRecords = [];
let appointments = [];
let smsHistory = [];
let currentId = 1;

// ========================================
// DOM REFERENCES - Sidebar & Layout
// ========================================
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navItems = document.querySelectorAll('.nav-item[data-page]');
const pageSections = document.querySelectorAll('.page-section');
const pageTitle = document.getElementById('pageTitle');

// ========================================
// DOM REFERENCES - Search & Filters
// ========================================
const globalSearch = document.getElementById('globalSearch');
const residentSearch = document.getElementById('residentSearch');
const residentTypeFilter = document.getElementById('residentTypeFilter');
const purokFilter = document.getElementById('purokFilter');
const ageFilter = document.getElementById('ageFilter');
const clearFilters = document.getElementById('clearFilters');

// ========================================
// DOM REFERENCES - Modals
// ========================================
const addAdultModal = document.getElementById('addAdultModal');
const addChildModal = document.getElementById('addChildModal');
const recordBmiModal = document.getElementById('recordBmiModal');
const recordImmunizationModal = document.getElementById('recordImmunizationModal');
const editImmunizationModal = document.getElementById('editImmunizationModal');
const addPrenatalModal = document.getElementById('addPrenatalModal');
const editPrenatalModal = document.getElementById('editPrenatalModal');
const addOptModal = document.getElementById('addOptModal');
const editOptModal = document.getElementById('editOptModal');
const addAppointmentModal = document.getElementById('addAppointmentModal');
const editAppointmentModal = document.getElementById('editAppointmentModal');
const viewResidentModal = document.getElementById('viewResidentModal');

// ========================================
// DOM REFERENCES - Forms
// ========================================
const addAdultForm = document.getElementById('addAdultForm');
const addChildForm = document.getElementById('addChildForm');
const recordBmiForm = document.getElementById('recordBmiForm');
const recordImmunizationForm = document.getElementById('recordImmunizationForm');
const editImmunizationForm = document.getElementById('editImmunizationForm');
const addPrenatalForm = document.getElementById('addPrenatalForm');
const addOptForm = document.getElementById('addOptForm');
const editOptForm = document.getElementById('editOptForm');
const addAppointmentForm = document.getElementById('addAppointmentForm');
const editAppointmentForm = document.getElementById('editAppointmentForm');

// ========================================
// DOM REFERENCES - Buttons
// ========================================
const addAdultBtn = document.getElementById('addAdultBtn');
const addChildBtn = document.getElementById('addChildBtn');
const addBmiBtn = document.getElementById('addBmiBtn');
const addPrenatalBtn = document.getElementById('addPrenatalBtn');
const addImmunizationBtn = document.getElementById('addImmunizationBtn');
const addOptBtn = document.getElementById('addOptBtn');
const addAppointmentBtn = document.getElementById('addAppointmentBtn');
const sendSmsBtn = document.getElementById('sendSmsBtn');
const closeModalBtns = document.querySelectorAll('.close-modal');

// ========================================
// DOM REFERENCES - Child/Parent Search
// ========================================
const childParentSearch = document.getElementById('childParentSearch');
const childSearchParentBtn = document.getElementById('childSearchParentBtn');
const childClearParentSearch = document.getElementById('childClearParentSearch');
const childParentSearchResults = document.getElementById('childParentSearchResults');
const childSelectedParentId = document.getElementById('childSelectedParentId');
const selectedParentDisplay = document.getElementById('selectedParentDisplay');
const selectedParentName = document.getElementById('selectedParentName');
const selectedParentDetails = document.getElementById('selectedParentDetails');
const changeParentBtn = document.getElementById('changeParentBtn');
const saveChildBtn = document.getElementById('saveChildBtn');
const relationshipGroup = document.getElementById('relationshipGroup');
const relationshipSelect = document.getElementById('childParentRelationship');

// ========================================
// DOM REFERENCES - SMS
// ========================================
const smsRecipient = document.getElementById('smsRecipient');
const smsSpecificResident = document.getElementById('smsSpecificResident');
const smsTemplate = document.getElementById('smsTemplate');
const smsMessage = document.getElementById('smsMessage');
const charCount = document.getElementById('charCount');

// ========================================
// DOM REFERENCES - OPT Fields
// ========================================
const optWeightInput = document.getElementById('optWeight');
const optHeightInput = document.getElementById('optHeight');
const optChildSelect = document.getElementById('optChild');
const optStatusSelect = document.getElementById('optNutritionalStatus');