# Spend Analyzer

A modern, professional expense tracking dashboard built with React, Vite, and Tailwind CSS. Spend Analyzer helps users track expenses, manage budgets, visualize spending habits, and analyze financial activity with a premium fintech SaaS UI.

## Features

- **Modern Dashboard**: Real-time overview of income, expenses, budgets, and savings
- **Transaction Management**: Add, edit, delete, search, filter, and categorize transactions
- **Budget Tracking**: Set monthly and category-specific budgets with progress tracking
- **Analytics & Insights**: Interactive charts, spending patterns, and personalized financial insights
- **Savings Goals**: Track progress toward financial targets
- **Professional UI**: Clean, minimalist design with light/dark mode and responsive layout
- **Data Import/Export**: CSV import and export for transaction data
- **Demo Mode**: Try the app instantly with sample data

## Technology Stack

- **React.js** with Vite for fast development and building
- **Tailwind CSS** for utility-first styling
- **Lucide React** for professional, consistent icons
- **Recharts** for interactive financial charts
- **React Router** for client-side navigation
- **Zustand** for state management (via React Context)
- **date-fns** for date manipulation and formatting

## Project Structure

```
spend-analyzer/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── layout/
│   │   ├── dashboard/
│   │   ├── transactions/
│   │   ├── budgets/
│   │   ├── savings/
│   │   └── ui/
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Transactions.jsx
│   │   ├── Budgets.jsx
│   │   ├── Analytics.jsx
│   │   ├── Savings.jsx
│   │   ├── Settings.jsx
│   │   └── Security.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── TransactionContext.jsx
│   │   ├── BudgetContext.jsx
│   │   └── ThemeContext.jsx
│   ├── services/
│   │   ├── authService.js
│   │   └── transactionService.js
│   ├── data/
│   │   └── mockData.js
│   ├── utils/
│   │   └── helpers.js
│   ├── App.jsx
│   └── main.jsx
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── index.html
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/spend-analyzer.git
cd spend-analyzer
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

### Supabase data setup

The app requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in
its environment. Apply both SQL migrations in `supabase/migrations/` to the
project's database before using transactions, profile setup, or live homepage
statistics. They create the user-owned transactions table and row-level
security policies, and provide aggregate-only platform statistics. The public
stats function returns registered-user and transaction counts plus the sum of
saved transaction amounts; it does not expose user or transaction details.

Account deletion also requires deploying the Edge Function:

```bash
supabase functions deploy delete-account
```

Configure `SUPABASE_SERVICE_ROLE_KEY` as an Edge Function secret in the Supabase
project. Never put this key in a `VITE_` variable or browser code. Until the
function is deployed, account deletion reports an error and does not pretend
the account was removed.

## Usage

### Authentication

- **Demo Mode**: Use `demo@spendanalyzer.com` / `demo1234` to try the app instantly
- **Sign Up**: Create a real account to save your data permanently
- **Login**: Access your account with email and password
- **Password Reset**: Use the forgot password feature (demo mode shows placeholder)

### Navigation

- **Dashboard**: Overview of your financial health with key metrics and charts
- **Transactions**: Manage all income and expenses with filtering and search
- **Budgets**: Set and track monthly and category-specific budgets
- **Analytics**: Deep dive into spending patterns with interactive charts
- **Savings Goals**: Track progress toward financial targets
- **Settings**: Manage account preferences and profile
- **Security**: Change password and manage account security

### Key Features

#### Dashboard

- View total income, expenses, remaining budget, and savings rate
- See monthly expense trends and income vs expenses comparison
- Analyze spending by category with doughnut charts
- Track daily spending patterns
- Review recent transactions and top spending categories
- Monitor budget progress and receive overspending alerts
- Get personalized insights based on your financial data

#### Transactions

- Add income and expenses with categories, dates, and payment methods
- Edit and delete transactions with confirmation
- Search transactions by title or notes
- Filter by category, date range, and transaction type
- Sort by date or amount
- View category-specific icons
- Configure recurring transactions
- Import/export transactions via CSV

#### Budgets

- Create monthly overall budgets
- Set category-specific budgets for better control
- Visual progress bars showing budget utilization
- Warning states when approaching budget limits
- Overspending alerts when budgets are exceeded
- Calculate totals dynamically from transaction data

#### Analytics

- Monthly spending comparisons
- Category-wise expense breakdowns
- Daily spending patterns
- Income versus expenses analysis
- Average daily spending calculations
- Savings rate tracking
- Top spending categories identification
- Budget performance monitoring

#### Savings Goals

- Create multiple savings goals with target amounts and dates
- Visual progress tracking for each goal
- Add funds to goals directly
- See remaining amount and time to goal
- Calculate monthly savings needed to reach targets

## Design Principles

- **Professional Fintech UI**: Clean, minimalist layout inspired by premium financial apps
- **Consistent Iconography**: Lucide React icons used throughout for visual consistency
- **Responsive Design**: Fully functional on desktop, tablet, and mobile devices
- **Light/Dark Modes**: Automatic detection with manual override capability
- **Accessibility**: Proper labeling, keyboard navigation, and focus indicators
- **Performance**: Optimized components and efficient state management
- **User Experience**: Loading states, empty states, error handling, and toast notifications

## Data Storage

For this initial version, Spend Analyzer uses:

- **Mock Data**: Pre-populated sample transactions for immediate use
- **Browser Memory**: State stored in React Context and localStorage
- **No Database**: All data operations happen client-side for privacy and simplicity
- **Modular Architecture**: Easy to replace mock data with API calls in future versions

## Future Enhancements

The application is designed for easy extension:

- **Backend Integration**: Replace mock data with REST API or GraphQL endpoints
- **Database Persistence**: Add user authentication with secure backend storage
- **Bank Integration**: Connect to financial institutions for automatic transaction import
- **Advanced Analytics**: Machine learning-powered spending predictions and recommendations
- **Multi-currency Support**: Handle transactions in different currencies
- **Bill Tracking**: Schedule and track recurring bills and subscriptions
- **Tax Preparation**: Generate reports for tax filing purposes
- **Investment Tracking**: Monitor investment portfolios alongside spending

## Browser Support

Spend Analyzer supports modern browsers:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers on iOS and Android

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by modern financial management applications
- Built with React ecosystem tools and libraries
- Icons provided by Lucide React
- Charts powered by Recharts
- Styling with Tailwind CSS
