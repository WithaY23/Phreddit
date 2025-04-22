//buttons: login, register, guest
import '../stylesheets/WelcomePage.css';
export default function WelcomePage(props)
{
    return(
        <>
        <h1 className="welcomepage-header">Welcome to Phreddit!</h1>
        <div className="welcomepage-button-container">
            <button className="welcomepage-buttons" id="login-button" onClick={() =>props.setView('Login-Page')}>Login</button> 
            <button className="welcomepage-buttons" id="register-button" onClick={() =>props.setView('Register-Page')}>Register</button> 
            <button className="welcomepage-buttons" id="guest-button" onClick={() =>props.setView('Home-Page')}>Guest</button>
        </div>
        </>
    )
}