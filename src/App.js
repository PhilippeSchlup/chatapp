import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { initializeApp } from 'firebase/app';
import { getAuth, updateProfile, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'; // Import auth functions
import { getFirestore, where, collection, arrayUnion, query, orderBy, limit, doc, updateDoc, setDoc, getDoc, addDoc, writeBatch, getDocs, serverTimestamp } from 'firebase/firestore'; // Import Firestore functions
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
  const [isChangingProfile, setIsChangingProfile] = useState(false);

  return (
    <div className="head-background">
      <div>
        {user ? <SignOut /> : null}
      </div>
        
      <div>
        {user ? (
            isChangingProfile? (
              <ChooseProfileImage setIsChangingProfile={setIsChangingProfile} />
            ) : (
              <ChatRoom setIsChangingProfile={setIsChangingProfile} /> 
            )
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

function SignUp({ setIsSigningUp }) {
  const [name, setName] = useState('');  // New state for the name field
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log('User created:', user);  // Logging the created user object

      // Save user to Firestore
      await saveUserToFirestore(user);
      
      // Reset form fields
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setError('');
      console.log('User saved to Firestore successfully');  // Log success

    } catch (error) {
      console.error('Error during signup:', error);  // Log the error
      setError(error.message);  // Display the error to the user
    }
  };

  // Save user information to Firestore
  const saveUserToFirestore = async (user) => {
    try {
      const userRef = doc(firestore, 'users', user.uid);
  
      // Set user data, including the new 'name' field
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        name: name,  // Save the user's name
        photoURL: user.photoURL || `${process.env.PUBLIC_URL}/avatars/default_avatar.png`,  // Default avatar
        contacts: [] // Empty contacts array
      });

    } catch (error) {
      console.error('Error saving user to Firestore:', error);  // Log Firestore save error
      setError('Error saving user data to Firestore');  // Set Firestore error message
    }
  };

  return (
    <div className="center-div">
      <div>
        <h1>Create your account</h1>
      </div>

      <form className="form-column" onSubmit={handleSignup}>
        <div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            required
          />
        </div>
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
        <span onClick={() => setIsSigningUp(false)}>Sign In here</span>
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

      <form className='form-column' onSubmit={handleEmailSignIn}> {/* Email/password form */}
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
          <img className="google-icon" src={`${process.env.PUBLIC_URL}/google.png`} alt="Google Icon" />
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
    <div className="nav-header">
      <button className="sign-out" onClick={() => signOut(auth)}>Sign Out</button>
    </div>
  );
}


function ChooseProfileImage({ setIsChangingProfile }) {
  const avatars = [
    `${process.env.PUBLIC_URL}/avatars/black_pirate.png`,
    `${process.env.PUBLIC_URL}/avatars/boy.png`,
    `${process.env.PUBLIC_URL}/avatars/frida.png`,
    `${process.env.PUBLIC_URL}/avatars/hippie.png`,
    `${process.env.PUBLIC_URL}/avatars/robot.png`,
    `${process.env.PUBLIC_URL}/avatars/default_avatar.png`,
  ];  

  const [selectedAvatar, setSelectedAvatar] = useState(null); // State to hold the selected avatar

  const handleAvatarClick = (avatarUrl) => {
    setSelectedAvatar(avatarUrl); // Set the selected avatar
    console.log("Selected avatar:", avatarUrl); // Log for debugging
  };

  const handleSave = async () => {
    const user = auth.currentUser; // Get the current user

    if (user && selectedAvatar) {
      try {
        // Update the user's profile with the new photo URL
        await updateProfile(user, {
          photoURL: selectedAvatar,
        });

        // Update Firestore user document with the new photo URL
        await updateFirestoreUserPhoto(user.uid, selectedAvatar);
        
        console.log("Profile photo updated to:", selectedAvatar);
        setIsChangingProfile(false); // Close the profile image selection
      } catch (error) {
        console.error("Error updating profile photo:", error);
        alert("Failed to update profile photo.");
      }
    } else {
      alert("Please select an avatar before saving.");
      setIsChangingProfile(false);
    }
  };

  return (
    <div className="center-div">
      <div>
        <h1>Choose your profile image</h1>
      </div>

      <div className="grid-avatar-container">
        {avatars.map((avatar, index) => (
          <img
            key={index}
            className="grid-avatar-item"
            src={avatar}
            alt={`Avatar ${index + 1}`}
            onClick={() => handleAvatarClick(avatar)} // Handle image click
            style={{ border: selectedAvatar === avatar ? '2px solid blue' : 'none' }} // Highlight selected avatar
          />
        ))}
      </div>

      <button onClick={handleSave}>Save</button> {/* Call handleSave on button click */}
    </div>
  );
}

