import { Platform } from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { supabase } from './supabase';

type ReportType = 'expenses' | 'earnings' | 'all';

export async function generateMonthlyReport(type: ReportType, month: Date) {
  try {
    const startDate = startOfMonth(month);
    const endDate = endOfMonth(month);
    const startDateStr = format(startDate, 'yyyy-MM-dd');
    const endDateStr = format(endDate, 'yyyy-MM-dd');

    // Fetch data based on report type
    let expenses = [];
    let earnings = [];

    if (type === 'expenses' || type === 'all') {
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select(`
          *,
          category:categories(name)
        `)
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .order('date', { ascending: true });

      if (expensesError) throw expensesError;
      expenses = expensesData || [];
    }

    if (type === 'earnings' || type === 'all') {
      const { data: earningsData, error: earningsError } = await supabase
        .from('earnings')
        .select(`
          *,
          category:categories(name)
        `)
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .order('date', { ascending: true });

      if (earningsError) throw earningsError;
      earnings = earningsData || [];
    }

    // Generate HTML content
    const htmlContent = generateHTMLReport(expenses, earnings, month);

    // Generate PDF
    const options = {
      html: htmlContent,
      fileName: `Budget_Report_${format(month, 'MMMM_yyyy')}`,
      directory: 'Documents',
    };

    const file = await RNHTMLtoPDF.convert(options);
    return file.filePath;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
}

export async function generateCSVReport(type: ReportType, month: Date) {
  try {
    const startDate = startOfMonth(month);
    const endDate = endOfMonth(month);
    const startDateStr = format(startDate, 'yyyy-MM-dd');
    const endDateStr = format(endDate, 'yyyy-MM-dd');

    // Fetch data based on report type
    let expenses = [];
    let earnings = [];

    if (type === 'expenses' || type === 'all') {
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select(`
          *,
          category:categories(name)
        `)
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .order('date', { ascending: true });

      if (expensesError) throw expensesError;
      expenses = expensesData || [];
    }

    if (type === 'earnings' || type === 'all') {
      const { data: earningsData, error: earningsError } = await supabase
        .from('earnings')
        .select(`
          *,
          category:categories(name)
        `)
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .order('date', { ascending: true });

      if (earningsError) throw earningsError;
      earnings = earningsData || [];
    }

    // Generate CSV content
    const csvContent = generateCSVContent(expenses, earnings);

    // Save CSV file
    const fileName = `Budget_Report_${format(month, 'MMMM_yyyy')}.csv`;
    const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
    await RNFS.writeFile(filePath, csvContent, 'utf8');

    return filePath;
  } catch (error) {
    console.error('Error generating CSV report:', error);
    throw error;
  }
}

export async function shareReport(filePath: string) {
  try {
    const shareOptions = {
      title: 'Share Report',
      url: Platform.OS === 'ios' ? filePath : `file://${filePath}`,
      type: filePath.endsWith('.pdf') ? 'application/pdf' : 'text/csv',
    };

    await Share.open(shareOptions);
  } catch (error) {
    console.error('Error sharing report:', error);
    throw error;
  }
}

function generateHTMLReport(expenses: any[], earnings: any[], month: Date) {
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalEarnings = earnings.reduce((sum, item) => sum + item.amount, 0);
  const netAmount = totalEarnings - totalExpenses;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Monthly Budget Report</title>
        <style>
          body { font-family: Arial, sans-serif; }
          .header { text-align: center; margin-bottom: 20px; }
          .section { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; }
          .summary { margin-top: 20px; }
          .positive { color: green; }
          .negative { color: red; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Monthly Budget Report</h1>
          <h2>${format(month, 'MMMM yyyy')}</h2>
        </div>

        <div class="section">
          <h3>Expenses</h3>
          <table>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Notes</th>
            </tr>
            ${expenses.map(expense => `
              <tr>
                <td>${format(new Date(expense.date), 'MMM d, yyyy')}</td>
                <td>${expense.category?.name || 'Uncategorized'}</td>
                <td>$${expense.amount.toFixed(2)}</td>
                <td>${expense.notes || ''}</td>
              </tr>
            `).join('')}
          </table>
        </div>

        <div class="section">
          <h3>Earnings</h3>
          <table>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Notes</th>
            </tr>
            ${earnings.map(earning => `
              <tr>
                <td>${format(new Date(earning.date), 'MMM d, yyyy')}</td>
                <td>${earning.category?.name || 'Uncategorized'}</td>
                <td>$${earning.amount.toFixed(2)}</td>
                <td>${earning.notes || ''}</td>
              </tr>
            `).join('')}
          </table>
        </div>

        <div class="summary">
          <h3>Summary</h3>
          <p>Total Expenses: $${totalExpenses.toFixed(2)}</p>
          <p>Total Earnings: $${totalEarnings.toFixed(2)}</p>
          <p>Net Amount: <span class="${netAmount >= 0 ? 'positive' : 'negative'}">$${netAmount.toFixed(2)}</span></p>
        </div>
      </body>
    </html>
  `;
}

function generateCSVContent(expenses: any[], earnings: any[]) {
  const headers = 'Date,Type,Category,Amount,Notes\n';
  
  const expensesRows = expenses.map(expense => 
    `${format(new Date(expense.date), 'yyyy-MM-dd')},Expense,${expense.category?.name || 'Uncategorized'},${expense.amount},${expense.notes || ''}`
  ).join('\n');

  const earningsRows = earnings.map(earning => 
    `${format(new Date(earning.date), 'yyyy-MM-dd')},Earning,${earning.category?.name || 'Uncategorized'},${earning.amount},${earning.notes || ''}`
  ).join('\n');

  return headers + expensesRows + '\n' + earningsRows;
} 