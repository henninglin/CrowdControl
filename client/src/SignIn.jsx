import React, { useState } from 'react';
import { auth } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

const SignIn = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const LoginHandler = (e) => {
        e.preventDefault();
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log(userCredential)
        }).err((error) => {
            console.log(error)
        });
    }

    return (
    <div className="sign-in-container">
        <form onSubmit={LoginHandler}>
            <h6>Login Account</h6>
            <input type="email" 
            placeholder='Enter your email' 
                value={email}
                onChange={(e) => setEmail(e.target.value)}>
            </input>
            <input type="password"
            placeholder='Enter your password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}>
            </input>
            <button type="submit" Log In></button>
        </form>
    </div>
  );
};

export default SignIn;