// New function to update user's Firestore document with the new photo URL
async function updateFirestoreUserPhoto(uid, newPhotoUrl) {
  const userDocRef = doc(firestore, 'users', uid); // Reference to the user's document

  try {
    await updateDoc(userDocRef, { photoURL: newPhotoUrl }); // Update the photoURL field in Firestore
    console.log("User document updated with new photo URL");
  } catch (error) {
    console.error("Error updating user document:", error);
  }
}

function Contacts({ actualUserId }) {
  const [contacts, setContacts] = useState([]);

  // Fetch user's contacts when the component mounts
  useEffect(() => {
    const fetchContactsUids = async () => {
      try {
        const userDocRef = doc(firestore, 'users', actualUserId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const contactUids = userData.contacts || [];

          // Fetch the contact data (name, photoURL) for each contact uid
          const contactsData = await Promise.all(
            contactUids.map(async (contactUid) => {
              const contactDocRef = doc(firestore, 'users', contactUid);
              const contactDoc = await getDoc(contactDocRef);
              if (contactDoc.exists()) {
                return { uid: contactUid, ...contactDoc.data() };
              } else {
                return null; // Return null if the contact doesn't exist
              }
            })
          );

          // Filter out any null contacts (in case a contact doesn't exist)
          setContacts(contactsData.filter(contact => contact !== null));
        }
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };

    if (actualUserId) {
      fetchContactsUids();
    }
  }, [actualUserId]);

  return (
    <div className="contact-list">
      {contacts.length > 0 ? (
        contacts.map((contact) => (
          <div key={contact.uid} className="contact">
            <img
              src={contact.photoURL || `${process.env.PUBLIC_URL}/avatars/default_avatar.png`}
              alt="User Avatar"
              onError={(e) => { e.target.src = `${process.env.PUBLIC_URL}/avatars/default_avatar.png`; }}
            />
            <p>{contact.name}</p>
          </div>
        ))
      ) : (
        <p>No contacts yet</p>
      )}
    </div>
  );
}

function FriendSearch({ currentUserUid }) {
  const [searchInput, setSearchInput] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  const [error, setError] = useState('');
  const [contacts, setContacts] = useState([]); // Track the user's contacts

  // Fetch user's contacts when the component mounts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const userDocRef = doc(firestore, 'users', currentUserUid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setContacts(userData.contacts || []); // Set contacts from the user document
        }
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };

    if (currentUserUid) {
      fetchContacts();
    }
  }, [currentUserUid]);

  const handleSearch = async (e) => {
    e.preventDefault();

    // Query Firestore for a user with the entered username or email
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('name', '==', searchInput));

    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          setFoundUser({ uid: doc.id, ...doc.data() });
        });
        setError('');
      } else {
        setFoundUser(null);
        setError('User not found.');
      }
    } catch (err) {
      console.error('Error finding user:', err);
      setError('An error occurred while searching for the user.');
    }
  };

  const handleAddFriend = async () => {
    if (foundUser) {
      const userContactsRef = doc(firestore, 'users', currentUserUid); // Reference to the current user's document
      try {
        // Update the contacts array by adding the friend's UID
        await updateDoc(userContactsRef, {
          contacts: arrayUnion(foundUser.uid) // Use arrayUnion directly from Firestore
        });
        setError(''); // Clear any existing error messages
        alert('Friend added successfully!'); // Notify user of success
      } catch (err) {
        console.error('Error adding friend:', err); // Log the error for debugging
        setError('Failed to add friend.'); // Set error message to state
      }
    } else {
      setError('No user found.'); // Handle case where no user was found
    }
  };

  const isUserAdded = foundUser && contacts.includes(foundUser.uid);

  return (
    <div>
      <form onSubmit={handleSearch}>
        <div>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Find a friend"
          />
          <button type="submit" disabled={!searchInput}>Search</button>
        </div>
      </form>

      {foundUser ? (
        <div className="found-user">
          <img
            src={foundUser.photoURL || `${process.env.PUBLIC_URL}/avatars/default_avatar.png`}
            alt={`${foundUser.name}'s avatar`}
            style={{marginRight:'10px', width: '40px', height: '40px', borderRadius: '50%' }} // Adjust styles as needed
          />
          {currentUserUid === foundUser.uid ? (
            <p style={{ fontWeight:'bold', color: 'red'}}>You</p>
          ) : isUserAdded ? (
            <p>{foundUser.name} <span style={{ fontWeight: 'bold', color: 'green' }}>(Added)</span></p>
          ) : (
            <>
              <p>{foundUser.name}</p>
              <button onClick={handleAddFriend}>Add Friend</button>
            </>
          )}
        </div>
      ) : (
        error && <p className="error">{error}</p>
      )}
    </div>
  );
}

