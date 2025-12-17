---
agent: agent
---
I want to create a privacy quiz as a web app where a user can answer some questions 
and then get a dashboard about their digital life. 

This app will help users to improve their privacy.

The questions could be about their App Usage like: "What Browser are you using?" (Mobile/Desktop) 
or "What Email Provider are you using?"

and about their Threat Model like: 
"Do you want to be protected against Online Fingerprinting/Surveillance Capitalism? etc. 

Then after the quiz the user gets a personalized Threat Model,
and based on what apps they are using, 
they get a Privacy Score and the most Important Reccomendations to improve their privacy 
based on their threat model.

On the dashboard the user can what apps they are using and 
get Reccomendations in each App Category for more privacy.
And then the user can decide what apps they want to switch to.


I already made a paper prototype and now want to code this. 
I have some experience in Vue, Pinia and Typescript. 
And I have seen that https://www.privacyguides.org/ has a lot of Reccomendations in Markdown 
format that I can use. They are just using html and Material for MkDocs.
Now i am unsure what to use for my Quiz and dashboard.

I want this app to be as secure as possible with everything encrypted,
a no log policy and everything opensource. 
Trust is key. And the app should not collect or leak any data the user inputs.
The user should stay anonymous. And he should not have to create an account.

Instead all the data can be accessed only on the client side with a password the user creates.
The user can save his data in an encrypted file on his device.

I do not want that the user has to send me his inputs to my server as I dont need it.
I want that everything is done on the client side with SSG.

The app should be easy to host for free on GitHub Pages.
And it should be as simple as possible to lower the attack surface.
