import { db } from './firebaseConfig.js';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// Reusable function for redirects
function redirectToLogin(message) {
  alert(message);
  window.location.href = 'index.html';
}

// HTML escaping function to prevent XSS
function escapeHTML(str) {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function formatTimestamp(timestamp) {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate();
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

// Logout
document.getElementById('logoutButton').addEventListener('click', () => {
  sessionStorage.clear();
  window.location.href = 'index.html';
});

// Ensure only professors can access
document.addEventListener('DOMContentLoaded', async () => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  console.log('Session user data:', user); // Debugging step

  if (!user || user.role !== 'professor') {
    redirectToLogin('Unauthorized access. Please log in.');
    return;
  }

  const professorDomain = user.Department;
  document.getElementById('userName').textContent = `Welcome, ${user.Name}`;
  document.getElementById('userDepartment').textContent = `Department: ${professorDomain}`;

  if (!professorDomain) {
    redirectToLogin('Error: Department not found in session. Please log in again.');
    return;
  }

  try {
    const complaintsRef = collection(db, 'complaints');
    const q = query(complaintsRef, where('domain', '==', professorDomain));
    const querySnapshot = await getDocs(q);

    const tableBody = document.querySelector('#complaintsTable tbody');
    tableBody.innerHTML = ''; // Clear existing rows

    querySnapshot.forEach((doc) => {
      const complaint = doc.data();
      const row = document.createElement('tr');
      row.id = `row-${doc.id}`; // Add a unique ID to the row
      const raisedTime = formatTimestamp(complaint.createdTimestamp);
      const resolvedTime = formatTimestamp(complaint.resolvedTimestamp);
      const isResolved = complaint.status === 'Resolved';
      // Check if the complaint is resolved

      row.innerHTML = `
        <td>${escapeHTML(complaint.subject)}</td>
        <td>${escapeHTML(complaint.description)}</td>
        <td>
          ${
            complaint.image
              ? `<button onclick="showImage('${complaint.image}')">View Image</button>`
              : 'No Image'
          }
        </td>
        <td class="status">${escapeHTML(complaint.status)}</td>
        <td>${raisedTime}</td>
        <td>
          <button 
            onclick="resolveComplaint('${doc.id}')" 
            id="button-${doc.id}" 
            ${isResolved ? 'disabled' : ''}>
            ${isResolved ? 'Resolved' : 'Resolve'}
          </button>
        </td>
        <td>${resolvedTime}</td>
      `;
      tableBody.appendChild(row);
    });

    if (querySnapshot.empty) {
      tableBody.innerHTML = `<tr><td colspan="4">No complaints found for your department.</td></tr>`;
    }
  } catch (error) {
    console.error('Error fetching complaints:', error);
    alert('An error occurred while fetching complaints. Please try again later.');
  }
});
window.showImage = (imageUrl) => {
  const modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  modal.style.display = 'flex';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';
  modal.style.zIndex = '1000';

  const img = document.createElement('img');
  img.src = imageUrl;
  img.style.maxWidth = '90%';
  img.style.maxHeight = '90%';

  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '20px';
  closeButton.style.right = '20px';
  closeButton.style.padding = '10px';
  closeButton.style.backgroundColor = '#fff';
  closeButton.style.border = 'strong';
  closeButton.style.cursor = 'pointer';

  closeButton.addEventListener('click', () => {
    document.body.removeChild(modal);
  });

  modal.appendChild(img);
  modal.appendChild(closeButton);
  document.body.appendChild(modal);
};
// Mark complaint as resolved
window.resolveComplaint = async (complaintId) => {
  if (!complaintId) {
    alert('Invalid complaint ID. Please try again.');
    return;
  }

  try {
    const complaintRef = doc(db, 'complaints', complaintId);
    await updateDoc(complaintRef, {
      status: 'Resolved',
      resolvedTimestamp: serverTimestamp(),
    });

    // Update the specific row dynamically without reloading
    const statusCell = document.querySelector(`#row-${complaintId} .status`);
    const button = document.querySelector(`#button-${complaintId}`);
    const resolvedTimeCell = document.querySelector(`#row-${complaintId} td:last-child`);

    if (statusCell) statusCell.textContent = 'Resolved';
    if (button) {
      button.textContent = 'Resolved';
      button.disabled = true; // Disable the button
    }

    if (resolvedTimeCell) {
      const resolvedTimestamp = new Date();
      resolvedTimeCell.textContent = `${resolvedTimestamp.toLocaleDateString()} ${resolvedTimestamp.toLocaleTimeString()}`;
    }

    alert('Complaint resolved successfully!');
  } catch (error) {
    console.error('Error resolving complaint:', error);
    alert('An error occurred while resolving the complaint. Please try again later.');
  }
};
