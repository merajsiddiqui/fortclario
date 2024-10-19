# Fortclario

Fortclario is a scaffolding and pattern-based framework built on top of Fastify and TypeScript. Designed for developers who prioritize strong type safety and maintainability, Fortclario enables you to write heavily static typed code akin to Java, ensuring that your applications are fully testable and easy to maintain.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Using Contracts](#using-contracts)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Type Safety**: Leverage TypeScript's static typing to catch errors early in the development process.
- **Fastify Integration**: Utilize the high-performance capabilities of the Fastify framework.
- **Contracts**: Define contracts to ensure any changes in the codebase do not break existing functionality.
- **Modular Design**: Easily organize your application into reusable components and modules.
- **Highly Testable**: Built with testability in mind, making it easy to write and run unit and integration tests.

## Getting Started

To get started with Fortclario, follow these steps:

1. Clone the repository:

```bash
   git clone https://github.com/merajsiddiqui/fortclario.git
   cd fortclario
```

```bash
yarn install
```


## Testing

Testing is a critical aspect of application development in Fortclario. You are encouraged to write a comprehensive set of tests for your application, covering various types of testing to ensure quality and reliability.

### Types of Tests

- **Unit Tests**: Validate individual components in isolation. Use a framework like Jest or Mocha to write tests that focus on single functions or classes.

- **Functional Tests**: Ensure that your application functions as expected from the user's perspective. These tests cover scenarios based on user stories and interactions.

- **Integration Tests**: Test the interaction between multiple components to verify that they work together correctly. This includes testing API endpoints and database interactions.

- **End-to-End (E2E) Tests**: Simulate real user scenarios to test the application flow from start to finish. Tools like Cypress or Puppeteer can be used for E2E testing.

- **Acceptance Tests**: Validate that the application meets the requirements and works as intended. These tests are usually run in a staging environment before deployment.

### Test Flow Design

To facilitate a structured testing approach, you can refer to the test flow design diagram below. This diagram illustrates the relationship and flow between different types of tests.


## Testing Flow Diagram

The following diagram illustrates the testing flow:

```mermaid
flowchart TD
    A[Run Unit Test] -->|Passes| B[Run Functional Test]
    A -->|Fails| C[Fix Unit Test]
    C --> A
    
    B -->|Passes| D[Run Integration Test]
    B -->|Fails| E[Fix Functional Test]
    E --> B
    
    D -->|Passes| F[Run E2E Test]
    D -->|Fails| G[Fix Integration Test]
    G --> D
    
    F -->|Passes| H[Run Acceptance Test]
    F -->|Fails| I[Fix E2E Test]
    I --> F
    
    H -->|Passes| J[Deployment]
    H -->|Fails| K[Fix Acceptance Test]
    K --> H
