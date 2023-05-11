import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

const History = ({ accessToken }) => {
  const [currentPlaylistId, setCurrentPlaylistId] = useState(null);

  useEffect(() => {
    const fetchPlaylistId = async () => {
      const partyKeyword = localStorage.getItem('partyKeyword');
      const docRef = doc(db, "Parties", partyKeyword);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setCurrentPlaylistId(docSnap.data().playlist);
      } else {
        console.log("No such document!");
      }
    };

    fetchPlaylistId();
  }, []);

  return (
    <div>
      {currentPlaylistId && (
        <iframe
          title="Spotify Playlist"
          className="mt-3"
          src={`https://open.spotify.com/embed/playlist/${currentPlaylistId}`}
          width="500"
          height="380"
          frameborder="0"
          allowtransparency="true"
          allow="encrypted-media"
        ></iframe>
      )}
    </div>
  );
};

export default History;


