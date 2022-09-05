import { useContext, useEffect, useState } from "react";

import ExpensesOutput from "../components/ExpensesOutput/ExpensesOutput";
import LoadingOverlay from "../components/UI/LoadingOverlay";
import ErrorOverlay from "../components/UI/ErrorOverlay";
import { ExpensesContext } from "../store/expenses-context";
import { getDateMinusDays } from "../util/date";
import { fetchExpenses } from "../util/http";

function RecentExpenses() {
  const [isFetching, setIsFetching] = useState(true);

  const [error, setError] = useState();

  const expensesContext = useContext(ExpensesContext);

  // const [fetchedExpenses, setFetchedExpenses] = useState([]);

  useEffect(() => {
    async function getExpenses() {
      setIsFetching(true);
      try {
        const expenses = await fetchExpenses();
        expensesContext.setExpenses(expenses);
      } catch (error) {
        setError("Could not fetch expenses.");
      }
      setIsFetching(false);
      // setFetchedExpenses(expenses);
    }
    getExpenses();
  }, []);

  // function errorHandler() {
  //   setError(null);
  // }

  if (error && !isFetching) {
    return <ErrorOverlay message={error} /* onConfirm={errorHandler} */ />;
  }

  if (isFetching) {
    return <LoadingOverlay />;
  }

  // const recentExpenses = fetchedExpenses.filter((expense) => {
  const recentExpenses = expensesContext.expenses.filter((expense) => {
    const today = new Date();
    const date7DaysAgo = getDateMinusDays(today, 7);
    return expense.date >= date7DaysAgo && expense.date <= today;
  });

  return (
    <ExpensesOutput
      expenses={recentExpenses}
      expensesPeriod="Last 7 days"
      fallbackText="No expenses registered for the last seven days"
    />
  );
}

export default RecentExpenses;
