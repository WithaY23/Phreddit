import {useState, useEffect} from 'react';
import axios from 'axios';

import '../stylesheets/login_page.css';

export default function LoginPage(props) {
    const setView = props.setView;
    const setCurrentUser = props.setCurrentUser;

    const [email_entered, setEmail] = useState("");
    const [password_entered, setPassword] = useState("");
    const [feedback, setFeedback] = useState("");
    

    //check for any session when page loads
    useEffect(() => {
        axios.get("http://localhost:8000/users/session", {withCredentials: true})  //sends the session cookie
        .then(res =>{
            console.log("Session found:", res.data);
            setCurrentUser(res.data);
            console.log("email", res.data.displayName);
            setView("Home-Page");
        })
        .catch(() => {
            console.log("no session found");
        });
    },[setCurrentUser, setView]); //run once on start

    async function LoginPressed(){
        if(!email_entered || !password_entered){
            setFeedback("Email and Passowrd cannot be empty");
            return;
        }

        try{
            const response = await axios.post("http://localhost:8000/users/login", { //send user input to server for authen
                email: email_entered,  
                password: password_entered
            }, {withCredentials:true});

            console.log("Login successful", response.data);
            setCurrentUser(response.data);
            setView("Home-Page");
        }
        catch(error){
            if(error.response){
                setFeedback(error.response.data.error);
            }
            else{
                setFeedback("server error");
            }
        }
    }

    return (
        <div className="login-page">
            <div className="login-container">
                <h1>Phreddit Login</h1>

                {feedback && (
                    <p style={{color: 'red'}}> {feedback}</p>
                )}

                <form className="login-form">
                    <label htmlFor="login-email">Email Address</label>
                    <input type="email" id="login-email" placeholder='Enter your email'
                        value={email_entered} onChange={(e) => setEmail(e.target.value)}></input>

                    <label htmlFor="login-password">Password</label>
                    <input type="password" id="login-password" placeholder='Enter your password'
                        value={password_entered} onChange={(e) => setPassword(e.target.value)}></input>

                    <button type="button" onClick={() => LoginPressed()}>Login</button>
                </form>
            </div>
        </div>
    );
}
