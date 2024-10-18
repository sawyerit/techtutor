# Tech Tutor Chrome Extension

This chrome extension was designed to ease the burden of understanding tech terminology, see what skills are assocaited with jobs, and find the information about tech you need to help make informed decisions.  

* This project was forked and gutted from a react based chrome extension, for now it still uses create-react-app and requires an index.js file. I've left that in to possibly extend the project in the future, or convert the UI parts of the project to react.

## Features
- Highlights all known (to us) tech terms on the page
- Displays the definition of a tehcnical skill upon hovering the highlighted term
- Shows the title definition when highlighting text within the page


## Usage
Install the chrome extension (currently dev mode only), then navigate to a page with tech terms.  When clicking the extension, it will highlight the terms and display the definition when hovering over the term.

## Developing / Contributing 

#### To get started
- Clone the repository into a new directory
- Run `npm install`

Most of the logic resides in the content and background scripts for the chrome extension.  The content script is responsible for the UI and the background script is responsible for the API calls.

The project uses create-react-app with craco to manage the webpack configuration.  The webpack configuration is located in the `craco.config.js` file.

#### Testing

*Test Mode:* There is a debug setting on the UserProfile component that will disable all API calls and force the output to write to the console. This is useful for testing the UI without affecting the backend or database.  Test mode is stored in the browser session.

### Future State

See [todos](docs/todo.md) for more details


### Known Issues

### Todo list
- TBD: Skills related to a job title, similar job titles