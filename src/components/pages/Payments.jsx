import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { 
  generateReceipt, 
  getAllTransactions, 
  getPaymentMethodLabel, 
  getPaymentStats, 
  getUnpaidBookings, 
  processPayment, 
  refundPayment 
} from "@/services/api/paymentService";
import ApperIcon from "@/components/ApperIcon";
import PageHeader from "@/components/molecules/PageHeader";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Bookings from "@/components/pages/Bookings";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import { Modal } from "@/components/atoms/Modal";
import { Card } from "@/components/atoms/Card";

const Payments = () => {
  const [transactions, setTransactions] = useState([]);
  const [unpaidBookings, setUnpaidBookings] = useState([]);
  const [paymentStats, setPaymentStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'credit_card',
    amount: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [transactionsData, unpaidData, statsData] = await Promise.all([
        getAllTransactions(),
        getUnpaidBookings(),
        getPaymentStats()
      ]);
      setTransactions(transactionsData);
      setUnpaidBookings(unpaidData);
      setPaymentStats(statsData);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBooking || !paymentData.amount || !paymentData.paymentMethod) {
      toast.error('Please fill in all payment details');
      return;
    }

    if (parseFloat(paymentData.amount) <= 0) {
      toast.error('Payment amount must be greater than zero');
      return;
    }

    try {
      setProcessing(true);
      const transaction = await processPayment({
        bookingId: selectedBooking.Id,
        paymentMethod: paymentData.paymentMethod,
        amount: paymentData.amount
      });
      
      toast.success('Payment processed successfully');
      await loadData();
      handleClosePaymentModal();
      
      // Generate and show receipt
      const receipt = await generateReceipt(transaction.Id);
      setReceiptData(receipt);
      setShowReceiptModal(true);
    } catch (err) {
      toast.error(err.message || 'Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleRefund = async (transactionId) => {
    if (!window.confirm('Are you sure you want to refund this payment?')) {
      return;
    }

    try {
      await refundPayment(transactionId);
      toast.success('Payment refunded successfully');
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Refund failed');
    }
  };

  const handleShowReceipt = async (transactionId) => {
    try {
      const receipt = await generateReceipt(transactionId);
      setReceiptData(receipt);
      setShowReceiptModal(true);
    } catch (err) {
      toast.error('Failed to generate receipt');
    }
  };

  const handlePayBooking = (booking) => {
    setSelectedBooking(booking);
    setPaymentData({
      paymentMethod: 'credit_card',
      amount: booking.totalAmount.toString()
    });
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedBooking(null);
    setPaymentData({
      paymentMethod: 'credit_card',
      amount: ''
    });
  };

  const downloadReceipt = () => {
    if (!receiptData) return;
    
    const receiptContent = `
PAYMENT RECEIPT
===============

Receipt Number: ${receiptData.receiptNumber}
Transaction ID: ${receiptData.transactionId}
Date: ${new Date(receiptData.date).toLocaleString()}

Guest: ${receiptData.guestName}
Booking ID: ${receiptData.booking.Id}
Room Type: ${receiptData.booking.roomType}
Check-in: ${new Date(receiptData.booking.checkInDate).toLocaleDateString()}
Check-out: ${new Date(receiptData.booking.checkOutDate).toLocaleDateString()}

Payment Method: ${getPaymentMethodLabel(receiptData.paymentMethod)}
Amount Paid: $${receiptData.amount.toFixed(2)}

Thank you for your payment!
    `.trim();

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${receiptData.receiptNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Receipt downloaded successfully');
  };

  const getStatusBadgeProps = (status) => {
    switch (status) {
      case 'paid':
        return { variant: 'success', className: 'bg-emerald-100 text-emerald-800' };
      case 'pending':
        return { variant: 'warning', className: 'bg-yellow-100 text-yellow-800' };
      case 'refunded':
        return { variant: 'destructive', className: 'bg-red-100 text-red-800' };
      default:
        return { variant: 'secondary' };
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        subtitle="Track payments and financial reporting"
        icon="CreditCard"
      />

      {/* Payment Stats */}
      {paymentStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <ApperIcon name="DollarSign" size={24} className="text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${paymentStats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ApperIcon name="Clock" size={24} className="text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">${paymentStats.pendingAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <ApperIcon name="RefreshCw" size={24} className="text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Refunded</p>
                <p className="text-2xl font-bold text-gray-900">${paymentStats.refundedAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ApperIcon name="CreditCard" size={24} className="text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{paymentStats.totalTransactions}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unpaid Bookings */}
      {unpaidBookings.length > 0 && (
        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Unpaid Bookings</h3>
            <Badge variant="warning" className="bg-yellow-100 text-yellow-800">
              {unpaidBookings.length} pending
            </Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Booking ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Guest</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Room Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Check-in</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {unpaidBookings.map((booking) => (
                  <tr key={booking.Id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">#{booking.Id}</td>
                    <td className="py-3 px-4 text-gray-700">{booking.guestName}</td>
                    <td className="py-3 px-4 text-gray-700">{booking.roomType}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">${booking.totalAmount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-gray-700">
                      {new Date(booking.checkInDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        size="sm"
                        onClick={() => handlePayBooking(booking)}
                        className="bg-primary-600 hover:bg-primary-700 text-white"
                      >
                        <ApperIcon name="CreditCard" size={16} className="mr-1" />
                        Pay Now
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <ApperIcon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by guest name, transaction ID, or receipt number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          {filteredTransactions.length === 0 ? (
            <Empty 
              icon="CreditCard"
              title="No transactions found"
              subtitle={searchTerm || statusFilter !== 'all' ? "Try adjusting your search or filters" : "No payment transactions yet"}
            />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Guest Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Payment Method</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Booking Ref</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.Id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-700">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-gray-700">{transaction.guestName}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">${transaction.amount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-gray-700">
                      {getPaymentMethodLabel(transaction.paymentMethod)}
                    </td>
                    <td className="py-3 px-4 text-gray-700">#{transaction.bookingId}</td>
                    <td className="py-3 px-4">
                      <Badge {...getStatusBadgeProps(transaction.status)}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        {transaction.receiptNumber && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleShowReceipt(transaction.Id)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <ApperIcon name="FileText" size={16} />
                          </Button>
                        )}
                        {transaction.status === 'paid' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRefund(transaction.Id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <ApperIcon name="RefreshCw" size={16} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Payment Processing Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={handleClosePaymentModal}
        title="Process Payment"
      >
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          {selectedBooking && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Booking Details</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Booking ID: #{selectedBooking.Id}</p>
                <p>Guest: {selectedBooking.guestName}</p>
                <p>Room: {selectedBooking.roomType}</p>
                <p>Check-in: {new Date(selectedBooking.checkInDate).toLocaleDateString()}</p>
                <p>Total Amount: ${selectedBooking.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method *
            </label>
            <select
              required
              value={paymentData.paymentMethod}
              onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="paypal">PayPal</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={paymentData.amount}
              onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter payment amount"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClosePaymentModal}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={processing}
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              {processing ? 'Processing...' : 'Process Payment'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Receipt Modal */}
      <Modal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        title="Payment Receipt"
      >
        {receiptData && (
          <div className="space-y-4">
            <div className="text-center border-b border-gray-200 pb-4">
              <h3 className="text-lg font-bold text-gray-900">Payment Receipt</h3>
              <p className="text-sm text-gray-600">{receiptData.receiptNumber}</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Transaction ID:</span>
                <span className="text-sm font-medium">{receiptData.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Date:</span>
                <span className="text-sm font-medium">
                  {new Date(receiptData.date).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Guest:</span>
                <span className="text-sm font-medium">{receiptData.guestName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Booking ID:</span>
                <span className="text-sm font-medium">#{receiptData.booking.Id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Room Type:</span>
                <span className="text-sm font-medium">{receiptData.booking.roomType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Payment Method:</span>
                <span className="text-sm font-medium">
                  {getPaymentMethodLabel(receiptData.paymentMethod)}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-3">
                <span className="text-base font-semibold">Total Paid:</span>
                <span className="text-base font-bold text-primary-600">
                  ${receiptData.amount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="ghost"
                onClick={() => setShowReceiptModal(false)}
              >
                Close
              </Button>
              <Button
                onClick={downloadReceipt}
                className="bg-primary-600 hover:bg-primary-700 text-white"
              >
                <ApperIcon name="Download" size={16} className="mr-2" />
                Download
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Payments;