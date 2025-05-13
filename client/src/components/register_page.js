import {useState, useEffect} from 'react';
import axios from 'axios';

import '../stylesheets/login_page.css';

export default function RegisterPage(props) {
    const setView = props.setView;
    const setPage = props.setPage;

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [feedback, setFeedback] = useState("");

    async function register(){
        if(!firstName || !lastName || !email || !displayName || !password || !confirmPassword){
            setFeedback("all fields are required.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            setFeedback("please enter a valid email address.");
            return;
        }

        const emailLocalPart = email.split("@")[0].toLowerCase();  //get infront of @
        const first = firstName.toLowerCase();
        const last = lastName.toLowerCase();
        const display = displayName.toLowerCase();

        if( //check all of them first last and displayName
            emailLocalPart.includes(first) ||
            emailLocalPart.includes(last) ||
            emailLocalPart.includes(display)
        ){
            setFeedback("email cannot contain first name, last name, or display name.");
            return;
        }

        if(password !== confirmPassword){
            setFeedback("passwords do not match.");
            return;
        }

        try{
            const response = await axios.post("http://localhost:8000/users/register", {
                firstName,
                lastName,
                email,
                displayName,
                password
            }, {withCredentials: true});

            console.log("Registration successful:", response.data);
            setView("Welcome-Page");
            window.alert("Registered Success");
        }
        catch(err){
            setView("Error-Page");
            setPage(err)     //Error page
        }
    }

    return (
        <div className="login-page">
            <div className="login-container">
                <h1>Phreddit Register</h1>
                {feedback && <p style={{ color:'red'}}>{feedback}</p>}

                <form className="login-form">
                    <label>First Name</label>
                    <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}/>

                    <label>Last Name</label>
                    <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}/>

                    <label>Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}/>

                    <label>Display Name</label>
                    <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}/>

                    <label>Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)}/>

                    <label>Confirm Password</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}/>

                    <button type="button" onClick={register}>Sign Up</button>
                </form>
            </div>
        </div>
    );
}