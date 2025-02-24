var noticeId = 0;
function createNotice(type, message, dismissable = true, dismissText = "Dismiss", otherButton = null, otherButtonAction = "") {
    /* Create a new notice.
    - type: the type of notice to create, one of the CSS notice classes
    - message: the text to include in the notice
    - dismissable: whether the notice can be dismissed by the user
    - dismissText: the text for the dismiss button
    - otherButton: the text to include for another button (unless set to null)
    - otherButtonAction: onclick attribute for the button (ignored if otherButton === null)
    */
    const thisNotice = `script-notice-${noticeId}`;
    const noticeBox = document.createElement("div");
    const noticeText = document.createTextNode(message);
    const noticeP = document.createElement("p");
    noticeP.appendChild(noticeText);
    noticeBox.setAttribute("class", type);
    noticeBox.setAttribute("id", thisNotice);
    noticeBox.appendChild(noticeP);
    if (dismissable) {
        const dismissButton = document.createElement("button");
        const dismissButtonText = document.createTextNode(dismissText);
        dismissButton.appendChild(dismissButtonText);
        dismissButton.setAttribute("onclick", `dismissNotice("${thisNotice}")`);
        noticeBox.appendChild(dismissButton);
    }
    if (otherButton !== null) {
        const customButton = document.createElement("button");
        const customButtonText = document.createTextNode(otherButton);
        customButton.appendChild(customButtonText);
        customButton.setAttribute("onclick", otherButtonAction);
        noticeBox.appendChild(customButton);
    }
    document.getElementById("notices").appendChild(noticeBox);
    noticeId++;
}
function dismissNotice(notice) {
    document.getElementById(notice).setAttribute("hidden", "");
}