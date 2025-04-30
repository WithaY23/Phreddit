import {useState} from 'react';
import axios from 'axios';

import '../stylesheets/login_page.css';

export default function LoginPage(props) {
    const setView = props.setView;

    const [email_entered, setEmail] = useState("");
    const [password_entered, setPassword] = useState("");
    const [feedback, setFeedback] = useState("");
    const [currentUser, setCurrentUser] = useState(null);

    async function LoginPressed(){
        if(!email_entered || !password_entered){
            setFeedback("Email and Passowrd cannot be empty");
            return;
        }

        try{
            const response = await axios.post("http://127.0.0.1:8000/users/login", { //send user input to server for authen
                email: email_entered,  
                password: password_entered
            });
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
