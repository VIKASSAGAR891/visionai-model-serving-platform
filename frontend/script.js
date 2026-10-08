/* =====================
   IMAGE PREVIEW MANAGEMENT
   ===================== */

const imageInput = document.getElementById('imageInput');
const previewContainer = document.getElementById('previewContainer');
const previewImage = document.getElementById('previewImage');
const filename = document.getElementById('filename');

// Handle file selection
imageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        displayPreview(file);
    }
});

// Display image preview
function displayPreview(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        previewImage.src = e.target.result;
        filename.textContent = file.name;
        previewContainer.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

// Change image
function changeImage() {
    imageInput.click();
}

// Clear prediction
function clearPrediction() {
    imageInput.value = '';
    previewContainer.classList.add('hidden');
    document.getElementById('results').innerHTML = '';
}

/* =====================
   PREDICTION HANDLING
   ===================== */

async function uploadImage() {
    const fileInput = document.getElementById('imageInput');
    
    if (!fileInput.files[0]) {
        alert('Please select an image first');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    
    // Show loading state
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '<div style="padding: 40px; text-align: center;"><p style="color: #6B7280;">Analyzing image...</p></div>';
    
    // Disable predict button
    const predictBtn = document.getElementById('predictBtn');
    predictBtn.disabled = true;
    predictBtn.textContent = 'Analyzing...';
    
    try {
        const response = await fetch('http://127.0.0.1:8000/predict', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('=== PREDICT RESPONSE ===');
        console.log('Full response:', JSON.stringify(data, null, 2));
        console.log('Has predictions:', !!data.predictions);
        console.log('Predictions length:', data.predictions?.length);
        console.log('Annotated image:', data.annotated_image);
        console.log('=== END RESPONSE ===' );
        
        if (data.predictions && data.predictions.length > 0) {
            displayResults(data);
            
            // Wait a moment for database to sync, then reload history
            setTimeout(async () => {
                await loadHistory();
            }, 500);
        } else {
            resultsContainer.innerHTML = '<p style="color: #6B7280; padding: 20px;">No predictions found</p>';
        }
        
    } catch (error) {
        console.error('=== UPLOAD ERROR ===');
        console.error('Error message:', error.message);
        console.error('Full error:', error);
        console.error('=== END ERROR ===' );
        resultsContainer.innerHTML = `<p style="color: #EF4444; padding: 20px;">Error: ${error.message}</p>`;
    } finally {
        // Re-enable predict button
        predictBtn.disabled = false;
        predictBtn.textContent = 'Analyze Image';
    }
}

// Display prediction results
function displayResults(data) {
    const resultsContainer = document.getElementById('results');
    let output = '<div class="results-layout">';

    // Image section
    if (data.annotated_image) {
        const imageUrl = `http://127.0.0.1:8000/${data.annotated_image}`;
        console.log('=== IMAGE LOADING ===');
        console.log('Image URL:', imageUrl);
        console.log('=== END IMAGE ===' );
        
        output += `
            <div class="results-image-column">
                <h3 style="font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 12px;">Detected Image</h3>
                <img src="${imageUrl}" class="detected-image" alt="Detected" 
                     onload="console.log('Image loaded successfully from: ${imageUrl}')" 
                     onerror="console.error('FAILED to load image from: ${imageUrl}'); console.error('Status: image not found or CORS issue');">
            </div>
        `;
    } else {
        console.error('=== MISSING IMAGE ===');
        console.error('No annotated_image in response!');
        console.error('Response data:', data);
        console.error('=== END ERROR ===' );
        output += '<div class="results-image-column"><p style="color: #EF4444;">Error: No annotated image generated</p></div>';
    }

    // Predictions section
    if (data.predictions && data.predictions.length > 0) {
        output += '<div class="results-predictions-column">';
        output += '<h3 style="font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 12px;">Predictions</h3>';
        output += '<div class="predictions-stack">';
        
        data.predictions.forEach(item => {
            const confidence = parseFloat(item.confidence);
            const percentConfidence = (confidence * 100).toFixed(2);
            
            output += `
                <div class="result-card">
                    <div class="result-label">Detection</div>
                    <div class="result-class">${escapeHtml(item.class)}</div>
                    <div class="result-label" style="margin-top: 12px;">Confidence</div>
                    <div class="result-confidence">${percentConfidence}%</div>
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: ${percentConfidence}%"></div>
                    </div>
                </div>
            `;
        });
        
        output += '</div></div>';
    }

    output += '</div>';
    resultsContainer.innerHTML = output;
}

/* =====================
   HISTORY MANAGEMENT
   ===================== */

async function loadHistory() {
    try {
        console.log('Fetching history...');
        const response = await fetch(`http://127.0.0.1:8000/history?t=${Date.now()}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const responseData = await response.json();
        console.log('History response:', responseData);
        
        const historyBody = document.getElementById('historyBody');
        
        // Handle both old format (array) and new format (object with data field)
        let historyArray = Array.isArray(responseData) ? responseData : responseData.data;
        
        // Validate that we have an array
        if (!Array.isArray(historyArray)) {
            console.warn('Invalid history data format. Expected array or object with data property.', responseData);
            historyBody.innerHTML = `
                <tr class="empty-row">
                    <td colspan="4">Unable to parse history data</td>
                </tr>
            `;
            return;
        }
        
        console.log(`Loaded ${historyArray.length} history records`);
        
        if (historyArray.length === 0) {
            console.log('No records in history');
            historyBody.innerHTML = `
                <tr class="empty-row">
                    <td colspan="4">No analysis history yet. Upload an image to get started.</td>
                </tr>
            `;
            return;
        }
        
        let html = '';
        
        // Data is already sorted by most recent first from backend, no need to reverse
        historyArray.forEach((item, index) => {
            console.log(`Row ${index}:`, item);
            
            let confidence = item.confidence;
            
            // If confidence is a string representation of a number, use it as-is
            // If it's a number, convert to percentage
            if (typeof confidence === 'string') {
                // Check if it's already a percentage or a decimal
                if (confidence.includes('%')) {
                    // Already formatted as percentage
                } else if (parseFloat(confidence) < 1) {
                    // It's a decimal (0.87), convert to percentage
                    confidence = (parseFloat(confidence) * 100).toFixed(2) + '%';
                } else {
                    // It's already a number without %
                    confidence = confidence + '%';
                }
            } else {
                confidence = (parseFloat(confidence) * 100).toFixed(2) + '%';
            }
            
            const timestamp = item.timestamp || new Date().toLocaleString();
            
            html += `
                <tr>
                    <td>${escapeHtml(item.filename)}</td>
                    <td>${escapeHtml(item.prediction)}</td>
                    <td><span style="background: #DBEAFE; color: #2563EB; padding: 4px 8px; border-radius: 4px; font-weight: 600; font-size: 12px;">${escapeHtml(confidence)}</span></td>
                    <td>${formatTimestamp(timestamp)}</td>
                </tr>
            `;
        });
        
        console.log("Rendering rows:", historyArray.length);
        historyBody.innerHTML = html;
        console.log('History table rendered successfully');
        
    } catch (error) {
        console.error('Error loading history:', error);
        const historyBody = document.getElementById('historyBody');
        historyBody.innerHTML = `
            <tr class="empty-row">
                <td colspan="4">Error loading history: ${error.message}</td>
            </tr>
        `;
    }
}

/* =====================
   UTILITY FUNCTIONS
   ===================== */

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Format timestamp
function formatTimestamp(timestamp) {
    try {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString();
    } catch (e) {
        return timestamp;
    }
}

/* =====================
   INITIALIZATION
   ===================== */

// Load history on page load
document.addEventListener('DOMContentLoaded', function() {
    loadHistory();
    
    // Update active nav link on scroll
    const sections = document.querySelectorAll('.section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href').slice(1);
            if (href === current) {
                link.classList.add('active');
            }
        });
    });
});