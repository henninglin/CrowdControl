import React from "react";
import { useState, useEffect } from 'react'
import { GoogleButton } from 'react-google-button'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import "./App.css"
import { GoogleAuthProvider, signInWithPopup, signOut, signInAnonymously, updateProfile } from 'firebase/auth';
import { addDoc, setDoc, collection, getDoc, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const AUTH_URL = "https://accounts.spotify.com/authorize?client_id=df5386eb382b4286a239d80f6b301967&response_type=code&redirect_uri=http://localhost:3000&scope=streaming%20user-read-email%20user-read-private%20user-library-read%20user-library-modify%20user-read-playback-state%20user-modify-playback-state%20playlist-modify-public%20playlist-modify-private";

export default function Login() {

  const [user, setUser] = useState(null);
  const [showButton, setShowButton] = useState(false);
  const [showSession, setShowSession] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [partyName, setPartyName] = useState("");
  const [partyDate, setDate] = useState('');
  const [partyKeyword, setPartyKeyword] = useState('');

  //Adds User to Party
  async function addUserToParty(input){
    setShowButton(true);
    const userRef = collection(db, "Parties", input, "Users");
    const user = auth.currentUser;
  
    const docSnap = await getDocs(userRef);
    var isInPartyAlready = false;

    docSnap.forEach((e) => {
      if(e.data().id === user.uid){
        isInPartyAlready = true;
        return;
      }
    })

    if(isInPartyAlready === true){
      alert("User is in party already")
      localStorage.setItem("partyKeyword", input);
      console.log("LocalStorage set: ", localStorage.getItem("partyKeyword"));
      return true;
    }

    try {
      const docRef = await addDoc(userRef,{
        id: user.uid,
        level: 1,
        score: 0,
        displayName: user.displayName
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e){
      console.error("Error adding document ", e);
    }
    localStorage.setItem("partyKeyword", input);
    console.log("LocalStorage set: ", localStorage.getItem("partyKeyword"));
    return true;
  }

  async function joinParty(){
    const input = document.getElementById("join").value;
    console.log("Trying to Join Party", input);
    const docRef = doc(db, "Parties", input);
    try {
      const docSnap = await getDoc(docRef);
      if(docSnap.exists()) {
          console.log(docSnap.data());
          console.log("Party exist");
          addUserToParty(input);


      } else {
          alert("Party does not exist");
      }
     } catch(error) {
      console.log(error)
     }
  }

  //Create Firebase Party
  async function createParty() {
    const docRef = doc(db, "Parties", partyKeyword);
  
    try {
      const docSnapshot = await getDoc(docRef);
  
      if (docSnapshot.exists()) {
        alert("Party already exists");
      } else {
        const data = {
          PartyName: partyName,
          Date: partyDate,
        };
  
        await setDoc(docRef, data);
        console.log("Party has been created successfully");
        addUserToParty(partyKeyword);
      }
    } catch (error) {
      console.log("Error creating party", error);
    }
  
    handleClose();
  }

  // handle close and show modal
  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  //handle Google popup
  const handleGoogle = async (e) => {
    const provider = await new GoogleAuthProvider();
    return signInWithPopup(auth, provider); 
  }

    // Remove User from Party
    async function removeUserFromParty(partyKeyword) {
      const userRef = collection(db, "Parties", partyKeyword, "Users");
      const user = auth.currentUser;
  
      const docSnap = await getDocs(userRef);
      let userDocId = null;
  
      docSnap.forEach((e) => {
        if (e.data().id === user.uid) {
          userDocId = e.id;
          return;
        }
      });
  
      if (userDocId) {
        try {
          await deleteDoc(doc(userRef, userDocId));
          console.log("User removed from the party");
        } catch (e) {
          console.error("Error removing user from the party: ", e);
        }
      } else {
        console.log("User not found in the party");
      }
  
      // Remove partyKeyword from localStorage
      localStorage.removeItem("partyKeyword");
    }
  

  // handle google logout
  const handleLogout = async () => {
    const currentPartyKeyword = localStorage.getItem("partyKeyword");
    if (currentPartyKeyword) {
      await removeUserFromParty(currentPartyKeyword);
    }
    await signOut(auth);
  };


  const handleAnon = async () => {
    try {
      const { user } = await signInAnonymously(auth);
      const randomId = Math.floor(1000 + Math.random() * 9000);
      const displayName = `Guest${randomId}`;
      await updateProfile(user, { displayName: displayName });
      console.log("Logged in anonymously", displayName);
    } catch (error) {
      console.error(error);
    }
  }
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        setShowSession(true);
      } else {
        setUser(null);
        setShowSession(false);
      }
    });

    return unsubscribe;
  }, []);

   return (
    <section className="h-100 gradient-form first">
      <div className="container py-5 h-100 login">
      <h1 className="display-1 d-flex user-select-none">Musicify</h1>
      <div className="music">
        <span className="stroke"></span>
        <span className="stroke"></span>
        <span className="stroke"></span>
        <span className="stroke"></span>
        <span className="stroke"></span>
        <span className="stroke"></span>
        <span className="stroke"></span>
      </div>
      {showButton && (
      <a className="btn btn-success mt-3 mb-3" href={AUTH_URL}>
        Login using Spotify
      </a>
      )}
      {!showSession && (
      <div className="m-5">
        <GoogleButton onClick={handleGoogle}/>
        <Button variant="secondary" className="mt-2" onClick = {handleAnon}> Anonymous Login</Button>
      </div>
      )}
      {showSession && (
        <div>
          <h5 className="mt-2 mb-2">
            Welcome, {user.displayName || user.email}!
          </h5>
          <div className="input-group mb-3">
          <input type="text" className="form-control" id="join" placeholder="Party Keyword" aria-label="Party Keyword" aria-describedby="basic-addon2"/>
            <div className="input-group-append">
              <button className="btn btn-success" type="button" onClick={joinParty}>Join</button>
            </div>
          </div>
          <Button variant="primary" onClick={handleShow} style={{ marginRight: "10px" }}>
            Create Party
          </Button>
          <button type="button" className="btn btn-secondary" onClick={handleLogout}>
            Log Out
          </button>

        <Modal show={showModal} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Create Music Party</Modal.Title>
          </Modal.Header>
        <Modal.Body>
          <Form>
          <Form.Group className="mb-3" controlId="partyName">
              <Form.Label>Enter Party Name</Form.Label>
              <Form.Control type="text" placeholder="SOFA Party" autoFocus onChange={(event) => setPartyName(event.target.value)}/>
          </Form.Group>
          <Form.Group className="mb-3" controlId="partyDate">
              <Form.Label>Enter Date</Form.Label>
              <Form.Control type="date" onChange={(event) => setDate(event.target.value)}/>
          </Form.Group>
          <Form.Group className="mb-3" controlId="partyKeyword">
              <Form.Label>Set Party Keyword</Form.Label>
              <Form.Control type="text" placeholder="SOFAPARTY23" onChange={(event) => (setPartyKeyword(event.target.value))}/>
          </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
        <Button variant="primary" onClick={createParty}>
            Create Party
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          </Modal.Footer>
        </Modal>
        </div>
      )}
    </div>
    </section>
  )
}

