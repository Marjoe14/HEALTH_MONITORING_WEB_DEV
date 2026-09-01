<?php
// ========================================
// REPORT GENERATION FUNCTIONS
// ========================================

/**
 * Main report generation function
 */
function generateReport($pdo, $reportType, $userId) {
    switch ($reportType) {
        case 'resident':
            return generateResidentDemographics($pdo);
        case 'prenatal':
            return generatePrenatalReport($pdo);
        case 'immunization':
            return generateImmunizationReport($pdo);
        case 'bmi':
            return generateBMIReport($pdo);
        case 'opt':
            return generateOPTReport($pdo);
        case 'monthly':
            return generateMonthlyReport($pdo);
        case 'bhw':
            return generateBHWReport($pdo);
        case 'appointments':
            return generateAppointmentsReport($pdo);
        case 'sms':
            return generateSMSReport($pdo);
        default:
            return ['success' => false, 'message' => 'Unknown report type.'];
    }
}

/**
 * Helper function to calculate age from date_of_birth
 */
function calculateAge($dateOfBirth) {
    if (empty($dateOfBirth)) {
        return null;
    }
    try {
        $dob = new DateTime($dateOfBirth);
        $now = new DateTime();
        $diff = $dob->diff($now);
        return $diff->y + ($diff->m / 12); // Returns age in years with decimal
    } catch (Exception $e) {
        return null;
    }
}

/**
 * Resident Demographics Report - FIXED AGE CALCULATION
 */
