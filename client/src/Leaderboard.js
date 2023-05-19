import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db, auth } from './firebase';
import Table from 'react-bootstrap/Table';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [userRank, setUserRank] = useState([null]);
  const [currentUser, setCurrentUser] = useState({});
  const partyKeyword = localStorage.getItem("partyKeyword");

  useEffect(() => {
    if (partyKeyword) {
      const usersRef = collection(db, "Parties", partyKeyword, "Users");
      const q = query(usersRef, orderBy("level", "desc"), orderBy("score", "desc"));


      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        let usersData = [];
        querySnapshot.forEach((doc) => {
          usersData.push(doc.data());
        });
        setUsers(usersData);

        // Calculate user rank
        const currentUserRank = usersData.findIndex(user => user.id === auth.currentUser.uid);
        setUserRank(currentUserRank + 1);

        const currentUserData = usersData.find(user => user.id === auth.currentUser.uid);
        if (currentUserData) {
          setCurrentUser(currentUserData);
        }
  
      });

      return () => {
        unsubscribe();
      };
    }
  }, [partyKeyword]);

  return (
    <div className="leaderboard-container mt-3">
      <h3>Leaderboard</h3>
      <Table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Level</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={index}>
              <td>{index+1}</td>
              <td>{user.displayName}</td>
              <td>{user.level}</td>
              <td>{user.score}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="absolute-bottom">
        <div className="row mt-2 ml-2">
          <p>Current Rank: </p>
          <div className="col-1">{userRank}</div>
          <div className="col-4 offset-1">{currentUser.displayName}</div>
          <div className="col-2 offset-1">{currentUser.level}</div>
          <div className="col-2">{currentUser.score}</div>
        </div>
      </div>
  </div>
  );
};

export default Leaderboard;
