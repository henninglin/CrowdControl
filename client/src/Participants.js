import React, { useState, useEffect} from "react";
import { db } from "./firebase";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";



const ParticipantsList = () => {
  const [participants, setParticipants] = useState([]);
  const [currentParty, setCurrentParty] = useState({});
  const [partyKeyword, setPartyKeyword] = useState("");
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const storedPartyKeyword = localStorage.getItem("partyKeyword");
    console.log("LocalStorage get: ", storedPartyKeyword);
    if (storedPartyKeyword) {
      setPartyKeyword(storedPartyKeyword);
    }
  }, []);


  useEffect(() => {
    if (!partyKeyword){
      setLoading(false);
      return
     }

    const partyRef = collection(db, "Parties", partyKeyword, "Users");
    const unsubscribe = onSnapshot(partyRef, (querySnapshot) => {
      const fetchedParticipants = [];
      querySnapshot.forEach((doc) => {
        const participantData = doc.data();
        fetchedParticipants.push({
          name: participantData.displayName,
        });
      });
      setParticipants(fetchedParticipants);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [partyKeyword]);

  useEffect(() => {
    if(!partyKeyword){
      return;
    }
    const fetchPartyData = async () => {
      const docRef = doc(db, "Parties", partyKeyword);
      const docSnapshot = await getDoc(docRef);
      if (docSnapshot.exists()) {
        setCurrentParty(docSnapshot.data());
      } else {
        console.log("No such document!");
      }
    };

    fetchPartyData();
  }, [partyKeyword]);
  
  return loading ? (
  <div>Loading ...</div>
  ):(
    <div>
      <h5 className="mb-3 mt-3"> {currentParty.name}</h5>
      <p className="mb-3 mt-3">Keyword: {partyKeyword}</p>
      <p>{currentParty.Date}</p>
      <h5 className="mb-2">Participants:</h5>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {participants.map((participant, index) => (
          <li key={index}>{participant.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default ParticipantsList;
