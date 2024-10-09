import React, { useRef, useState } from 'react';
import './App.css';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'; // Import auth functions
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

  return (
    <div className="head-background">
      <div className="nav-header">
        <SignOut />
      </div>
      <div className="">
        {user ? <ChatRoom /> : <SignIn />}
      </div>
    </div>
  );
}

function SignIn() {
  const provider = new GoogleAuthProvider();

  const signInWithGoogle = () => {
    signInWithPopup(auth, provider); // Correctly sign in with Google
  };

  return (
    <div className="center-div">
      <div>
        <h1>Welcome to Late Chat</h1>
      </div>
      <div>
        <button className="signGoogle" onClick={signInWithGoogle}>Sign in with Google
          <img className="google-icon" src="/google-icon.png" alt="Google Icon" />
        </button>
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

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>
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