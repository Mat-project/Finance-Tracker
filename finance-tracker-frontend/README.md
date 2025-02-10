# Finance Tracker

A web application for tracking personal finances, allowing users to manage transactions, set financial goals, and analyze their spending habits.

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features
- Add, edit, and delete transactions
- Categorize transactions for better tracking
- Set and monitor financial goals
- View transaction history and analytics
- Responsive design for mobile and desktop

## Technologies Used
- React
- JavaScript
- Axios for API calls
- Tailwind CSS for styling
- React Router for navigation

## Project Structure
```
finance-tracker/
├── finance-tracker-frontend/
│   ├── public/                     # Public assets
│   ├── src/
│   │   ├── components/             # Reusable components
│   │   │   ├── common/             # Common UI components (Button, Input, etc.)
│   │   │   ├── layout/             # Layout components (Sidebar, Header)
│   │   │   └── transactions/        # Transaction-related components (TransactionList, TransactionForm)
│   │   ├── pages/                  # Page components (TransactionsPage, DashboardPage, etc.)
│   │   ├── services/               # API service calls
│   │   ├── contexts/               # Context providers for global state management
│   │   ├── App.jsx                 # Main application component
│   │   └── index.js                # Entry point of the application
│   └── README.md                   # Project documentation
└── .gitignore                      # Git ignore file
```

## Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd finance-tracker/finance-tracker-frontend
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

## Usage
1. Start the development server:
   ```bash
   npm start
   ```
2. Open your browser and navigate to `http://localhost:5173`.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or features you'd like to add.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
