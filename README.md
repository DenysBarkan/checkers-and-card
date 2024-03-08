# checkers-and-card

This repository includes two testing projects based on Playwright and TypeScript. 

## UI Testing Project
The UI testing project performs some simple UI tests. It includes a Page Object and a testing spec file. The behavior of the UI testing project involves a few UI steps with checks for changes and expected results.

## API Testing Project
The API testing project includes a few API calls and checks of the responses.

## Running the Projects Locally
To run these projects locally, you should have NodeJS (v18 and higher) installed.

Install the dependencies of the repository by executing the command `npm install` from the root of the repository.

To run the projects, execute the following commands:

For the UI testing project:
`npx playwright test --project=ui --headed`

For the API testing project:
`npx playwright test --project=api`
