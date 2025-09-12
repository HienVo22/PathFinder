// Resume Upload Demo JavaScript
// This code demonstrates drag-and-drop file upload functionality
// Enhanced with GitHub Copilot assistance for better user experience

class ResumeUploader {
    constructor() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.progressContainer = document.getElementById('progressContainer');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.fileInfo = document.getElementById('fileInfo');
        this.successMessage = document.getElementById('successMessage');
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        // Drag and drop events
        this.uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        this.uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.uploadArea.addEventListener('drop', this.handleDrop.bind(this));
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        
        // File input change event
        this.fileInput.addEventListener('change', this.handleFileSelect.bind(this));
    }
    
    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('dragover');
    }
    
    handleDragLeave(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
    }
    
    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        this.processFiles(files);
    }
    
    handleFileSelect(e) {
        const files = e.target.files;
        this.processFiles(files);
    }
    
    processFiles(files) {
        if (files.length === 0) return;
        
        // Filter for resume files
        const validFiles = Array.from(files).filter(file => 
            this.isValidResumeFile(file)
        );
        
        if (validFiles.length === 0) {
            alert('Please select valid resume files (.pdf, .doc, .docx)');
            return;
        }
        
        validFiles.forEach(file => this.uploadFile(file));
    }
    
    isValidResumeFile(file) {
        const validTypes = ['application/pdf', 'application/msword', 
                           'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const validExtensions = ['.pdf', '.doc', '.docx'];
        
        const hasValidType = validTypes.includes(file.type);
        const hasValidExtension = validExtensions.some(ext => 
            file.name.toLowerCase().endsWith(ext)
        );
        
        return hasValidType || hasValidExtension;
    }
    
    uploadFile(file) {
        this.showFileInfo(file);
        this.simulateUpload(file);
    }
    
    showFileInfo(file) {
        const fileSize = this.formatFileSize(file.size);
        const fileType = file.name.split('.').pop().toUpperCase();
        
        this.fileInfo.innerHTML = `
            <strong>📄 ${file.name}</strong><br>
            <span style="color: #64748b;">Size: ${fileSize} | Type: ${fileType}</span>
        `;
        this.fileInfo.style.display = 'block';
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    simulateUpload(file) {
        // Show progress container
        this.progressContainer.style.display = 'block';
        this.successMessage.style.display = 'none';
        
        let progress = 0;
        const uploadInterval = setInterval(() => {
            progress += Math.random() * 15;
            
            if (progress >= 100) {
                progress = 100;
                clearInterval(uploadInterval);
                this.onUploadComplete(file);
            }
            
            this.updateProgress(progress);
        }, 200);
    }
    
    updateProgress(progress) {
        const roundedProgress = Math.round(progress);
        this.progressFill.style.width = `${roundedProgress}%`;
        this.progressText.textContent = `${roundedProgress}%`;
    }
    
    onUploadComplete(file) {
        setTimeout(() => {
            this.progressContainer.style.display = 'none';
            this.successMessage.style.display = 'block';
            
            // Add some AI-powered features simulation
            this.simulateAIProcessing(file);
        }, 500);
    }
    
    simulateAIProcessing(file) {
        setTimeout(() => {
            const skills = this.extractMockSkills();
            const jobMatches = this.generateMockJobMatches();
            
            this.displayAIResults(skills, jobMatches);
        }, 1500);
    }
    
    extractMockSkills() {
        const possibleSkills = [
            'JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'AWS',
            'Machine Learning', 'Data Analysis', 'Project Management',
            'Communication', 'Leadership', 'Problem Solving'
        ];
        
        return possibleSkills
            .sort(() => 0.5 - Math.random())
            .slice(0, 5);
    }
    
    generateMockJobMatches() {
        return [
            { title: 'Frontend Developer', company: 'TechCorp', match: '95%' },
            { title: 'Full Stack Engineer', company: 'StartupXYZ', match: '88%' },
            { title: 'Software Developer', company: 'BigTech Inc', match: '82%' }
        ];
    }
    
    displayAIResults(skills, jobMatches) {
        const aiResults = document.createElement('div');
        aiResults.style.cssText = `
            margin-top: 20px;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 10px;
            animation: fadeIn 0.5s ease-in;
        `;
        
        aiResults.innerHTML = `
            <h3>🤖 AI Analysis Complete!</h3>
            <div style="margin: 15px 0;">
                <strong>Extracted Skills:</strong><br>
                ${skills.map(skill => `<span style="background: rgba(255,255,255,0.2); padding: 3px 8px; margin: 2px; border-radius: 15px; display: inline-block; font-size: 12px;">${skill}</span>`).join('')}
            </div>
            <div style="margin: 15px 0;">
                <strong>Top Job Matches:</strong><br>
                ${jobMatches.map(job => `
                    <div style="background: rgba(255,255,255,0.1); padding: 8px; margin: 5px 0; border-radius: 5px;">
                        <strong>${job.title}</strong> at ${job.company} - <span style="color: #10b981;">${job.match} match</span>
                    </div>
                `).join('')}
            </div>
            <div style="text-align: center; margin-top: 15px;">
                <button class="btn" style="background: rgba(255,255,255,0.2); border: 1px solid white;" onclick="alert('Feature coming soon in Pathfinder!')">
                    🚀 Apply to All Matches
                </button>
            </div>
        `;
        
        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
        
        document.querySelector('.container').appendChild(aiResults);
    }
}

// Initialize the uploader when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 Pathfinder Resume Upload Demo - Initialized with AI assistance');
    new ResumeUploader();
    
    // Add some interactive console messages
    console.log('💡 This demo showcases:');
    console.log('   • Drag & drop file upload');
    console.log('   • Progress tracking');
    console.log('   • File validation');
    console.log('   • Simulated AI processing');
    console.log('   • Mock job matching');
    console.log('🚀 Perfect foundation for the Pathfinder platform!');
});
