//buttons: login, register, guest
import '../stylesheets/WelcomePage.css';
export default function WelcomePage()
{
    return(
        <>
        <h1 className="welcomepage-header">Welcome to Phreddit!</h1>
        <div className="welcomepage-button-container">
            <button className="welcomepage-buttons" id="login-button">Login</button> 
            <button className="welcomepage-buttons" id="register-button">Register</button> 
            <button className="welcomepage-buttons" id="guest-button" onClick={'a'}>Guest</button>
        </div>
        </>
    )
}