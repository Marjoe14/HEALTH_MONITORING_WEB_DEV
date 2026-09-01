<?php
// ========================================
// BHW REPORT GENERATION FUNCTIONS
// ========================================

/**
 * Main BHW report generation function
 */
function generateBhwReport($pdo, $reportType, $userId) {
    switch ($reportType) {
        case 'resident':
            return generateBhwResidentReport($pdo);
        case 'prenatal':
            return generateBhwPrenatalReport($pdo);
        case 'immunization':
            return generateBhwImmunizationReport($pdo);
        case 'bmi':
            return generateBhwBMIReport($pdo);
        case 'opt':
            return generateBhwOPTReport($pdo);
        case 'monthly':
            return generateBhwMonthlyReport($pdo);
        default:
            return ['success' => false, 'message' => 'Unknown report type.'];
    }
}

/**
 * Helper function to calculate age from date_of_birth
 */
function calculateBhwAge($dateOfBirth) {
    if (empty($dateOfBirth)) {
        return null;
    }
    try {
        $dob = new DateTime($dateOfBirth);
        $now = new DateTime();
        $diff = $dob->diff($now);
        return $diff->y + ($diff->m / 12);
    } catch (Exception $e) {
        return null;
    }
}

/**
 * Resident Demographics Report - BHW Version
 */
