import transactionsData from '@/services/mockData/transactions.json';
import { getBookingById, updateBooking } from '@/services/api/bookingService';

let transactions = [...transactionsData];
let nextId = Math.max(...transactions.map(t => t.Id)) + 1;

export const getAllTransactions = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return transactions.map(transaction => ({ ...transaction }));
};

export const getTransactionById = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const transaction = transactions.find(t => t.Id === parseInt(id));
  if (!transaction) {
    throw new Error("Transaction not found");
  }
  return { ...transaction };
};

export const getUnpaidBookings = async () => {
  await new Promise(resolve => setTimeout(resolve, 200));
  // Import bookings dynamically to avoid circular dependency
  const { getAllBookings } = await import('@/services/api/bookingService');
  const bookings = await getAllBookings();
  
  // Filter bookings that don't have corresponding paid transactions
  const paidBookingIds = transactions
    .filter(t => t.status === 'paid')
    .map(t => t.bookingId);
    
  return bookings
    .filter(booking => 
      booking.status === 'confirmed' && 
      !paidBookingIds.includes(booking.Id)
    )
    .map(booking => ({ ...booking }));
};

export const processPayment = async (paymentData) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const { bookingId, paymentMethod, amount } = paymentData;
  
  // Validate booking exists
  const booking = await getBookingById(bookingId);
  if (!booking) {
    throw new Error("Booking not found");
  }
  
  // Simulate payment processing
  const isSuccess = Math.random() > 0.1; // 90% success rate
  if (!isSuccess) {
    throw new Error("Payment processing failed. Please try again.");
  }
  
  // Create transaction record
  const transaction = {
    Id: nextId++,
    bookingId: parseInt(bookingId),
    guestName: booking.guestName,
    amount: parseFloat(amount),
    paymentMethod,
    date: new Date().toISOString(),
    status: 'paid',
    transactionId: `TXN-${String(nextId - 1).padStart(3, '0')}-${new Date().getFullYear()}`,
    receiptNumber: `RCP-${String(nextId - 1).padStart(3, '0')}-${new Date().getFullYear()}`
  };
  
  transactions.push(transaction);
  
  // Update booking payment status
  await updateBooking(bookingId, { paymentStatus: 'paid' });
  
  return { ...transaction };
};

export const refundPayment = async (transactionId) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const index = transactions.findIndex(t => t.Id === parseInt(transactionId));
  if (index === -1) {
    throw new Error("Transaction not found");
  }
  
  if (transactions[index].status !== 'paid') {
    throw new Error("Only paid transactions can be refunded");
  }
  
  transactions[index].status = 'refunded';
  return { ...transactions[index] };
};

export const generateReceipt = async (transactionId) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const transaction = await getTransactionById(transactionId);
  const booking = await getBookingById(transaction.bookingId);
  
  const receipt = {
    receiptNumber: transaction.receiptNumber,
    transactionId: transaction.transactionId,
    date: transaction.date,
    guestName: transaction.guestName,
    amount: transaction.amount,
    paymentMethod: transaction.paymentMethod,
    booking: {
      Id: booking.Id,
      roomType: booking.roomType,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate
    }
  };
  
  return receipt;
};

export const getPaymentMethodLabel = (method) => {
  const methods = {
    credit_card: 'Credit Card',
    debit_card: 'Debit Card',
    paypal: 'PayPal',
    bank_transfer: 'Bank Transfer',
    cash: 'Cash'
  };
  return methods[method] || method;
};

export const getPaymentStats = async () => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const totalRevenue = transactions
    .filter(t => t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const pendingAmount = transactions
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const refundedAmount = transactions
    .filter(t => t.status === 'refunded')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalTransactions = transactions.length;
  
  return {
    totalRevenue,
    pendingAmount,
    refundedAmount,
    totalTransactions
  };
};