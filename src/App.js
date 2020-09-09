import React, { useState } from 'react';
import * as firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';
import './App.css';

firebase.initializeApp(firebaseConfig);

function App() {
  const [newUser, setNewUser] = useState(false)
  const [user, setUser] = useState({
    isSignedIn: false,
    name: '',
    email: '',
    password: '',
    photoURL: '',
    error: '',
    success: false
  });
  const provider = new firebase.auth.GoogleAuthProvider();
  const fbProvider = new firebase.auth.FacebookAuthProvider();
  const handleSignIn = () => {
    firebase.auth().signInWithPopup(provider)
      .then(result => {
        const { displayName, photoURL, email } = result.user;
        const signedInUser = {
          isSignedIn: true,
          name: displayName,
          email: email,
          photoURL: photoURL
        }
        setUser(signedInUser)
      })
      .catch(err => {
        console.log(err);
      })
  }

  const handleSignOut = () => {
    firebase.auth().signOut()
      .then(res => {
        setUser({})
        console.log(user.isSignedIn);
      })
      .catch(err => {
        console.log(err);
      })
  }

  const handleSubmit = (e) => {
    console.log(user.email, user.password);
    if (newUser && user.email && user.password) {
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
        .then(res => {
          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.success = true
          setUser(newUserInfo);
          updateUserName(user.name)
        })
        .catch(err => {
          const newUserInfo = { ...user };
          newUserInfo.error = err.message;
          newUserInfo.success = false
          setUser(newUserInfo);
        })
    }

    if (!newUser && user.email && user.password) {
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(res => {
          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.success = true
          setUser(newUserInfo);
          console.log("Sign in user info", res.user);
        })
        .catch(function (error) {
          const newUserInfo = { ...user };
          newUserInfo.error = error.message;
          newUserInfo.success = false
          setUser(newUserInfo);
        });
    }
    e.preventDefault()
  }

  const handleBlur = (e) => {
    let isFieldValid = 'true'
    if (e.target.name === 'email') {
      isFieldValid = /\S+@\S+\.\S+/.test(e.target.value);
    }
    if (e.target.name === 'password') {
      const isPasswordValid = e.target.value.length > 6;
      const passwordHasNumber = /\d{1}/.test(e.target.value);
      isFieldValid = isPasswordValid && passwordHasNumber;
    }

    if (isFieldValid) {
      const newUserInfo = { ...user };
      newUserInfo[e.target.name] = e.target.value;
      setUser(newUserInfo);
    }
  }

  const updateUserName = name => {
    const user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name,
    }).then(function () {
      console.log("User name updated successfully");
    }).catch(function (error) {
      console.log(error);
    })
  }

  const handleFbSignIn = () => {
    firebase.auth().signInWithPopup(fbProvider).then(function (result) {
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      // ...
    }).catch(function (error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });
  }

  return (
    <div className="App">
      <h1>Firebase auth</h1>
      {
        user.isSignedIn ? <button onClick={handleSignOut}>Sign out</button> :
          <button onClick={handleSignIn}>Sign In</button>
      }<br />
      {
        <button onClick={handleFbSignIn}>Sign In with facebook</button>
      }
      <h1>Our Own Authentication</h1>
      <form onSubmit={handleSubmit}>
        <input type="checkbox" name="newUser" id="" onChange={() => { setNewUser(!newUser) }} />
        <label htmlFor="newUser">New User Sign Up</label><br />
        {newUser && <input type="text" onBlur={handleBlur} name="name" placeholder="Your Name" />}<br />
        <input type="text" onBlur={handleBlur} name="email" placeholder="Enter Your Email Address" required /><br />
        <input type="password" onBlur={handleBlur} name="password" id="" placeholder="Enter Your Password" required /><br />
        <input type="submit" value={newUser ? 'Sign Up' : 'Sign In'} onClick={handleSubmit} />
      </form>
      <p style={{ color: 'red' }}>{user.error}</p>
      {user.success && <p style={{ color: 'green' }}>User {newUser ? 'Created' : 'logged in'} successfully!</p>}
    </div>
  );
}

export default App;
