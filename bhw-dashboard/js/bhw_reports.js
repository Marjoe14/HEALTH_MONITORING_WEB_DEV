// ========================================
// BHW REPORT GENERATION - Separate Module
// ========================================

(function() {
    'use strict';

    // ========================================
    // BHW REPORT GENERATION
    // ========================================

    // Override the generate-report click handlers
    document.querySelectorAll('.generate-report').forEach(function(btn) {
        btn.removeEventListener('click', handleBhwReportGeneration);
        btn.addEventListener('click', handleBhwReportGeneration);
    });

    function handleBhwReportGeneration(e) {
        e.preventDefault();
        const reportType = this.dataset.report;
        const reportNames = {
            'resident': 'Resident Statistics Report',
            'prenatal': 'Prenatal Care Report',
            'immunization': 'Immunization Report',
            'bmi': 'BMI Assessment Report',
            'opt': 'Operation Timbang (OPT) Report',
            'monthly': 'Monthly Health Report'
        };
        
        const title = reportNames[reportType] || 'Report';
        
        // Show loading
        const preview = document.getElementById('reportPreview');
        const previewTitle = document.getElementById('reportPreviewTitle');
        const previewContent = document.querySelector('.report-preview-content');
        
        if (preview) {
            preview.style.display = 'block';
            preview.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        if (previewTitle) {
            previewTitle.textContent = 'Generating ' + title + '...';
        }
        
        if (previewContent) {
            previewContent.innerHTML = `
                <div class="report-placeholder">
                    <i class="fas fa-spinner fa-spin" style="font-size: 2.5rem; color: var(--primary);"></i>
                    <p>Generating report...</p>
                    <span class="empty-sub">Please wait while we compile the data.</span>
                </div>
            `;
        }
        
        // Make AJAX request
        const formData = new FormData();
        formData.append('action', 'generate_report');
        formData.append('report_type', reportType);
        
        fetch('ajax/bhw_report_handler.php', {
            method: 'POST',
            body: formData
        })
        .then(function(response) { return response.json(); })
        .then(function(data) {
            if (data.success) {
                if (previewTitle) {
                    previewTitle.textContent = data.title || title;
                }
                if (previewContent) {
                    previewContent.innerHTML = data.html;
                    
                    // Store current report for export
                    window.currentReportHTML = data.html;
                    window.currentReportTitle = data.title || title;
                    
                    // Update Print button - First button
                    const printBtn = document.querySelector('.report-preview-actions .btn-outline:first-child');
                    if (printBtn) {
                        printBtn.onclick = function(e) {
                            e.preventDefault();
                            printReport();
                        };
                    }
                    
                    // Update PDF button - Second button (auto-download)
                    const pdfBtn = document.querySelector('.report-preview-actions .btn-outline:nth-child(2)');
                    if (pdfBtn) {
                        pdfBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Export PDF';
                        pdfBtn.onclick = function(e) {
                            e.preventDefault();
                            exportToPDF();
                        };
                    }
                    
                    // Remove Download button (Third button - btn-primary)
                    const downloadBtn = document.querySelector('.report-preview-actions .btn-primary');
                    if (downloadBtn) {
                        downloadBtn.style.display = 'none';
                    }
                }
                showToast('Report generated successfully!', 'success');
            } else {
                showToast(data.message || 'Failed to generate report.', 'error');
                if (previewContent) {
                    previewContent.innerHTML = `
                        <div class="report-placeholder">
                            <i class="fas fa-exclamation-circle" style="font-size: 2.5rem; color: var(--danger);"></i>
                            <p>${data.message || 'Failed to generate report.'}</p>
                            <span class="empty-sub">Please try again or contact support.</span>
                        </div>
                    `;
                }
            }
        })
        .catch(function(error) {
            console.error('Report generation error:', error);
            showToast('Network error. Please try again.', 'error');
            if (previewContent) {
                previewContent.innerHTML = `
                    <div class="report-placeholder">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2.5rem; color: var(--danger);"></i>
                        <p>Network error occurred.</p>
                        <span class="empty-sub">Please check your connection and try again.</span>
                    </div>
                `;
            }
        });
    }

    // ========================================
    // PRINT REPORT
    // ========================================
    function printReport() {
        const content = document.querySelector('.report-preview-content');
        if (!content) {
            showToast('No report content to print.', 'error');
            return;
        }
        
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const printWindow = window.open('', '_blank', 'width=900,height=700');
        if (!printWindow) {
            showToast('Please allow popups for printing.', 'error');
            return;
        }
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${window.currentReportTitle || 'Health Report'}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                        padding: 40px;
                        color: #1A2A3A;
                        line-height: 1.6;
                        max-width: 1100px;
                        margin: 0 auto;
                    }
                    .report-print-header {
                        text-align: center;
                        margin-bottom: 30px;
                        border-bottom: 3px solid #4A90D9;
                        padding-bottom: 20px;
                    }
                    .report-print-header h1 { font-size: 24px; color: #1A2A3A; font-weight: 700; }
                    .report-print-header .barangay-name { font-size: 16px; color: #4A90D9; font-weight: 600; }
                    .report-print-header .report-date { font-size: 12px; color: #5A6C7D; margin-top: 4px; }
                    .report-print-footer {
                        text-align: center;
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 1px solid #E8EEF4;
                        font-size: 12px;
                        color: #5A6C7D;
                    }
                    .report-content { padding: 10px 0; }
                    .report-content h2 { font-size: 20px; font-weight: 700; color: #1A2A3A; margin-bottom: 4px; }
                    .report-content h3 { font-size: 16px; font-weight: 600; color: #1A2A3A; margin: 20px 0 12px 0; }
                    .report-content hr { border: none; border-top: 2px solid #E8EEF4; margin: 12px 0 20px 0; }
                    .report-stats-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                        gap: 12px;
                        margin-bottom: 20px;
                    }
                    .report-stat {
                        background: #F5FAFF;
                        padding: 14px 16px;
                        border-radius: 8px;
                        text-align: center;
                        border: 1px solid #E8EEF4;
                    }
                    .report-stat strong { display: block; font-size: 11px; color: #5A6C7D; text-transform: uppercase; letter-spacing: 0.5px; }
                    .report-stat .stat-number { font-size: 24px; font-weight: 700; color: #1A2A3A; }
                    .report-table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 13px;
                        margin: 8px 0 16px 0;
                    }
                    .report-table th {
                        background: #EBF3FB;
                        text-align: left;
                        padding: 8px 12px;
                        font-weight: 600;
                        color: #1A2A3A;
                        border-bottom: 2px solid #90CAF9;
                    }
                    .report-table td {
                        padding: 6px 12px;
                        border-bottom: 1px solid #E8EEF4;
                    }
                    .report-table tr:nth-child(even) td { background: #FAFCFE; }
                    .status-badge {
                        display: inline-block;
                        padding: 2px 12px;
                        border-radius: 50px;
                        font-size: 11px;
                        font-weight: 600;
                    }
                    .status-badge.status-completed { background: #E8F5E9; color: #2E7D32; }
                    .status-badge.status-upcoming { background: #FFF3E0; color: #E65100; }
                    .status-badge.status-overdue { background: #FDEDEC; color: #C62828; }
                    .status-badge.status-active { background: #EBF3FB; color: #4A90D9; }
                    .status-badge.status-inactive { background: #EEEEEE; color: #757575; }
                    .status-badge.status-normal { background: #E8F5E9; color: #2E7D32; }
                    .status-badge.status-underweight,
                    .status-badge.status-overweight { background: #FFF3E0; color: #E65100; }
                    .status-badge.status-obese,
                    .status-badge.status-severely-underweight { background: #FDEDEC; color: #C62828; }
                    .status-badge.status-sent { background: #E8F5E9; color: #2E7D32; }
                    .status-badge.status-failed { background: #FDEDEC; color: #C62828; }
                    .status-badge.status-pending { background: #FFF3E0; color: #E65100; }
                    .status-badge.status-cancelled { background: #EEEEEE; color: #757575; }
                    @media print {
                        body { padding: 20px; }
                        .report-print-header { margin-bottom: 20px; padding-bottom: 15px; }
                        .report-print-header h1 { font-size: 20px; }
                        .report-stats-grid { break-inside: avoid; }
                        .report-table { font-size: 11px; }
                        .report-table th, .report-table td { padding: 4px 8px; }
                    }
                </style>
            </head>
            <body>
                <div class="report-print-header">
                    <div class="barangay-name">Barangay Garsika</div>
                    <h1>${window.currentReportTitle || 'Health Report'}</h1>
                    <div class="report-date">Generated: ${dateStr}</div>
                </div>
                <div class="report-content">${content.innerHTML}</div>
                <div class="report-print-footer">
                    <p>Barangay Garsika · Smart Community Health Monitoring System</p>
                    <p>Generated on ${dateStr}</p>
                </div>
                <script>
                    window.onload = function() { window.print(); };
                <\/script>
            </body>
            </html>
        `);
        
        printWindow.document.close();
    }

    // ========================================
    // EXPORT TO PDF - AUTO DOWNLOAD
    // ========================================
    function exportToPDF() {
        const content = document.querySelector('.report-preview-content');
        if (!content) {
            showToast('No report content to export.', 'error');
            return;
        }
        
        showToast('Generating PDF...', 'info');
        
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Build complete HTML for PDF
        const pdfHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${window.currentReportTitle || 'Health Report'}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                        padding: 40px;
                        color: #1A2A3A;
                        line-height: 1.6;
                        max-width: 1100px;
                        margin: 0 auto;
                    }
                    .report-print-header {
                        text-align: center;
                        margin-bottom: 30px;
                        border-bottom: 3px solid #4A90D9;
                        padding-bottom: 20px;
                    }
                    .report-print-header h1 { font-size: 24px; color: #1A2A3A; font-weight: 700; }
                    .report-print-header .barangay-name { font-size: 16px; color: #4A90D9; font-weight: 600; }
                    .report-print-header .report-date { font-size: 12px; color: #5A6C7D; margin-top: 4px; }
                    .report-print-footer {
                        text-align: center;
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 1px solid #E8EEF4;
                        font-size: 12px;
                        color: #5A6C7D;
                    }
                    .report-content { padding: 10px 0; }
                    .report-content h2 { font-size: 20px; font-weight: 700; color: #1A2A3A; margin-bottom: 4px; }
                    .report-content h3 { font-size: 16px; font-weight: 600; color: #1A2A3A; margin: 20px 0 12px 0; }
                    .report-content hr { border: none; border-top: 2px solid #E8EEF4; margin: 12px 0 20px 0; }
                    .report-stats-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                        gap: 12px;
                        margin-bottom: 20px;
                    }
                    .report-stat {
                        background: #F5FAFF;
                        padding: 14px 16px;
                        border-radius: 8px;
                        text-align: center;
                        border: 1px solid #E8EEF4;
                    }
                    .report-stat strong { display: block; font-size: 11px; color: #5A6C7D; text-transform: uppercase; letter-spacing: 0.5px; }
                    .report-stat .stat-number { font-size: 24px; font-weight: 700; color: #1A2A3A; }
                    .report-table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 13px;
                        margin: 8px 0 16px 0;
                    }
                    .report-table th {
                        background: #EBF3FB;
                        text-align: left;
                        padding: 8px 12px;
                        font-weight: 600;
                        color: #1A2A3A;
                        border-bottom: 2px solid #90CAF9;
                    }
                    .report-table td {
                        padding: 6px 12px;
                        border-bottom: 1px solid #E8EEF4;
                    }
                    .report-table tr:nth-child(even) td { background: #FAFCFE; }
                    .status-badge {
                        display: inline-block;
                        padding: 2px 12px;
                        border-radius: 50px;
                        font-size: 11px;
                        font-weight: 600;
                    }
                    .status-badge.status-completed { background: #E8F5E9; color: #2E7D32; }
                    .status-badge.status-upcoming { background: #FFF3E0; color: #E65100; }
                    .status-badge.status-overdue { background: #FDEDEC; color: #C62828; }
                    .status-badge.status-active { background: #EBF3FB; color: #4A90D9; }
                    .status-badge.status-inactive { background: #EEEEEE; color: #757575; }
                    .status-badge.status-normal { background: #E8F5E9; color: #2E7D32; }
                    .status-badge.status-underweight,
                    .status-badge.status-overweight { background: #FFF3E0; color: #E65100; }
                    .status-badge.status-obese,
                    .status-badge.status-severely-underweight { background: #FDEDEC; color: #C62828; }
                    .status-badge.status-sent { background: #E8F5E9; color: #2E7D32; }
                    .status-badge.status-failed { background: #FDEDEC; color: #C62828; }
                    .status-badge.status-pending { background: #FFF3E0; color: #E65100; }
                    .status-badge.status-cancelled { background: #EEEEEE; color: #757575; }
                    @media print {
                        body { padding: 20px; }
                        .report-print-header { margin-bottom: 20px; padding-bottom: 15px; }
                        .report-print-header h1 { font-size: 20px; }
                        .report-stats-grid { break-inside: avoid; }
                        .report-table { font-size: 11px; }
                        .report-table th, .report-table td { padding: 4px 8px; }
                    }
                </style>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" integrity="sha512-GsLlZN/3F2ErC5ifS5QtgpiJtWd43JWSuIgh7mbzZ8zBps+dvLusV+eNQATqgA/HdeKFVgA5v3S/cIrLF7QnIg==" crossorigin="anonymous" referrerpolicy="no-referrer"><\/script>
            </head>
            <body>
                <div id="report-content-wrapper">
                    <div class="report-print-header">
                        <div class="barangay-name">Barangay Garsika</div>
                        <h1>${window.currentReportTitle || 'Health Report'}</h1>
                        <div class="report-date">Generated: ${dateStr}</div>
                    </div>
                    <div class="report-content">${content.innerHTML}</div>
                    <div class="report-print-footer">
                        <p>Barangay Garsika · Smart Community Health Monitoring System</p>
                        <p>Generated on ${dateStr}</p>
                    </div>
                </div>
                <script>
                    // Auto-download PDF when page loads
                    window.onload = function() {
                        const element = document.getElementById('report-content-wrapper');
                        const opt = {
                            margin:        [10, 10, 10, 10],
                            filename:     '${(window.currentReportTitle || 'report').replace(/\s+/g, '_')}_${now.toISOString().slice(0,10)}.pdf',
                            image:        { type: 'jpeg', quality: 0.98 },
                            html2canvas:  { scale: 2, letterRendering: true, useCORS: true, logging: false },
                            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
                        };
                        html2pdf().set(opt).from(element).save().then(function() {
                            window.close();
                        });
                    };
                <\/script>
            </body>
            </html>
        `;
        
        // Open in new window with PDF auto-download
        const pdfWindow = window.open('', '_blank', 'width=800,height=600');
        if (!pdfWindow) {
            showToast('Please allow popups for PDF export.', 'error');
            return;
        }
        
        pdfWindow.document.write(pdfHTML);
        pdfWindow.document.close();
    }

    // ========================================
    // CLOSE PREVIEW
    // ========================================
    function initClosePreview() {
        const closePreviewBtn = document.getElementById('closePreview');
        if (closePreviewBtn) {
            closePreviewBtn.addEventListener('click', function() {
                const preview = document.getElementById('reportPreview');
                if (preview) {
                    preview.style.display = 'none';
                    // Reset content to placeholder
                    const content = document.querySelector('.report-preview-content');
                    if (content) {
                        content.innerHTML = `
                            <div class="report-placeholder">
                                <i class="fas fa-file-alt"></i>
                                <p>Report content will appear here.</p>
                                <span class="empty-sub">Click a report button above to generate.</span>
                            </div>
                        `;
                    }
                    // Reset window variables
                    window.currentReportHTML = '';
                    window.currentReportTitle = '';
                }
            });
        }
    }

    // ========================================
    // INIT - Run when DOM is ready
    // ========================================
    function init() {
        // Initialize close preview
        initClosePreview();
        
        // Re-attach report generation buttons (in case DOM changes)
        document.querySelectorAll('.generate-report').forEach(function(btn) {
            btn.removeEventListener('click', handleBhwReportGeneration);
            btn.addEventListener('click', handleBhwReportGeneration);
        });
        
        console.log('📊 BHW Report system initialized successfully!');
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();