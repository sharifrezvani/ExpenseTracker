import { useContext, useLayoutEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import Button from "../components/UI/Button";
import LoadingOverlay from "../components/UI/LoadingOverlay";
import ErrorOverlay from "../components/UI/ErrorOverlay";
import IconButton from "../components/UI/IconButton";
import { GlobalStyles } from "../constants/styles";
import { ExpensesContext } from "../store/expenses-context";
import ExpenseForm from "../components/ManageExpense/ExpenseForm";
import { deleteExpense, storeExpense, updateExpense } from "../util/http";

function ManageExpense({ route, navigation }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState();

  const expensesContext = useContext(ExpensesContext);

  const editedExpenseId = route.params?.expenseId; // the ? stops leaves out expenseId if params in undefined
  const isEditing = !!editedExpenseId;

  const selectedExpense = expensesContext.expenses.find(
    (expense) => expense.id === editedExpenseId
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditing ? "Edit Expense" : "Add Expense",
    });
  }, [navigation, isEditing]);

  async function deleteExpenseHandler() {
    setIsSubmitting(true);
    try {
      await deleteExpense(editedExpenseId);
      expensesContext.deleteExpense(editedExpenseId);
      navigation.goBack();
    } catch (error) {
      setError("Could not delete expense - please try again later.");
      setIsSubmitting(false);
    }
    // setIsSubmitting(false) => this would be redundant because we are closing the screen thereafter
  }

  function cancelHandler() {
    navigation.goBack();
  }

  async function confirmHandler(expenseData) {
    setIsSubmitting(true);
    try {
      if (isEditing) {
        expensesContext.updateExpense(editedExpenseId, expenseData);
        await updateExpense(editedExpenseId, expenseData);
      } else {
        const id = await storeExpense(expenseData);
        expensesContext.addExpense({ ...expenseData, id: id });
      }
      navigation.goBack();
    } catch (error) {
      setError("Could not save data - please try again later.");
      setIsSubmitting(false);
    }
    // setIsSubmitting(false);
  }

  // function errorhandler() {
  //   setError(null);
  // }

  if (error && !isSubmitting) {
    return <ErrorOverlay message={error} /* onConfirm={errorhandler} */ />;
  }

  if (isSubmitting) {
    return <LoadingOverlay />;
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior="position">
        <ScrollView>
          <ExpenseForm
            submitButtonLabel={isEditing ? "Update" : "Add"}
            onSubmit={confirmHandler}
            onCancel={cancelHandler}
            defaultValues={selectedExpense}
          />

          <View style={styles.deleteContainer}>
            {isEditing && (
              <IconButton
                icon="trash"
                color={GlobalStyles.colors.error500}
                size={36}
                onPress={deleteExpenseHandler}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

export default ManageExpense;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: GlobalStyles.colors.primary800,
  },
  deleteContainer: {
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: GlobalStyles.colors.primary200,
    alignItems: "center",
  },
});
