# Agile Forecasting

Predict a team or subset of your team's ability to complete user stories by using historical data from Azure DevOps.

1. Predict the number of days with a confidence level for team members, 1, 2, 3, to complete N user stories.
2. Predict, with a confidence level, how many user stories can team members, 1, 2, etc., complete in N days.

## Contributing

### Required Software for Development

- [Docker](https://www.docker.com/products/docker-desktop)
- VS Code
- VS Code Extension: [Remote Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

### Running Locally

1. Open the repo's root in VS Code.
2. `Ctrl + Shift + P`, type and select `Remote Containers: Rebuild and Reopen in Container`
   > This will build the dev container and re-open VS Code with it. The dev container contains all the required software for local development.
3. In the VS Code terminal, run `yarn start` and navigate in your browser to [http://localhost:8080](http://localhost:8080).