function ChatRoom({setIsChangingProfile}) {
  const dummy = useRef();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State to toggle dropdown

  const messagesRef = collection(firestore, 'messages'); // Use Firestore collection reference
  const q = query(messagesRef, orderBy('createAt'), limit(25)); // Create query

  const [messages] = useCollectionData(q, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  // Get current user's uid
  const currentUserUid = auth.currentUser.uid; 

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

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // useEffect to log messages to the console whenever they change
  useEffect(() => {
    if (messages) {
      console.log('Current Messages:', messages);
    }
  }, [messages]); 


  return (<>
    <div className="messages-container">
      <div className="container">
        <div className="chats">
          <FriendSearch currentUserUid={currentUserUid} />

          <Contacts actualUserId={currentUserUid} />
        </div>
        <main>

          {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

          <span ref={dummy}></span>

        </main>
      </div>
     
      <div className="form-send">
        <form onSubmit={sendMessage}>
          <div className="div-input">
            <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />

            <button className="submit-btn" type="submit" disabled={!formValue}><i className="bi bi-send"></i> {/* Send Icon */}</button>
          </div>
        </form>
      </div>
      
    </div>
    

    {/* Dropdown for choosing profile image */}
    <div className="dropdown nav">
      <i className="bi bi-gear" onClick={toggleDropdown}></i> {/* Toggle dropdown */}
      {isDropdownOpen && (
        <div className="dropdown-content">
          <a href="#" onClick={() => setIsChangingProfile(true)}>Choose profile image</a>
        </div>
      )}
    </div>
  </>)
}

function ChatMessage(props) {
  const { text, uid } = props.message;

  // State to hold the user's photoURL and loading state
  const [photoURL, setPhotoURL] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPhotoURL = async () => {
      console.log('Fetching photo for UID:', uid); // Log the UID being fetched

      try {
        const userDocRef = doc(firestore, 'users', uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('User Data:', userData); // Log user data for debugging
          setPhotoURL(userData.photoURL); // Get the photoURL from the user's document
        } else {
          console.error('No such user document for UID:', uid); // Improved logging
        }
      } catch (error) {
        console.error('Error fetching user photo URL:', error);
      } finally {
        setLoading(false); // Set loading to false after the fetch
      }
    };

    fetchUserPhotoURL();
  }, [uid]); // Depend on uid so it fetches when uid changes

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      {loading ? ( // Show a loading indicator while fetching the photo
        <div className="loading">Loading...</div>
      ) : (
        <img
          src={photoURL || `${process.env.PUBLIC_URL}/avatars/default_avatar.png`}
          alt="User Avatar"
          onError={(e) => { 
            e.target.src = `${process.env.PUBLIC_URL}/avatars/default_avatar.png`; 
          }}
          style={{ width: '40px', height: '40px', borderRadius: '50%' }} // Adjust styles as needed
        />
      )}
      <p>{text}</p>
    </div>
  );
}

export default App;