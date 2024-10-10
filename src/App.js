import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'; // Import auth functions
import { getFirestore, collection, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore'; // Import Firestore functions
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import 'bootstrap-icons/font/bootstrap-icons.css';


const firebaseConfig = {
  apiKey: "AIzaSyBpPGEAD5EOAyKwOaVfD39P4x-RN0k6EM0",
  authDomain: "messaging-app-b2e33.firebaseapp.com",
  projectId: "messaging-app-b2e33",
  storageBucket: "messaging-app-b2e33.appspot.com",
  messagingSenderId: "253609801122",
  appId: "1:253609801122:web:b88a8bc7eda33f164a6efb",
  measurementId: "G-R609L796KW"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp); // Get auth instance
const firestore = getFirestore(firebaseApp); // Get Firestore instance

function App() {
  const [user] = useAuthState(auth); // Correctly get the user state

  const [isSigningUp, setIsSigningUp] = useState(false);

  return (
    <div className="head-background">
      <div className="nav-header">
        {user ? <SignOut /> : null}
      </div>
      <div>
      {user ? (
          <ChatRoom />
        ) : (
          isSigningUp ? (
            <SignUp setIsSigningUp={setIsSigningUp} />
          ) : (
            <SignIn setIsSigningUp={setIsSigningUp} />
          )
        )}
      </div>
    </div>
  );
}

function SignUp({setIsSigningUp}){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setError('');
    } catch (error) {
      setError(error.message);
    }
  };


  return (
    <div className="center-div">
      <div>
        <h1>Create your account</h1>
      </div>

      <form onSubmit={handleSignup}>
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
        </div>
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
        </div>
        <div>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            required
          />
        </div>
        <div className="center-btn">
          <button type="submit">Sign Up</button>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>

      <div className="signup-link">
        Already have an account?{' '}
        <span onClick={() => setIsSigningUp(false)}>
          Sign In here
        </span>
      </div>
    </div>
  );
}

function SignIn({setIsSigningUp}) {
  const provider = new GoogleAuthProvider();
  const [email, setEmail] = useState(''); // State for email
  const [password, setPassword] = useState(''); // State for password
  const [error, setError] = useState(''); // State for error messages

  const signInWithGoogle = () => {
    signInWithPopup(auth, provider); // Correctly sign in with Google
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault(); // Prevent the default form submission

    try {
      await signInWithEmailAndPassword(auth, email, password); // Sign in with email and password
      setEmail(''); // Clear email input
      setPassword(''); // Clear password input
    } catch (error) {
      console.error("Error signing in with email: ", error);
      setError(error.message); // Set error message
    }
  };


  return (
    <div className="center-div">
      <div>
        <h1>Welcome to Late Chat</h1>
      </div>

      <form onSubmit={handleEmailSignIn}> {/* Email/password form */}
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Update email state
            placeholder="Email"
            required
          />
        </div>
        
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Update password state
            placeholder="Password"
            required
          />
        </div>
        <div className="center-btn">
          <button type="submit">Sign In</button>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}
      </form>

      <div className="divider">
        or
      </div>
      
      <div>
        <button className="signGoogle" onClick={signInWithGoogle}>Sign in with Google
          <img className="google-icon" src="/google.png" alt="Google Icon" />
        </button>
      </div>

      <div className="signup-link">
        Don't have an account? {' '}
        <span onClick={() => setIsSigningUp(true)}>
          Signup here
        </span>
      </div>
    </div>
  );
}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => signOut(auth)}>Sign Out</button>
  );
}

function ChatRoom() {
  const dummy = useRef();

  const messagesRef = collection(firestore, 'messages'); // Use Firestore collection reference
  const q = query(messagesRef, orderBy('createAt'), limit(25)); // Create query

  const [messages] = useCollectionData(q, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser; // Get current user

    await addDoc(messagesRef, {
      text: formValue,
      createAt: serverTimestamp(),
      uid,
      photoURL
    });

    setFormValue('');

    dummy.current.scrollIntoView({ behavior: 'smooth' });
  };

  // useEffect to log messages to the console whenever they change
  useEffect(() => {
    if (messages) {
      console.log('Current Messages:', messages);
    }
  }, [messages]); 

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <form className="form-send" onSubmit={sendMessage}>
      <div className="div-input">
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />

        <button className="submit-btn" type="submit" disabled={!formValue}><i className="bi bi-send"></i> {/* Send Icon */}</button>
      </div>
    </form>
  </>)
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p>{text}</p>
    </div>
  </>)
}

export default App;