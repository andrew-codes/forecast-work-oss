# Contributing Guide

## Picking an Issue

Features are tracked via [GitHub Issues](https://github.com/andrew-codes/forecast-work/issues). Feel free to pick any up that are not already assigned. If you aren't sure were to start, try looking at issues labeled as a "[good first issue](https://github.com/andrew-codes/forecast-work/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22+)".

## Required Software for Development

- VS Code
- Node.JS@^16.0.0
- Yarn@^1.0.0

## Getting Started with Local Development

1. Pull code to local machine
2. Run `yarn` in repo root to install dependencies
3. Running `yarn start` will build and open the application for development.
   - Changes made will automatically reload the application. There is no need to stop and re-run `yarn start` for every change.

## Running Tests

### Unit Tests

> Note there are currently no unit tests.

Unit tests will be written with Jest. To run all tests, run `yarn test/unit`.

### UI/E2E Tests

> Note there are currently none of these types of tests.

These will be written using Cypress. To run these for local development, run `yarn test/e2e`.

## Linting

> Currently there are not lint rules in place.

`yarn lint` is run for all PRs and must pass before a PR will be merged.

## Submitting Pull Requests

When submitting a pull request for review, please ensure the following checklist has been verified.

- You do not need to describe the issue, but please associate the PR with the appropriate issue. Reviewers can look to the issue for details on the problem domain.
  - Please include any related or issues that will be closed by the pull request in the PR description as the last items; e.g., "Closes #20"
- Please include a summary of your changes. This includes highlighting challenges and decisions/trade-offs that were encountered/made to complete the work.
- Please ensure adaquete unit and/or E2E tests are written and included in the pull request.
