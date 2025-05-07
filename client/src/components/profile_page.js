import "../stylesheets/profile_page.css"
//1.user must be logged in
//2.user clicked on the profile button

export default function ProfilePage(props){
    const view = props.view;
    const setView = props.setView;
    const user = props.currentUser;

    return (
        <div className="profile-container">
            <h1>User Profile</h1>
            <div className="profile-info">
                <div className="row">
                    <span className="label">Username: </span><span className="value">{user.displayName}</span>
                </div>
                <div className="row">
                    <span className="label">Email:</span><span className="value">{user.email}</span>
                </div>
                <div className="row">
                    <span className="label">Reputation:</span><span className="value">100</span>
                </div>
            </div>
        </div>
    )
}