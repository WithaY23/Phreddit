export default function ErrorPage(props)
{
    return(
        <>
        <h1>Error Page:</h1>
        <p>{props.page.message}</p>
        <p>Click the button below to return to the welcome page</p>
        <button onClick={() =>props.setView("Welcome Page")}>Return to the Welcome Page</button>
        </>
    )
}