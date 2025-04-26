import React from 'react';
import '../stylesheets/login_page.css';

export default function LoginPage(props) {
    const setView = props.setView;
    return (
        <div className="login-page">
            <div className="login-container">
                <h1>Phreddit Login</h1>
                <form className="login-form">
                    <label htmlFor="login-email">Email Address</label>
                    <input type="email" id="login-email" placeholder='Enter your email'></input>

                    <label htmlFor="login-password">Password</label>
                    <input type="password" id="login-password" placeholder='Enter your password'></input>

                    <button type="button" onClick={() => setView("Welcome-Page")}>Login</button>
                </form>
            </div>
        </div>
    );
}
