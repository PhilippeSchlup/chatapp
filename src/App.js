import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { initializeApp } from 'firebase/app';
import { getAuth, updateProfile, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'; // Import auth functions
import { getFirestore, where, collection, arrayUnion, arrayRemove, query, orderBy, limit, doc, updateDoc, setDoc, getDoc, addDoc, writeBatch, getDocs, serverTimestamp } from 'firebase/firestore'; // Import Firestore functions
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

  const saveUserToFirestore = async (user) => {
    try {
      const userRef = doc(firestore, 'users', user.uid);
  
      // Set user data, including the lowercase 'nameLowerCase' field
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        name: name,  // Save the original name
        nameLowerCase: name.toLowerCase(),  // Save the lowercase version of the name for case-insensitive search
        photoURL: user.photoURL || `${process.env.PUBLIC_URL}/avatars/default_avatar.png`,  // Default avatar
        contacts: [],
        friendRequests: [],
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

function Contacts({ actualUserId, onContactClick }) {
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
          <div onClick={() => onContactClick(contact.uid)} key={contact.uid} className="contact">
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
  const [foundUsers, setFoundUsers] = useState([]); // Allow multiple results
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

    if (!searchInput) return;

    const usersRef = collection(firestore, 'users');
    const normalizedSearchInput = searchInput.toLowerCase(); // Normalize the input

    // Use Firestore's startAt and endAt for partial matching
    const q = query(
      usersRef,
      where('nameLowerCase', '>=', normalizedSearchInput),  // nameLowerCase should exist in Firestore
      where('nameLowerCase', '<=', normalizedSearchInput + '\uf8ff') // End at the closest possible match
    );

    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const users = [];
        querySnapshot.forEach((doc) => {
          users.push({ uid: doc.id, ...doc.data() });
        });
        setFoundUsers(users);
        setError('');
      } else {
        setFoundUsers([]);
        setError('No users found.');
      }
    } catch (err) {
      console.error('Error finding user:', err);
      setError('An error occurred while searching for the user.');
    }
  };

  const handleAddFriend = async (user) => {
    if (user) {
      const recipientRef = doc(firestore, 'users', user.uid); // Reference to the recipient user's document
      try {
        // Update the recipient's document by adding the current user's UID to friendRequests
        await updateDoc(recipientRef, {
          friendRequests: arrayUnion(currentUserUid) // Add current user's UID to friend requests
        });
        setError(''); // Clear any existing error messages
        alert('Friend request sent successfully!'); // Notify user of success
      } catch (err) {
        console.error('Error sending friend request:', err); // Log the error for debugging
        setError('Failed to send friend request.'); // Set error message to state
      }
    }
  };
  

  const isUserAdded = (userUid) => contacts.includes(userUid); // Check if the user is already in contacts

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

      {foundUsers.length > 0 ? (
        foundUsers.map((user) => (
          <div className="found-user" key={user.uid}>
            <img
              src={user.photoURL || `${process.env.PUBLIC_URL}/avatars/default_avatar.png`}
              alt={`${user.name}'s avatar`}
              style={{marginRight:'10px', width: '40px', height: '40px', borderRadius: '50%' }} // Adjust styles as needed
            />
            {currentUserUid === user.uid ? (
              <p style={{ fontWeight:'bold', color: 'red'}}>You</p>
            ) : isUserAdded(user.uid) ? (
              <p>{user.name} <span style={{ fontWeight: 'bold', color: 'green' }}>(Added)</span></p>
            ) : (
              <>
                <p>{user.name}</p>
                <button onClick={() => handleAddFriend(user)}>Add Friend</button>
              </>
            )}
          </div>
        ))
      ) : (
        error && <p className="error">{error}</p>
      )}
    </div>
  );
}