function generateResidentDemographics($pdo) {
    try {
        // Get all residents with their date_of_birth
        $stmt = $pdo->query("
            SELECT 
                id,
                first_name,
                last_name,
                purok,
                sex,
                date_of_birth,
                age
            FROM residents
        ");
        $residents = $stmt->fetchAll();
        
        // Calculate ages and build statistics
        $byPurok = [];
        $ageDistribution = [
            '0-1' => 0,
            '1-5' => 0,
            '6-12' => 0,
            '13-17' => 0,
            '18-30' => 0,
            '31-50' => 0,
            '51+' => 0,
            'Unknown' => 0
        ];
        
        $totals = [
            'total' => 0,
            'total_males' => 0,
            'total_females' => 0,
            'total_children' => 0,
            'total_adults' => 0
        ];
        
        $recent = [];
        
        foreach ($residents as $resident) {
            $totals['total']++;
            
            // Calculate age properly
            $age = null;
            $ageDisplay = '—';
            $isChild = false;
            $ageNumeric = null;
            
            if (!empty($resident['date_of_birth'])) {
                $age = calculateAge($resident['date_of_birth']);
                if ($age !== null) {
                    $ageNumeric = $age;
                    $ageDisplay = floor($age) . ' yr' . (floor($age) > 1 ? 's' : '');
                    $isChild = ($age < 18);
                }
            } elseif (!empty($resident['age'])) {
                $age = floatval($resident['age']);
                $ageNumeric = $age;
                $isChild = ($age < 18);
            }
            
            // Count by sex
            if ($resident['sex'] === 'Male') {
                $totals['total_males']++;
            } elseif ($resident['sex'] === 'Female') {
                $totals['total_females']++;
            }
            
            // Count children/adults
            if ($isChild) {
                $totals['total_children']++;
            } else {
                $totals['total_adults']++;
            }
            
            // Age distribution
            $purok = $resident['purok'] ?? 'Unknown';
            if (!isset($byPurok[$purok])) {
                $byPurok[$purok] = [
                    'total' => 0,
                    'males' => 0,
                    'females' => 0,
                    'children' => 0,
                    'adults' => 0
                ];
            }
            
            $byPurok[$purok]['total']++;
            if ($resident['sex'] === 'Male') {
                $byPurok[$purok]['males']++;
            } elseif ($resident['sex'] === 'Female') {
                $byPurok[$purok]['females']++;
            }
            if ($isChild) {
                $byPurok[$purok]['children']++;
            } else {
                $byPurok[$purok]['adults']++;
            }
            
            // Age group distribution
            if ($ageNumeric !== null) {
                if ($ageNumeric < 1) {
                    $ageDistribution['0-1']++;
                } elseif ($ageNumeric >= 1 && $ageNumeric < 5) {
                    $ageDistribution['1-5']++;
                } elseif ($ageNumeric >= 5 && $ageNumeric < 13) {
                    $ageDistribution['6-12']++;
                } elseif ($ageNumeric >= 13 && $ageNumeric < 18) {
                    $ageDistribution['13-17']++;
                } elseif ($ageNumeric >= 18 && $ageNumeric < 31) {
                    $ageDistribution['18-30']++;
                } elseif ($ageNumeric >= 31 && $ageNumeric < 51) {
                    $ageDistribution['31-50']++;
                } elseif ($ageNumeric >= 51) {
                    $ageDistribution['51+']++;
                }
            } else {
                $ageDistribution['Unknown']++;
            }
            
            // Recent additions (last 10)
            if (count($recent) < 10) {
                $recent[] = [
                    'first_name' => $resident['first_name'],
                    'last_name' => $resident['last_name'],
                    'purok' => $resident['purok'] ?? 'Unknown',
                    'age' => $ageDisplay
                ];
            }
        }
        
        // Sort purok alphabetically
        ksort($byPurok);
        
        // Build HTML report
        $html = '<div class="report-content">';
        
        // Header
        $html .= '<h2>Resident Demographics Report</h2>';
        $html .= '<p><strong>Generated:</strong> ' . date('F d, Y H:i A') . '</p>';
        $html .= '<hr>';

        // Summary stats
        $html .= '<div class="report-stats-grid">';
        $html .= '<div class="report-stat"><strong>Total Residents</strong><br><span class="stat-number">' . number_format($totals['total']) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Male</strong><br><span class="stat-number">' . number_format($totals['total_males']) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Female</strong><br><span class="stat-number">' . number_format($totals['total_females']) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Children (< 18)</strong><br><span class="stat-number">' . number_format($totals['total_children']) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Adults (18+)</strong><br><span class="stat-number">' . number_format($totals['total_adults']) . '</span></div>';
        $html .= '</div>';

        // By Purok table
        $html .= '<h3>Residents by Purok</h3>';
        $html .= '<table class="report-table">';
        $html .= '<thead><tr><th>Purok</th><th>Total</th><th>Male</th><th>Female</th><th>Children</th><th>Adults</th></tr></thead>';
        $html .= '<tbody>';
        foreach ($byPurok as $purokName => $data) {
            $html .= '<tr>';
            $html .= '<td>' . htmlspecialchars($purokName) . '</td>';
            $html .= '<td>' . $data['total'] . '</td>';
            $html .= '<td>' . $data['males'] . '</td>';
            $html .= '<td>' . $data['females'] . '</td>';
            $html .= '<td>' . $data['children'] . '</td>';
            $html .= '<td>' . $data['adults'] . '</td>';
            $html .= '</tr>';
        }
        $html .= '</tbody></table>';

        // Age distribution
        $html .= '<h3>Age Distribution</h3>';
        $html .= '<table class="report-table">';
        $html .= '<thead><tr><th>Age Group</th><th>Count</th><th>Percentage</th></tr></thead>';
        $html .= '<tbody>';
        $total = $totals['total'];
        foreach ($ageDistribution as $group => $count) {
            $pct = $total > 0 ? round(($count / $total) * 100, 1) : 0;
            $html .= '<tr>';
            $html .= '<td>' . htmlspecialchars($group) . '</td>';
            $html .= '<td>' . $count . '</td>';
            $html .= '<td>' . $pct . '%</td>';
            $html .= '</tr>';
        }
        $html .= '</tbody></table>';

        // Recent registrations with age
        if (count($recent) > 0) {
            $html .= '<h3>Recent Residents</h3>';
            $html .= '<table class="report-table">';
            $html .= '<thead><tr><th>Name</th><th>Purok</th><th>Age</th></tr></thead>';
            $html .= '<tbody>';
            foreach ($recent as $row) {
                $html .= '<tr>';
                $html .= '<td>' . htmlspecialchars($row['first_name'] . ' ' . $row['last_name']) . '</td>';
                $html .= '<td>' . htmlspecialchars($row['purok']) . '</td>';
                $html .= '<td>' . htmlspecialchars($row['age']) . '</td>';
                $html .= '</tr>';
            }
            $html .= '</tbody></table>';
        }

        $html .= '</div>';

        return [
            'success' => true,
            'html' => $html,
            'title' => 'Resident Demographics Report'
        ];

    } catch (PDOException $e) {
        return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
    }
}

/**
 * Prenatal Summary Report
 */
function generatePrenatalReport($pdo) {
    try {
        $stmt = $pdo->query("
            SELECT 
                p.*,
                r.first_name,
                r.last_name,
                r.purok,
                r.age,
                u.username as recorded_by_name
            FROM prenatal_records p
            JOIN residents r ON p.resident_id = r.id
            JOIN users u ON p.recorded_by = u.id
            WHERE p.status = 'Active'
            ORDER BY p.due_date ASC
        ");
        $records = $stmt->fetchAll();

        $counts = $pdo->query("
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END) as delivered,
                SUM(CASE WHEN status = 'Transferred' THEN 1 ELSE 0 END) as transferred
            FROM prenatal_records
        ")->fetch();

        $html = '<div class="report-content">';
        $html .= '<h2>Prenatal Summary Report</h2>';
        $html .= '<p><strong>Generated:</strong> ' . date('F d, Y H:i A') . '</p>';
        $html .= '<hr>';

        // Summary stats
        $html .= '<div class="report-stats-grid">';
        $html .= '<div class="report-stat"><strong>Active Pregnancies</strong><br><span class="stat-number">' . ($counts['active'] ?? 0) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Delivered</strong><br><span class="stat-number">' . ($counts['delivered'] ?? 0) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Transferred</strong><br><span class="stat-number">' . ($counts['transferred'] ?? 0) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Total Records</strong><br><span class="stat-number">' . ($counts['total'] ?? 0) . '</span></div>';
        $html .= '</div>';

        if (count($records) > 0) {
            $html .= '<h3>Active Prenatal Records</h3>';
            $html .= '<table class="report-table">';
            $html .= '<thead><tr><th>Mother</th><th>Purok</th><th>LMP</th><th>Due Date</th><th>Weeks</th><th>Next Checkup</th></tr></thead>';
            $html .= '<tbody>';
            foreach ($records as $row) {
                $html .= '<tr>';
                $html .= '<td>' . htmlspecialchars($row['first_name'] . ' ' . $row['last_name']) . '</td>';
                $html .= '<td>' . htmlspecialchars($row['purok'] ?? 'Unknown') . '</td>';
                $html .= '<td>' . date('M d, Y', strtotime($row['lmp'])) . '</td>';
                $html .= '<td><strong>' . date('M d, Y', strtotime($row['due_date'])) . '</strong></td>';
                $html .= '<td>' . $row['gestational_age'] . ' weeks</td>';
                $html .= '<td>' . ($row['next_checkup'] ? date('M d, Y', strtotime($row['next_checkup'])) : '—') . '</td>';
                $html .= '</tr>';
            }
            $html .= '</tbody></table>';
        } else {
            $html .= '<p>No active prenatal records found.</p>';
        }

        $html .= '</div>';

        return [
            'success' => true,
            'html' => $html,
            'title' => 'Prenatal Summary Report'
        ];

    } catch (PDOException $e) {
        return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
    }
}

/**
 * Immunization Coverage Report
 */
function generateImmunizationReport($pdo) {
    try {
        // Get all immunization records with resident info
        $stmt = $pdo->query("
            SELECT 
                i.*,
                r.first_name,
                r.last_name,
                r.purok,
                r.age,
                u.username as recorded_by_name,
                v.name as vaccine_name
            FROM immunization_records i
            JOIN residents r ON i.resident_id = r.id
            JOIN users u ON i.recorded_by = u.id
            LEFT JOIN vaccines v ON i.vaccine = v.name
            ORDER BY i.created_at DESC
        ");
        $records = $stmt->fetchAll();

        // Summary counts
        $summary = $pdo->query("
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'Upcoming' THEN 1 ELSE 0 END) as upcoming,
                SUM(CASE WHEN status = 'Overdue' THEN 1 ELSE 0 END) as overdue,
                COUNT(DISTINCT resident_id) as unique_residents
            FROM immunization_records
        ")->fetch();

        // Vaccines breakdown
        $vaccines = $pdo->query("
            SELECT 
                vaccine,
                COUNT(*) as count,
                SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'Upcoming' THEN 1 ELSE 0 END) as upcoming,
                SUM(CASE WHEN status = 'Overdue' THEN 1 ELSE 0 END) as overdue
            FROM immunization_records
            GROUP BY vaccine
            ORDER BY count DESC
        ")->fetchAll();

        $html = '<div class="report-content">';
        $html .= '<h2>Immunization Coverage Report</h2>';
        $html .= '<p><strong>Generated:</strong> ' . date('F d, Y H:i A') . '</p>';
        $html .= '<hr>';

        // Summary stats
        $html .= '<div class="report-stats-grid">';
        $html .= '<div class="report-stat"><strong>Total Records</strong><br><span class="stat-number">' . ($summary['total'] ?? 0) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Completed</strong><br><span class="stat-number" style="color:#2E7D32;">' . ($summary['completed'] ?? 0) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Upcoming</strong><br><span class="stat-number" style="color:#E65100;">' . ($summary['upcoming'] ?? 0) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Overdue</strong><br><span class="stat-number" style="color:#C62828;">' . ($summary['overdue'] ?? 0) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Unique Residents</strong><br><span class="stat-number">' . ($summary['unique_residents'] ?? 0) . '</span></div>';
        $html .= '</div>';

        // Vaccines breakdown
        if (count($vaccines) > 0) {
            $html .= '<h3>Vaccine Coverage Breakdown</h3>';
            $html .= '<table class="report-table">';
            $html .= '<thead><tr><th>Vaccine</th><th>Total</th><th>Completed</th><th>Upcoming</th><th>Overdue</th><th>Coverage Rate</th></tr></thead>';
            $html .= '<tbody>';
            foreach ($vaccines as $row) {
                $rate = $row['count'] > 0 ? round(($row['completed'] / $row['count']) * 100, 1) : 0;
                $html .= '<tr>';
                $html .= '<td><strong>' . htmlspecialchars($row['vaccine'] ?? 'Unknown') . '</strong></td>';
                $html .= '<td>' . $row['count'] . '</td>';
                $html .= '<td>' . $row['completed'] . '</td>';
                $html .= '<td>' . $row['upcoming'] . '</td>';
                $html .= '<td>' . $row['overdue'] . '</td>';
                $html .= '<td>' . $rate . '%</td>';
                $html .= '</tr>';
            }
            $html .= '</tbody></table>';
        }

        // Recent records
        if (count($records) > 0) {
            $html .= '<h3>Recent Immunization Records</h3>';
            $html .= '<table class="report-table">';
            $html .= '<thead><tr><th>Resident</th><th>Vaccine</th><th>Dose</th><th>Date</th><th>Status</th></tr></thead>';
            $html .= '<tbody>';
            $limit = min(10, count($records));
            for ($i = 0; $i < $limit; $i++) {
                $row = $records[$i];
                $statusClass = $row['status'] === 'Completed' ? 'status-completed' : ($row['status'] === 'Overdue' ? 'status-overdue' : 'status-upcoming');
                $html .= '<tr>';
                $html .= '<td>' . htmlspecialchars($row['first_name'] . ' ' . $row['last_name']) . '</td>';
                $html .= '<td>' . htmlspecialchars($row['vaccine'] ?? 'Unknown') . '</td>';
                $html .= '<td>' . htmlspecialchars($row['dose'] ?? $row['dose_number'] ?? '—') . '</td>';
                $html .= '<td>' . date('M d, Y', strtotime($row['date_administered'])) . '</td>';
                $html .= '<td><span class="status-badge ' . $statusClass . '">' . $row['status'] . '</span></td>';
                $html .= '</tr>';
            }
            $html .= '</tbody></table>';
        } else {
            $html .= '<p>No immunization records found.</p>';
        }

        $html .= '</div>';

        return [
            'success' => true,
            'html' => $html,
            'title' => 'Immunization Coverage Report'
        ];

    } catch (PDOException $e) {
        return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
    }
}

/**
 * BMI Status Report
 */
function generateBMIReport($pdo) {
    try {
        $stmt = $pdo->query("
            SELECT 
                b.*,
                r.first_name,
                r.last_name,
                r.purok,
                r.age,
                r.sex,
                u.username as recorded_by_name
            FROM bmi_records b
            JOIN residents r ON b.resident_id = r.id
            JOIN users u ON b.recorded_by = u.id
            ORDER BY b.recorded_at DESC
        ");
        $records = $stmt->fetchAll();

        $summary = $pdo->query("
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN category = 'Underweight' THEN 1 ELSE 0 END) as underweight,
                SUM(CASE WHEN category = 'Normal' THEN 1 ELSE 0 END) as normal,
                SUM(CASE WHEN category = 'Overweight' THEN 1 ELSE 0 END) as overweight,
                SUM(CASE WHEN category = 'Obese' THEN 1 ELSE 0 END) as obese
            FROM bmi_records
        ")->fetch();

        $html = '<div class="report-content">';
        $html .= '<h2>BMI Status Report</h2>';
        $html .= '<p><strong>Generated:</strong> ' . date('F d, Y H:i A') . '</p>';
        $html .= '<hr>';

        $html .= '<div class="report-stats-grid">';
        $html .= '<div class="report-stat"><strong>Total Records</strong><br><span class="stat-number">' . ($summary['total'] ?? 0) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Underweight</strong><br><span class="stat-number" style="color:#E65100;">' . ($summary['underweight'] ?? 0) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Normal</strong><br><span class="stat-number" style="color:#2E7D32;">' . ($summary['normal'] ?? 0) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Overweight</strong><br><span class="stat-number" style="color:#E65100;">' . ($summary['overweight'] ?? 0) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Obese</strong><br><span class="stat-number" style="color:#C62828;">' . ($summary['obese'] ?? 0) . '</span></div>';
        $html .= '</div>';

        if (count($records) > 0) {
            $html .= '<h3>BMI Records</h3>';
            $html .= '<table class="report-table">';
            $html .= '<thead><tr><th>Resident</th><th>Purok</th><th>Height</th><th>Weight</th><th>BMI</th><th>Category</th><th>Date</th></tr></thead>';
            $html .= '<tbody>';
            foreach ($records as $row) {
                $catClass = strtolower($row['category']);
                $html .= '<tr>';
                $html .= '<td>' . htmlspecialchars($row['first_name'] . ' ' . $row['last_name']) . '</td>';
                $html .= '<td>' . htmlspecialchars($row['purok'] ?? 'Unknown') . '</td>';
                $html .= '<td>' . $row['height'] . ' cm</td>';
                $html .= '<td>' . $row['weight'] . ' kg</td>';
                $html .= '<td><strong>' . $row['bmi'] . '</strong></td>';
                $html .= '<td><span class="status-badge status-' . $catClass . '">' . $row['category'] . '</span></td>';
                $html .= '<td>' . date('M d, Y', strtotime($row['recorded_at'])) . '</td>';
                $html .= '</tr>';
            }
            $html .= '</tbody></table>';
        } else {
            $html .= '<p>No BMI records found.</p>';
        }

        $html .= '</div>';

        return [
            'success' => true,
            'html' => $html,
            'title' => 'BMI Status Report'
        ];

    } catch (PDOException $e) {
        return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
    }
}

/**
 * OPT (Operation Timbang) Report
 */
function generateOPTReport($pdo) {
    try {
        $stmt = $pdo->query("
            SELECT 
                o.*,
                r.first_name,
                r.last_name,
                r.purok,
                r.age,
                r.sex,
                u.username as recorded_by_name
            FROM opt_records o
            JOIN residents r ON o.resident_id = r.id
            JOIN users u ON o.recorded_by = u.id
            ORDER BY o.recorded_date DESC
        ");
        $records = $stmt->fetchAll();

        $summary = $pdo->query("
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN nutritional_status = 'Normal' THEN 1 ELSE 0 END) as normal,
                SUM(CASE WHEN nutritional_status = 'Underweight' THEN 1 ELSE 0 END) as underweight,
                SUM(CASE WHEN nutritional_status = 'Overweight' THEN 1 ELSE 0 END) as overweight,
                SUM(CASE WHEN nutritional_status = 'Severely Underweight' THEN 1 ELSE 0 END) as severely_underweight
            FROM opt_records
        ")->fetch();

        $html = '<div class="report-content">';
        $html .= '<h2>OPT (Operation Timbang) Report</h2>';
        $html .= '<p><strong>Generated:</strong> ' . date('F d, Y H:i A') . '</p>';
        $html .= '<hr>';

        $html .= '<div class="report-stats-grid">';
        $html .= '<div class="report-stat"><strong>Total Records</strong><br><span class="stat-number">' . ($summary['total'] ?? 0) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Normal</strong><br><span class="stat-number" style="color:#2E7D32;">' . ($summary['normal'] ?? 0) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Underweight</strong><br><span class="stat-number" style="color:#E65100;">' . ($summary['underweight'] ?? 0) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Overweight</strong><br><span class="stat-number" style="color:#E65100;">' . ($summary['overweight'] ?? 0) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Severely Underweight</strong><br><span class="stat-number" style="color:#C62828;">' . ($summary['severely_underweight'] ?? 0) . '</span></div>';
        $html .= '</div>';

        if (count($records) > 0) {
            $html .= '<h3>OPT Records</h3>';
            $html .= '<table class="report-table">';
            $html .= '<thead><tr><th>Child</th><th>Purok</th><th>Age</th><th>Weight</th><th>Height</th><th>Status</th><th>Date</th></tr></thead>';
            $html .= '<tbody>';
            foreach ($records as $row) {
                $html .= '<tr>';
                $html .= '<td>' . htmlspecialchars($row['first_name'] . ' ' . $row['last_name']) . '</td>';
                $html .= '<td>' . htmlspecialchars($row['purok'] ?? 'Unknown') . '</td>';
                $html .= '<td>' . ($row['age'] ?? '—') . ' yrs</td>';
                $html .= '<td>' . $row['weight'] . ' kg</td>';
                $html .= '<td>' . ($row['height'] ? $row['height'] . ' cm' : '—') . '</td>';
                $html .= '<td><span class="status-badge status-' . strtolower(str_replace(' ', '-', $row['nutritional_status'])) . '">' . $row['nutritional_status'] . '</span></td>';
                $html .= '<td>' . date('M d, Y', strtotime($row['recorded_date'])) . '</td>';
                $html .= '</tr>';
            }
            $html .= '</tbody></table>';
        } else {
            $html .= '<p>No OPT records found.</p>';
        }

        $html .= '</div>';

        return [
            'success' => true,
            'html' => $html,
            'title' => 'OPT Report'
        ];

    } catch (PDOException $e) {
        return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
    }
}

/**
 * Monthly Health Summary Report
 */
function generateMonthlyReport($pdo) {
    try {
        $now = new DateTime();
        $startDate = (clone $now)->modify('-30 days')->format('Y-m-d 00:00:00');
        $endDate = $now->format('Y-m-d 23:59:59');

        // Get counts for the month
        $residents = $pdo->query("SELECT COUNT(*) FROM residents")->fetchColumn();
        $bhws = $pdo->query("SELECT COUNT(*) FROM bhw b JOIN users u ON b.user_id = u.id WHERE u.status = 'active'")->fetchColumn();
        $pregnant = $pdo->query("SELECT COUNT(*) FROM prenatal_records WHERE status = 'Active'")->fetchColumn();
        $appointments = $pdo->query("SELECT COUNT(*) FROM appointments WHERE appointment_date BETWEEN '" . $startDate . "' AND '" . $endDate . "'")->fetchColumn();
        $completedAppts = $pdo->query("SELECT COUNT(*) FROM appointments WHERE status = 'Completed' AND appointment_date BETWEEN '" . $startDate . "' AND '" . $endDate . "'")->fetchColumn();

        // Recent activities
        $activities = $pdo->query("
            (SELECT 'appointment' as type, id, 'Appointment' as title, status, created_at, NULL as bhw_id, NULL as resident_name
             FROM appointments 
             WHERE created_at BETWEEN '" . $startDate . "' AND '" . $endDate . "'
             ORDER BY created_at DESC LIMIT 5)
            UNION ALL
            (SELECT 'bmi' as type, id, 'BMI Record' as title, category as status, created_at, recorded_by as bhw_id, 
                    CONCAT(r.first_name, ' ', r.last_name) as resident_name
             FROM bmi_records b
             JOIN residents r ON b.resident_id = r.id
             WHERE b.created_at BETWEEN '" . $startDate . "' AND '" . $endDate . "'
             ORDER BY b.created_at DESC LIMIT 5)
            UNION ALL
            (SELECT 'immunization' as type, id, 'Immunization' as title, status, created_at, recorded_by as bhw_id,
                    CONCAT(r.first_name, ' ', r.last_name) as resident_name
             FROM immunization_records i
             JOIN residents r ON i.resident_id = r.id
             WHERE i.created_at BETWEEN '" . $startDate . "' AND '" . $endDate . "'
             ORDER BY i.created_at DESC LIMIT 5)
            ORDER BY created_at DESC LIMIT 10
        ")->fetchAll();

        $html = '<div class="report-content">';
        $html .= '<h2>Monthly Health Summary Report</h2>';
        $html .= '<p><strong>Period:</strong> ' . date('M d, Y', strtotime($startDate)) . ' - ' . date('M d, Y', strtotime($endDate)) . '</p>';
        $html .= '<p><strong>Generated:</strong> ' . date('F d, Y H:i A') . '</p>';
        $html .= '<hr>';

        // Key metrics
        $html .= '<div class="report-stats-grid">';
        $html .= '<div class="report-stat"><strong>Total Residents</strong><br><span class="stat-number">' . number_format($residents) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Active BHWs</strong><br><span class="stat-number">' . number_format($bhws) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Pregnant Women</strong><br><span class="stat-number">' . number_format($pregnant) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Appointments (30d)</strong><br><span class="stat-number">' . number_format($appointments) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Completed Appts</strong><br><span class="stat-number" style="color:#2E7D32;">' . number_format($completedAppts) . '</span></div>';
        $html .= '</div>';

        // Recent activities
        if (count($activities) > 0) {
            $html .= '<h3>Recent Activities (Last 30 Days)</h3>';
            $html .= '<table class="report-table">';
            $html .= '<thead><tr><th>Activity</th><th>Details</th><th>Date</th></tr></thead>';
            $html .= '<tbody>';
            foreach ($activities as $row) {
                $typeIcon = $row['type'] === 'appointment' ? '📋' : ($row['type'] === 'bmi' ? '⚖️' : '💉');
                $html .= '<tr>';
                $html .= '<td>' . $typeIcon . ' ' . htmlspecialchars($row['title']) . '</td>';
                $html .= '<td>' . htmlspecialchars($row['resident_name'] ?? $row['status'] ?? '—') . '</td>';
                $html .= '<td>' . date('M d, Y H:i', strtotime($row['created_at'])) . '</td>';
                $html .= '</tr>';
            }
            $html .= '</tbody></table>';
        } else {
            $html .= '<p>No recent activities found.</p>';
        }

        $html .= '</div>';

        return [
            'success' => true,
            'html' => $html,
            'title' => 'Monthly Health Summary Report'
        ];

    } catch (PDOException $e) {
        return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
    }
}

/**
 * BHW Performance Report
 */
function generateBHWReport($pdo) {
    try {
        $stmt = $pdo->query("
            SELECT 
                b.id,
                b.first_name,
                b.last_name,
                b.assigned_purok,
                u.username,
                u.status,
                (SELECT COUNT(*) FROM bmi_records WHERE recorded_by = u.id) as bmi_count,
                (SELECT COUNT(*) FROM immunization_records WHERE recorded_by = u.id) as immunization_count,
                (SELECT COUNT(*) FROM opt_records WHERE recorded_by = u.id) as opt_count,
                (SELECT COUNT(*) FROM prenatal_records WHERE recorded_by = u.id) as prenatal_count,
                (SELECT COUNT(*) FROM appointments WHERE scheduled_by = u.id) as appointments_scheduled,
                (SELECT COUNT(*) FROM appointments WHERE scheduled_by = u.id AND status = 'Completed') as appointments_completed
            FROM bhw b
            JOIN users u ON b.user_id = u.id
            ORDER BY b.first_name
        ");
        $bhws = $stmt->fetchAll();

        $html = '<div class="report-content">';
        $html .= '<h2>BHW Performance Report</h2>';
        $html .= '<p><strong>Generated:</strong> ' . date('F d, Y H:i A') . '</p>';
        $html .= '<hr>';

        if (count($bhws) > 0) {
            $html .= '<table class="report-table">';
            $html .= '<thead><tr>';
            $html .= '<th>BHW</th><th>Purok</th><th>Status</th>';
            $html .= '<th>BMI</th><th>Immun.</th><th>OPT</th><th>Prenatal</th>';
            $html .= '<th>Appts</th><th>Completed</th><th>Rate</th>';
            $html .= '</tr></thead>';
            $html .= '<tbody>';
            foreach ($bhws as $row) {
                $rate = $row['appointments_scheduled'] > 0 ? round(($row['appointments_completed'] / $row['appointments_scheduled']) * 100, 1) : 0;
                $statusClass = $row['status'] === 'active' ? 'active' : 'inactive';
                $html .= '<tr>';
                $html .= '<td><strong>' . htmlspecialchars($row['first_name'] . ' ' . $row['last_name']) . '</strong></td>';
                $html .= '<td>' . htmlspecialchars($row['assigned_purok'] ?? 'All') . '</td>';
                $html .= '<td><span class="status-badge ' . $statusClass . '">' . ucfirst($row['status']) . '</span></td>';
                $html .= '<td>' . $row['bmi_count'] . '</td>';
                $html .= '<td>' . $row['immunization_count'] . '</td>';
                $html .= '<td>' . $row['opt_count'] . '</td>';
                $html .= '<td>' . $row['prenatal_count'] . '</td>';
                $html .= '<td>' . $row['appointments_scheduled'] . '</td>';
                $html .= '<td>' . $row['appointments_completed'] . '</td>';
                $html .= '<td>' . $rate . '%</td>';
                $html .= '</tr>';
            }
            $html .= '</tbody></table>';
        } else {
            $html .= '<p>No BHWs found.</p>';
        }

        $html .= '</div>';

        return [
            'success' => true,
            'html' => $html,
            'title' => 'BHW Performance Report'
        ];

    } catch (PDOException $e) {
        return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
    }
}

/**
 * Appointments Summary Report
 */
function generateAppointmentsReport($pdo) {
    try {
        $stmt = $pdo->query("
            SELECT 
                a.*,
                r.first_name,
                r.last_name,
                r.purok,
                u.username as scheduled_by_name
            FROM appointments a
            JOIN residents r ON a.resident_id = r.id
            LEFT JOIN users u ON a.scheduled_by = u.id
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
        ");
        $records = $stmt->fetchAll();

        $summary = $pdo->query("
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Upcoming' THEN 1 ELSE 0 END) as upcoming,
                SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled
            FROM appointments
        ")->fetch();

        $html = '<div class="report-content">';
        $html .= '<h2>Appointments Summary Report</h2>';
        $html .= '<p><strong>Generated:</strong> ' . date('F d, Y H:i A') . '</p>';
        $html .= '<hr>';

        $html .= '<div class="report-stats-grid">';
        $html .= '<div class="report-stat"><strong>Total Appointments</strong><br><span class="stat-number">' . ($summary['total'] ?? 0) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Upcoming</strong><br><span class="stat-number" style="color:#E65100;">' . ($summary['upcoming'] ?? 0) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Completed</strong><br><span class="stat-number" style="color:#2E7D32;">' . ($summary['completed'] ?? 0) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Cancelled</strong><br><span class="stat-number" style="color:#C62828;">' . ($summary['cancelled'] ?? 0) . '</span></div>';
        $html .= '</div>';

        if (count($records) > 0) {
            $html .= '<h3>Appointments</h3>';
            $html .= '<table class="report-table">';
            $html .= '<thead><tr><th>Resident</th><th>Purok</th><th>Date</th><th>Time</th><th>Type</th><th>Status</th></tr></thead>';
            $html .= '<tbody>';
            foreach ($records as $row) {
                $statusClass = strtolower($row['status']);
                $html .= '<tr>';
                $html .= '<td>' . htmlspecialchars($row['first_name'] . ' ' . $row['last_name']) . '</td>';
                $html .= '<td>' . htmlspecialchars($row['purok'] ?? 'Unknown') . '</td>';
                $html .= '<td>' . date('M d, Y', strtotime($row['appointment_date'])) . '</td>';
                $html .= '<td>' . htmlspecialchars($row['appointment_time']) . '</td>';
                $html .= '<td>' . htmlspecialchars($row['type']) . '</td>';
                $html .= '<td><span class="status-badge status-' . $statusClass . '">' . $row['status'] . '</span></td>';
                $html .= '</tr>';
            }
            $html .= '</tbody></table>';
        } else {
            $html .= '<p>No appointments found.</p>';
        }

        $html .= '</div>';

        return [
            'success' => true,
            'html' => $html,
            'title' => 'Appointments Summary Report'
        ];

    } catch (PDOException $e) {
        return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
    }
}

/**
 * SMS Activity Report
 */
function generateSMSReport($pdo) {
    try {
        $stmt = $pdo->query("
            SELECT 
                s.*,
                r.first_name,
                r.last_name,
                r.purok,
                u.username as sent_by_name
            FROM sms_logs s
            JOIN residents r ON s.resident_id = r.id
            JOIN users u ON s.sent_by = u.id
            ORDER BY s.sent_at DESC
            LIMIT 50
        ");
        $records = $stmt->fetchAll();

        $summary = $pdo->query("
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Sent' THEN 1 ELSE 0 END) as sent,
                SUM(CASE WHEN status = 'Failed' THEN 1 ELSE 0 END) as failed,
                SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending
            FROM sms_logs
        ")->fetch();

        $html = '<div class="report-content">';
        $html .= '<h2>SMS Activity Report</h2>';
        $html .= '<p><strong>Generated:</strong> ' . date('F d, Y H:i A') . '</p>';
        $html .= '<hr>';

        $html .= '<div class="report-stats-grid">';
        $html .= '<div class="report-stat"><strong>Total SMS</strong><br><span class="stat-number">' . ($summary['total'] ?? 0) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Sent</strong><br><span class="stat-number" style="color:#2E7D32;">' . ($summary['sent'] ?? 0) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Failed</strong><br><span class="stat-number" style="color:#C62828;">' . ($summary['failed'] ?? 0) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Pending</strong><br><span class="stat-number" style="color:#E65100;">' . ($summary['pending'] ?? 0) . '</span></div>';
        $html .= '</div>';

        if (count($records) > 0) {
            $html .= '<h3>Recent SMS Logs</h3>';
            $html .= '<table class="report-table">';
            $html .= '<thead><tr><th>Resident</th><th>Purok</th><th>Message</th><th>Status</th><th>Sent At</th></tr></thead>';
            $html .= '<tbody>';
            foreach ($records as $row) {
                $statusClass = strtolower($row['status']);
                $msg = strlen($row['message']) > 50 ? substr($row['message'], 0, 50) . '...' : $row['message'];
                $html .= '<tr>';
                $html .= '<td>' . htmlspecialchars($row['first_name'] . ' ' . $row['last_name']) . '</td>';
                $html .= '<td>' . htmlspecialchars($row['purok'] ?? 'Unknown') . '</td>';
                $html .= '<td>' . htmlspecialchars($msg) . '</td>';
                $html .= '<td><span class="status-badge status-' . $statusClass . '">' . $row['status'] . '</span></td>';
                $html .= '<td>' . date('M d, Y H:i', strtotime($row['sent_at'])) . '</td>';
                $html .= '</tr>';
            }
            $html .= '</tbody></table>';
        } else {
            $html .= '<p>No SMS logs found.</p>';
        }

        $html .= '</div>';

        return [
            'success' => true,
            'html' => $html,
            'title' => 'SMS Activity Report'
        ];

    } catch (PDOException $e) {
        return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
    }
}
?>