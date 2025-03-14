// login.js
import { db } from './firebaseConfig.js'; // Import Firestore from firebaseConfig.js
import { getDoc, doc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// login.js
document.getElementById('StudentLoginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('Susername').value;
  const password = document.getElementById('Spassword').value;
  const role = document.getElementById('Srole').value;

  const userRef = doc(db, 'users', username);

  try {
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const user = userDoc.data();
      if(user.role === role){

      if (user.password === password) {
        console.log('Login successful!');

        // Store user data in sessionStorage
        sessionStorage.setItem('user', JSON.stringify({
          username: username,
          Name:user.Name,
          role: user.role,
          Department: user.Department, // Ensure department is included
        }));

        // Redirect based on the user's role
        if (user.role === 'student') {
          window.location.href = 'complaint-form.html';
        }
        document.getElementById('StudentLoginForm').reset();
      } else {
        alert('Incorrect password.');
      }
    }
    else{
      alert("Role doesn't match");
    }
   } 
   else {
      alert('User not found.');
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    alert('An error occurred. Please try again.');
  }
  document.getElementById('StudentLoginForm').reset();
});

document.getElementById('ProfessorLoginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('Pusername').value;
  const password = document.getElementById('Ppassword').value;
  const role = document.getElementById('Prole').value;

  const userRef = doc(db, 'users', username);

  try {
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const user = userDoc.data();
      console.log(user)
      if(user.role === role){

      if (user.password === password) {
        console.log('Login successful!');

        // Store user data in sessionStorage
        sessionStorage.setItem('user', JSON.stringify({
          username: username,
          Name:user.Name,
          role: user.role,
          Department: user.Department, // Ensure department is included
        }));

        // Redirect based on the user's role
        if (user.role === 'professor') {
          window.location.href = 'professor-dashboard.html';
        }
        document.getElementById('ProfessorLoginForm').reset();
      } else {
        alert('Incorrect password.');
      }
    }
    else{
      alert("Role doesn't match");
    }
   } 
   else {
      alert('User not found.');
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    alert('An error occurred. Please try again.');
  }
  document.getElementById('ProfessorLoginForm').reset();
});