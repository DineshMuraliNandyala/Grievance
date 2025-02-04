import { db } from './firebaseConfig.js';
import { collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// Logout function
document.getElementById('logoutButton').addEventListener('click', () => {
  sessionStorage.clear();
  window.location.href = 'index.html';
});

// Convert image file to Base64
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

// Ensure the page is accessible only after login
document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (!user || user.role !== 'student') {
    alert('Unauthorized access. Please log in.');
    window.location.href = 'index.html';
    return;
  }

  // Display user's name and department on the page
  document.getElementById('userName').textContent = `Welcome, ${user.Name}`;
  document.getElementById('userDepartment').textContent = `Department: ${user.Department}`;

  // Add user's department as an option in the domain dropdown
  const domainDropdown = document.getElementById('domain');
  const deptOption = document.createElement('option');
  deptOption.value = user.Department;
  deptOption.textContent = user.Department;
  domainDropdown.appendChild(deptOption);
});

// Handle form submission
document.getElementById('complaintForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  // Get form values
  const domain = document.getElementById('domain').value;
  const subject = document.getElementById('subject').value;
  const description = document.getElementById('description').value;
  const imageFile = document.getElementById('file-upload').files[0]; // Get the image file (optional)

  // Reference to the complaints collection
  const complaintsRef = collection(db, 'complaints');

  try {
    let imageBase64 = null;

    // If an image is uploaded, convert it to Base64
    if (imageFile) {
      imageBase64 = await convertToBase64(imageFile);
    }

    // Add the complaint document to Firestore
    await addDoc(complaintsRef, {
      domain: domain,
      subject: subject,
      description: description,
      image: imageBase64,                 // Store the image as Base64 (or null if no image)
      createdTimestamp: serverTimestamp(), // Automatically generated timestamp
      resolvedTimestamp: null,             // Initially null
      status: 'Not Solved',                // Default status
    });

    alert('Complaint submitted successfully!');
    // Clear the form after submission
    document.getElementById('complaintForm').reset();
  } catch (error) {
    console.error('Error submitting complaint:', error);
    alert('An error occurred while submitting the complaint. Please try again.');
  }
});
