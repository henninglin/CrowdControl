import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, orderBy, where } from 'firebase/firestore';
import { db } from './firebase';
import Table from 'react-bootstrap/Table';

const Queue = () => {
  const [songs, setSongs] = useState([]);
  const partyKeyword = localStorage.getItem("partyKeyword");

  useEffect(() => {
    if (partyKeyword) {
      const songsRef = collection(db, "Parties", partyKeyword, "searchedSongs");
      const q = query(songsRef, where("addedToPlaylist", "==", false), orderBy("priority", "desc"), orderBy("timestamp", "asc"));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        let songsData = [];
        querySnapshot.forEach((doc) => {
          songsData.push(doc.data());
        });
        setSongs(songsData);
      });

      return () => {
        unsubscribe();
      };
    }
  }, [partyKeyword]);

  return (
    <div className="leaderboard-container mt-3">
      <h3>Current Queue</h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Track</th>
            <th>Artist</th>
            <th>Priority</th>
          </tr>
        </thead>
        <tbody>
          {songs.map((song, index) => (
            <tr key={index}>
              <td>{song.name}</td>
              <td>{song.artist}</td>
              <td>{song.priority}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default Queue;