function generateBhwResidentReport($pdo) {
    try {
        // Get all residents with their date_of_birth
        $stmt = $pdo->query("
            SELECT 
                id,
                first_name,
                middle_name,
                last_name,
                purok,
                sex,
                date_of_birth,
                age
            FROM residents
        ");
        $residents = $stmt->fetchAll();
        
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
            'total_adults' => 0,
            'total_elderly' => 0
        ];
        
        $childCount = 0;
        $elderlyCount = 0;
        
        foreach ($residents as $resident) {
            $totals['total']++;
            
            $age = null;
            $isChild = false;
            $isElderly = false;
            $ageNumeric = null;
            
            if (!empty($resident['date_of_birth'])) {
                $age = calculateBhwAge($resident['date_of_birth']);
                if ($age !== null) {
                    $ageNumeric = $age;
                    $isChild = ($age < 18);
                    $isElderly = ($age >= 60);
                }
            } elseif (!empty($resident['age'])) {
                $age = floatval($resident['age']);
                $ageNumeric = $age;
                $isChild = ($age < 18);
                $isElderly = ($age >= 60);
            }
            
            // Count by sex
            if ($resident['sex'] === 'Male') {
                $totals['total_males']++;
            } elseif ($resident['sex'] === 'Female') {
                $totals['total_females']++;
            }
            
            // Count children/adults/elderly
            if ($isChild) {
                $totals['total_children']++;
                $childCount++;
            } elseif ($isElderly) {
                $totals['total_elderly']++;
                $elderlyCount++;
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
                    'adults' => 0,
                    'elderly' => 0
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
            } elseif ($isElderly) {
                $byPurok[$purok]['elderly']++;
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
        }
        
        ksort($byPurok);
        
        $html = '<div class="report-content">';
        $html .= '<h2>Resident Statistics Report</h2>';
        $html .= '<p><strong>Generated:</strong> ' . date('F d, Y H:i A') . '</p>';
        $html .= '<hr>';

        $html .= '<div class="report-stats-grid">';
        $html .= '<div class="report-stat"><strong>Total Residents</strong><br><span class="stat-number">' . number_format($totals['total']) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Male</strong><br><span class="stat-number">' . number_format($totals['total_males']) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Female</strong><br><span class="stat-number">' . number_format($totals['total_females']) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Children (< 18)</strong><br><span class="stat-number">' . number_format($totals['total_children']) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Adults (18-59)</strong><br><span class="stat-number">' . number_format($totals['total_adults']) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Elderly (60+)</strong><br><span class="stat-number">' . number_format($totals['total_elderly']) . '</span></div>';
        $html .= '</div>';

        $html .= '<h3>Residents by Purok</h3>';
        $html .= '<table class="report-table">';
        $html .= '<thead><tr><th>Purok</th><th>Total</th><th>Male</th><th>Female</th><th>Children</th><th>Adults</th><th>Elderly</th></tr></thead>';
        $html .= '<tbody>';
        foreach ($byPurok as $purokName => $data) {
            $html .= '<tr>';
            $html .= '<td>' . htmlspecialchars($purokName) . '</td>';
            $html .= '<td>' . $data['total'] . '</td>';
            $html .= '<td>' . $data['males'] . '</td>';
            $html .= '<td>' . $data['females'] . '</td>';
            $html .= '<td>' . $data['children'] . '</td>';
            $html .= '<td>' . $data['adults'] . '</td>';
            $html .= '<td>' . $data['elderly'] . '</td>';
            $html .= '</tr>';
        }
        $html .= '</tbody></table>';

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

        $html .= '</div>';

        return [
            'success' => true,
            'html' => $html,
            'title' => 'Resident Statistics Report'
        ];

    } catch (PDOException $e) {
        return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
    }
}

/**
 * Prenatal Report - BHW Version
 */
function generateBhwPrenatalReport($pdo) {
    try {
        $stmt = $pdo->query("
            SELECT 
                p.*,
                r.first_name,
                r.last_name,
                r.purok,
                u.username as recorded_by_name
            FROM prenatal_records p
            JOIN residents r ON p.resident_id = r.id
            JOIN users u ON p.recorded_by = u.id
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
        $html .= '<h2>Prenatal Care Report</h2>';
        $html .= '<p><strong>Generated:</strong> ' . date('F d, Y H:i A') . '</p>';
        $html .= '<hr>';

        $html .= '<div class="report-stats-grid">';
        $html .= '<div class="report-stat"><strong>Active Pregnancies</strong><br><span class="stat-number">' . ($counts['active'] ?? 0) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Delivered</strong><br><span class="stat-number">' . ($counts['delivered'] ?? 0) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Transferred</strong><br><span class="stat-number">' . ($counts['transferred'] ?? 0) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Total Records</strong><br><span class="stat-number">' . ($counts['total'] ?? 0) . '</span></div>';
        $html .= '</div>';

        if (count($records) > 0) {
            $html .= '<h3>Prenatal Records</h3>';
            $html .= '<table class="report-table">';
            $html .= '<thead><tr><th>Mother</th><th>Purok</th><th>LMP</th><th>Due Date</th><th>Weeks</th><th>Status</th><th>Next Checkup</th></tr></thead>';
            $html .= '<tbody>';
            foreach ($records as $row) {
                $statusClass = strtolower($row['status']);
                $html .= '<tr>';
                $html .= '<td>' . htmlspecialchars($row['first_name'] . ' ' . $row['last_name']) . '</td>';
                $html .= '<td>' . htmlspecialchars($row['purok'] ?? 'Unknown') . '</td>';
                $html .= '<td>' . date('M d, Y', strtotime($row['lmp'])) . '</td>';
                $html .= '<td><strong>' . date('M d, Y', strtotime($row['due_date'])) . '</strong></td>';
                $html .= '<td>' . $row['gestational_age'] . ' weeks</td>';
                $html .= '<td><span class="status-badge ' . $statusClass . '">' . $row['status'] . '</span></td>';
                $html .= '<td>' . ($row['next_checkup'] ? date('M d, Y', strtotime($row['next_checkup'])) : '—') . '</td>';
                $html .= '</tr>';
            }
            $html .= '</tbody></table>';
        } else {
            $html .= '<p>No prenatal records found.</p>';
        }

        $html .= '</div>';

        return [
            'success' => true,
            'html' => $html,
            'title' => 'Prenatal Care Report'
        ];

    } catch (PDOException $e) {
        return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
    }
}

/**
 * Immunization Report - BHW Version
 */
function generateBhwImmunizationReport($pdo) {
    try {
        $stmt = $pdo->query("
            SELECT 
                i.*,
                r.first_name,
                r.last_name,
                r.purok,
                u.username as recorded_by_name
            FROM immunization_records i
            JOIN residents r ON i.resident_id = r.id
            JOIN users u ON i.recorded_by = u.id
            ORDER BY i.created_at DESC
        ");
        $records = $stmt->fetchAll();

        $summary = $pdo->query("
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'Upcoming' THEN 1 ELSE 0 END) as upcoming,
                SUM(CASE WHEN status = 'Overdue' THEN 1 ELSE 0 END) as overdue,
                COUNT(DISTINCT resident_id) as unique_residents
            FROM immunization_records
        ")->fetch();

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
        $html .= '<h2>Immunization Report</h2>';
        $html .= '<p><strong>Generated:</strong> ' . date('F d, Y H:i A') . '</p>';
        $html .= '<hr>';

        $html .= '<div class="report-stats-grid">';
        $html .= '<div class="report-stat"><strong>Total Records</strong><br><span class="stat-number">' . ($summary['total'] ?? 0) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Completed</strong><br><span class="stat-number" style="color:#2E7D32;">' . ($summary['completed'] ?? 0) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Upcoming</strong><br><span class="stat-number" style="color:#E65100;">' . ($summary['upcoming'] ?? 0) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Overdue</strong><br><span class="stat-number" style="color:#C62828;">' . ($summary['overdue'] ?? 0) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Unique Children</strong><br><span class="stat-number">' . ($summary['unique_residents'] ?? 0) . '</span></div>';
        $html .= '</div>';

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

        if (count($records) > 0) {
            $html .= '<h3>Recent Immunization Records</h3>';
            $html .= '<table class="report-table">';
            $html .= '<thead><tr><th>Child</th><th>Purok</th><th>Vaccine</th><th>Dose</th><th>Date</th><th>Status</th></tr></thead>';
            $html .= '<tbody>';
            $limit = min(10, count($records));
            for ($i = 0; $i < $limit; $i++) {
                $row = $records[$i];
                $statusClass = strtolower($row['status']);
                $html .= '<tr>';
                $html .= '<td>' . htmlspecialchars($row['first_name'] . ' ' . $row['last_name']) . '</td>';
                $html .= '<td>' . htmlspecialchars($row['purok'] ?? 'Unknown') . '</td>';
                $html .= '<td>' . htmlspecialchars($row['vaccine'] ?? 'Unknown') . '</td>';
                $html .= '<td>' . htmlspecialchars($row['dose'] ?? '—') . '</td>';
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
            'title' => 'Immunization Report'
        ];

    } catch (PDOException $e) {
        return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
    }
}

/**
 * BMI Report - BHW Version
 */
function generateBhwBMIReport($pdo) {
    try {
        $stmt = $pdo->query("
            SELECT 
                b.*,
                r.first_name,
                r.last_name,
                r.purok,
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
        $html .= '<h2>BMI Assessment Report</h2>';
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
                $html .= '<td><span class="status-badge ' . $catClass . '">' . $row['category'] . '</span></td>';
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
            'title' => 'BMI Assessment Report'
        ];

    } catch (PDOException $e) {
        return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
    }
}

/**
 * OPT Report - BHW Version
 */
function generateBhwOPTReport($pdo) {
    try {
        $stmt = $pdo->query("
            SELECT 
                o.*,
                r.first_name,
                r.last_name,
                r.purok,
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
        $html .= '<h2>Operation Timbang (OPT) Report</h2>';
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
            $html .= '<thead><tr><th>Child</th><th>Purok</th><th>Weight</th><th>Height</th><th>Status</th><th>Date</th></tr></thead>';
            $html .= '<tbody>';
            foreach ($records as $row) {
                $statusClass = strtolower(str_replace(' ', '-', $row['nutritional_status']));
                $html .= '<tr>';
                $html .= '<td>' . htmlspecialchars($row['first_name'] . ' ' . $row['last_name']) . '</td>';
                $html .= '<td>' . htmlspecialchars($row['purok'] ?? 'Unknown') . '</td>';
                $html .= '<td>' . $row['weight'] . ' kg</td>';
                $html .= '<td>' . ($row['height'] ? $row['height'] . ' cm' : '—') . '</td>';
                $html .= '<td><span class="status-badge ' . $statusClass . '">' . $row['nutritional_status'] . '</span></td>';
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
            'title' => 'Operation Timbang (OPT) Report'
        ];

    } catch (PDOException $e) {
        return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
    }
}

/**
 * Monthly Health Report - BHW Version
 */
function generateBhwMonthlyReport($pdo) {
    try {
        $now = new DateTime();
        $startDate = (clone $now)->modify('-30 days')->format('Y-m-d 00:00:00');
        $endDate = $now->format('Y-m-d 23:59:59');

        $residents = $pdo->query("SELECT COUNT(*) FROM residents")->fetchColumn();
        $pregnant = $pdo->query("SELECT COUNT(*) FROM prenatal_records WHERE status = 'Active'")->fetchColumn();
        $immunizations = $pdo->query("SELECT COUNT(*) FROM immunization_records WHERE status IN ('Upcoming', 'Overdue')")->fetchColumn();
        $appointments = $pdo->query("SELECT COUNT(*) FROM appointments WHERE appointment_date BETWEEN '" . $startDate . "' AND '" . $endDate . "'")->fetchColumn();
        $completedAppts = $pdo->query("SELECT COUNT(*) FROM appointments WHERE status = 'Completed' AND appointment_date BETWEEN '" . $startDate . "' AND '" . $endDate . "'")->fetchColumn();
        $bmiRecords = $pdo->query("SELECT COUNT(*) FROM bmi_records WHERE created_at BETWEEN '" . $startDate . "' AND '" . $endDate . "'")->fetchColumn();
        $optRecords = $pdo->query("SELECT COUNT(*) FROM opt_records WHERE created_at BETWEEN '" . $startDate . "' AND '" . $endDate . "'")->fetchColumn();

        // Recent activities
        $activities = $pdo->query("
            (SELECT 'appointment' as type, 'Appointment' as title, status, created_at, 
                    CONCAT(r.first_name, ' ', r.last_name) as resident_name
             FROM appointments a
             JOIN residents r ON a.resident_id = r.id
             WHERE a.created_at BETWEEN '" . $startDate . "' AND '" . $endDate . "'
             ORDER BY a.created_at DESC LIMIT 3)
            UNION ALL
            (SELECT 'bmi' as type, 'BMI Record' as title, category as status, created_at,
                    CONCAT(r.first_name, ' ', r.last_name) as resident_name
             FROM bmi_records b
             JOIN residents r ON b.resident_id = r.id
             WHERE b.created_at BETWEEN '" . $startDate . "' AND '" . $endDate . "'
             ORDER BY b.created_at DESC LIMIT 3)
            UNION ALL
            (SELECT 'immunization' as type, 'Immunization' as title, status, created_at,
                    CONCAT(r.first_name, ' ', r.last_name) as resident_name
             FROM immunization_records i
             JOIN residents r ON i.resident_id = r.id
             WHERE i.created_at BETWEEN '" . $startDate . "' AND '" . $endDate . "'
             ORDER BY i.created_at DESC LIMIT 3)
            UNION ALL
            (SELECT 'prenatal' as type, 'Prenatal' as title, status, created_at,
                    CONCAT(r.first_name, ' ', r.last_name) as resident_name
             FROM prenatal_records p
             JOIN residents r ON p.resident_id = r.id
             WHERE p.created_at BETWEEN '" . $startDate . "' AND '" . $endDate . "'
             ORDER BY p.created_at DESC LIMIT 3)
            ORDER BY created_at DESC LIMIT 10
        ")->fetchAll();

        $html = '<div class="report-content">';
        $html .= '<h2>Monthly Health Report</h2>';
        $html .= '<p><strong>Period:</strong> ' . date('M d, Y', strtotime($startDate)) . ' - ' . date('M d, Y', strtotime($endDate)) . '</p>';
        $html .= '<p><strong>Generated:</strong> ' . date('F d, Y H:i A') . '</p>';
        $html .= '<hr>';

        $html .= '<div class="report-stats-grid">';
        $html .= '<div class="report-stat"><strong>Total Residents</strong><br><span class="stat-number">' . number_format($residents) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Pregnant Women</strong><br><span class="stat-number">' . number_format($pregnant) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Immunizations Due</strong><br><span class="stat-number" style="color:#E65100;">' . number_format($immunizations) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Appointments</strong><br><span class="stat-number">' . number_format($appointments) . '</span></div>';
        $html .= '<div class="report-stat"><strong>Completed Appts</strong><br><span class="stat-number" style="color:#2E7D32;">' . number_format($completedAppts) . '</span></div>';
        $html .= '<div class="report-stat"><strong>BMI Records</strong><br><span class="stat-number">' . number_format($bmiRecords) . '</span></div>';
        $html .= '<div class="report-stat"><strong>OPT Records</strong><br><span class="stat-number">' . number_format($optRecords) . '</span></div>';
        $html .= '</div>';

        if (count($activities) > 0) {
            $html .= '<h3>Recent Activities (Last 30 Days)</h3>';
            $html .= '<table class="report-table">';
            $html .= '<thead><tr><th>Activity</th><th>Details</th><th>Date</th></tr></thead>';
            $html .= '<tbody>';
            foreach ($activities as $row) {
                $typeIcon = $row['type'] === 'appointment' ? '📋' : ($row['type'] === 'bmi' ? '⚖️' : ($row['type'] === 'immunization' ? '💉' : '👶'));
                $html .= '<tr>';
                $html .= '<td>' . $typeIcon . ' ' . htmlspecialchars($row['title']) . '</td>';
                $html .= '<td>' . htmlspecialchars($row['resident_name'] ?? $row['status'] ?? '—') . '</td>';
                $html .= '<td>' . date('M d, Y', strtotime($row['created_at'])) . '</td>';
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
            'title' => 'Monthly Health Report'
        ];

    } catch (PDOException $e) {
        return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
    }
}
?>