# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0]

### Added

- **Forecast how many work items can be completed in a given time frame**.
- Query and pull work items directly from ADO. Provide the ADO URL, an access token, and an Wiql query.
- UI to customize forecasting to a subset of people. List of available people are pulled from the data. This allows arbitrary groupings of team members when forecasting.
- Store ADO URL, access token, and default query in .env file on every querying of work items. This enables re-using the tool with the same values easily.
