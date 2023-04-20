import React from "react"
import { useState, useEffect } from 'react'
import { GoogleButton } from 'react-google-button'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import "./App.css"
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { addDoc, setDoc, collection, getDocs, doc } from 'firebase/firestore';
import { auth, db } from './firebase';

const AUTH_URL =
  "https://accounts.spotify.com/authorize?client_id=df5386eb382b4286a239d80f6b301967&response_type=code&redirect_uri=http://localhost:3000&scope=streaming%20user-read-email%20user-read-private%20user-library-read%20user-library-modify%20user-read-playback-state%20user-modify-playback-state"

export default function Login() {

  const [user, setUser] = useState(null);
  const [showButton, setShowButton] = useState(false);
  const [showSession, setShowSession] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [partyName, setPartyName] = useState("");
  const [partyDate, setDate] = useState('');
  const [partyKeyword, setPartyKeyword] = useState('');

  //Adds User to Party
  async function addUserToParty(){
    const userRef = collection(db, "Parties", partyKeyword, "Users");
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
      return true;
    }

    try {
      const docRef = await addDoc(userRef,{
        level: 0,
        score: 0,
        displayName: user.displayName
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e){
      console.error("Error adding document ", e);
    }
    return true;
  }

  //Create Firebase Party
  async function createParty(){
    const docRef = await doc(db, "Parties", partyKeyword);

    const data = {
      name: partyName,
      date: partyDate
    };
    setDoc(docRef, data).then(() => {
      console.log("Party has been created successfully");
      addUserToParty(docRef);
    })
    .catch(error => {
      console.log("Error creating party", error);
    })

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

  //handle google logout
  const handleLogout = async () => {
    await signOut(auth);
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

  // Fake it spotify button
  useEffect(() =>{
    function handleKeyDown(event){
      if(event.key === "Escape"){
        setShowButton(true);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };

  }, []);

  return (
    <section className="h-100 gradient-form first">
      <div className="container py-5 h-100 login">
      <h1 className="display-1 d-flex user-select-none">Musicify</h1>
      {showButton && (
      <a className="btn btn-success btn-lg" href={AUTH_URL}>
        Login using Spotify
      </a>
      )}
      <div className="music">
        <span className="stroke"></span>
        <span className="stroke"></span>
        <span className="stroke"></span>
        <span className="stroke"></span>
        <span className="stroke"></span>
        <span className="stroke"></span>
        <span className="stroke"></span>
      </div>
      {!showSession && (
      <div className="m-5">
        <GoogleButton onClick={handleGoogle}/>
      </div>
      )}
      {showSession && (
        <div>
          <h5 className="mt-2 mb-2">
            Welcome, {user.displayName || user.email}!
          </h5>
          <div className="input-group mb-3">
          <input type="text" className="form-control" placeholder="Party Keyword" aria-label="Party Keyword" aria-describedby="basic-addon2"/>
            <div className="input-group-append">
              <button className="btn btn-success" type="button">Join</button>
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
              <Form.Control type="text" placeholder="SOFAPARTY23" onChange={(event) => setPartyKeyword(event.target.value)}/>
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
