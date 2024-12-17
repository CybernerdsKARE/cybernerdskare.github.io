document.addEventListener('DOMContentLoaded', () => {
    const teamMembersDiv = document.getElementById('teamMembers');
    
    // Add 3 team member sections
    for (let i = 1; i <= 3; i++) {
        addTeamMemberSection(i);
    }

    document.getElementById('registrationForm').addEventListener('submit', handleSubmit);
});

function addTeamMemberSection(memberNum) {
    const section = document.createElement('div');
    section.className = 'team-section';
    section.innerHTML = `
        <h3>Team Member ${memberNum}</h3>
        <div class="form-group">
            <input type="text" id="member${memberNum}Name" name="member${memberNum}Name" required>
            <label>Full Name</label>
        </div>
        <div class="form-group">
            <input type="text" id="member${memberNum}RegNo" name="member${memberNum}RegNo" required>
            <label>Registration Number</label>
        </div>
        <div class="form-group">
            <select id="member${memberNum}Department" name="member${memberNum}Department" required>
                <option value="">Select Department</option>
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="CS/IT">CS/IT</option>
            </select>
        </div>
        <div class="form-group">
            <select id="member${memberNum}Year" name="member${memberNum}Year" required>
                <option value="">Select Year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
            </select>
        </div>
        <div class="form-group">
            <input type="tel" id="member${memberNum}Phone" name="member${memberNum}Phone" pattern="[0-9]{10}" required>
            <label>Phone Number</label>
        </div>
    `;
    document.getElementById('teamMembers').appendChild(section);
}

async function handleSubmit(e) {
    e.preventDefault();
    
    const formData = {
        leader: {
            name: document.getElementById('leaderName').value,
            regNo: document.getElementById('leaderRegNo').value,
            department: document.getElementById('leaderDepartment').value,
            year: document.getElementById('leaderYear').value,
            phone: document.getElementById('leaderPhone').value
        },
        members: []
    };

    // Collect member data
    for (let i = 1; i <= 3; i++) {
        formData.members.push({
            name: document.getElementById(`member${i}Name`).value,
            regNo: document.getElementById(`member${i}RegNo`).value,
            department: document.getElementById(`member${i}Department`).value,
            year: document.getElementById(`member${i}Year`).value,
            phone: document.getElementById(`member${i}Phone`).value
        });
    }

    try {
        const response = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ teamData: formData })
        });

        const data = await response.json();
        
        if (data.success) {
            alert('Registration successful!');
            window.location.href = '/';
        } else {
            alert('Registration failed: ' + data.message);
        }
    } catch (error) {
        alert('Error submitting form: ' + error.message);
    }
} 