const FriendRequests = ({ currentUserUid }) => {
  const [friendRequests, setFriendRequests] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFriendRequests = async () => {
      const userDocRef = doc(firestore, 'users', currentUserUid);
      const userDoc = await getDoc(userDocRef);
  
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const requestUids = userData.friendRequests || [];
        
        if (requestUids.length > 0) {
          // Fetch users in batch using a query with "where" clause
          const usersQuery = query(collection(firestore, 'users'), where('uid', 'in', requestUids));
          const querySnapshot = await getDocs(usersQuery);
          
          const requestDetails = querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
          console.log("Requests ", requestDetails);
          setFriendRequests(requestDetails); // Set friend requests with user details
        }
      }
    };
  
    fetchFriendRequests();
  }, [currentUserUid]);
  
  // Handle accept and reject updates
  const handleAcceptRequest = async (requestUid) => {
    const userRef = doc(firestore, 'users', currentUserUid);
    const requesterRef = doc(firestore, 'users', requestUid);
  
    try {
      await updateDoc(userRef, {
        contacts: arrayUnion(requestUid),
        friendRequests: arrayRemove(requestUid)
      });
  
      await updateDoc(requesterRef, {
        contacts: arrayUnion(currentUserUid)
      });
  
      setFriendRequests((prev) => prev.filter((request) => request.uid !== requestUid));
      alert('Friend request accepted!');
    } catch (err) {
      console.error('Error accepting friend request:', err);
      setError('Failed to accept the friend request.');
    }
  };
  

  // Handle rejecting a friend request
  const handleRejectRequest = async (requestUid) => {
    const userRef = doc(firestore, 'users', currentUserUid);

    try {
      // Remove the request from friendRequests
      await updateDoc(userRef, {
        friendRequests: arrayRemove(requestUid)
      });

      // Update the UI by removing the rejected request
      setFriendRequests((prev) => prev.filter((uid) => uid !== requestUid));
      alert('Friend request rejected.');
    } catch (err) {
      console.error('Error rejecting friend request:', err);
      setError('Failed to reject the friend request.');
    }
  };

  return (
    <div className="friend-requests">
      <h3>Friend Requests</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {friendRequests.length > 0 ? (
        friendRequests.map((request) => (
          <div key={request.uid} className="friend-request">
            <p>{request.name || 'Unknown User'}</p> {/* Display the user's name */}
            <button onClick={() => handleAcceptRequest(request.uid)}>Accept</button>
            <button onClick={() => handleRejectRequest(request.uid)}>Reject</button>
          </div>
        ))
      ) : (
        <p>No pending requests</p>
      )}
    </div>
  );
};

function ChatRoom({ setIsChangingProfile }) {
  const dummy = useRef();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedContactUid, setSelectedContactUid] = useState(null);
  
  // Use separate references for global and private messages
  const globalMessagesRef = collection(firestore, 'globalMessages');
  const privateMessagesRef = collection(firestore, 'privateMessages');
  
  const q = query(globalMessagesRef, orderBy('createAt'), limit(25)); // Query for global messages
  const [globalMessages] = useCollectionData(q, { idField: 'id' });
  
  const [formValue, setFormValue] = useState('');
  const currentUserUid = auth.currentUser.uid; 

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser; // Get current user

    if (!selectedContactUid) {
      // Send to global chat
      await addDoc(globalMessagesRef, {
        text: formValue,
        createAt: serverTimestamp(),
        uid,
        photoURL
      });
    } else {
      // Send to private chat
      await addDoc(privateMessagesRef, {
        text: formValue,
        createAt: serverTimestamp(),
        uid,
        photoURL,
        contactUid: selectedContactUid // Include the selected contact's UID
      });
    }

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Filter private messages
  const privateMessagesQuery = query(privateMessagesRef, orderBy('createAt'), limit(25));
  const [privateMessages] = useCollectionData(privateMessagesQuery, { idField: 'id' });
  
  const filteredPrivateMessages = privateMessages?.filter(msg => 
    msg.uid === currentUserUid && msg.contactUid === selectedContactUid || 
    msg.uid === selectedContactUid && msg.contactUid === currentUserUid
  ) || [];

  // Function to switch to global chat
  const handleGlobalChatClick = () => {
    setSelectedContactUid(null); // Set to null to show global messages
  };

  return (
    <>
    <button 
            className="global-chat-btn"
            onClick={handleGlobalChatClick}
          >
            Global Chat
          </button>
      <div className="messages-container">
        <div className="container">
          <div className="chats">
            <FriendSearch currentUserUid={currentUserUid} />
            <Contacts actualUserId={currentUserUid} onContactClick={setSelectedContactUid} />
          </div>
          <div className="chat-area">
            <main>
              
              {selectedContactUid 
                ? filteredPrivateMessages.map(msg => (
                  <ChatMessage key={msg.id} message={msg} />
                )) 
                : globalMessages?.map(msg => (
                  <ChatMessage key={msg.id} message={msg} />
                ))
              }
              <span ref={dummy}></span>
            </main>
            <div className="form-send">
              <form onSubmit={sendMessage}>
                <div className="div-input">
                  <input
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    placeholder="Say something nice"
                  />
                  <button className="submit-btn" type="submit" disabled={!formValue}>
                    <i className="bi bi-send"></i>
                  </button>
                </div>
              </form>
            </div>
           
          </div>
        </div>
      </div>
      
      <div className="dropdown nav">
        <i className="bi bi-gear" onClick={toggleDropdown}></i> {/* Toggle dropdown */}
        {isDropdownOpen && (
          <div className="dropdown-content">
            <a href="#" onClick={() => setIsChangingProfile(true)}>Choose profile image</a>
            <FriendRequests currentUserUid={currentUserUid} />
          </div>
        )}
         
         
      </div>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid } = props.message;

  // State to hold the user's photoURL and loading state
  const [photoURL, setPhotoURL] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPhotoURL = async () => {
      try {
        const userDocRef = doc(firestore, 'users', uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
           // Log user data for debugging
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