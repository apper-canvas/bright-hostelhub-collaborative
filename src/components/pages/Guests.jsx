import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { format, parseISO, subDays, subMonths, subYears } from "date-fns";
import * as XLSX from "xlsx";
import { getAllGuests, getGuestStayHistory, createGuest } from "@/services/api/guestService";
import ApperIcon from "@/components/ApperIcon";
import PageHeader from "@/components/molecules/PageHeader";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from "@/components/atoms/Modal";

const Guests = () => {
  const [guests, setGuests] = useState([]);
  const [filteredGuests, setFilteredGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [staysFilter, setStaysFilter] = useState("all");
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [guestStayHistory, setGuestStayHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [addGuestModal, setAddGuestModal] = useState(false);
  const [newGuestData, setNewGuestData] = useState({
    name: "",
    email: "",
    phone: "",
    idNumber: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    notes: ""
  });
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    loadGuests();
  }, []);

useEffect(() => {
    filterGuests();
  }, [guests, searchTerm, statusFilter, dateFilter, staysFilter]);

  const loadGuests = async () => {
    try {
      setLoading(true);
      const guestData = await getAllGuests();
      
      // Process guests to calculate stats
      const processedGuests = guestData.map(guest => {
        const totalStays = guest.stays ? guest.stays.length : 1;
        const lastVisit = guest.stays && guest.stays.length > 0 
          ? guest.stays[guest.stays.length - 1].checkOutDate 
          : guest.checkOutDate;
        
        return {
          ...guest,
          totalStays,
          lastVisit
        };
      });

      setGuests(processedGuests);
      setError(null);
    } catch (err) {
      setError("Failed to load guests");
      toast.error("Failed to load guests");
    } finally {
      setLoading(false);
    }
  };

const filterGuests = () => {
    let filtered = [...guests];

    // Text search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(guest => 
        guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.phone.includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(guest => guest.status === statusFilter);
    }

    // Date filter (based on registration/first visit)
    if (dateFilter !== "all") {
      const now = new Date();
      let dateThreshold;
      
      switch (dateFilter) {
        case "week":
          dateThreshold = subDays(now, 7);
          break;
        case "month":
          dateThreshold = subMonths(now, 1);
          break;
        case "quarter":
          dateThreshold = subMonths(now, 3);
          break;
        case "year":
          dateThreshold = subYears(now, 1);
          break;
        default:
          dateThreshold = null;
      }
      
      if (dateThreshold) {
        filtered = filtered.filter(guest => {
          try {
            const guestDate = parseISO(guest.checkInDate || guest.registrationDate);
            return guestDate >= dateThreshold;
          } catch {
            return false;
          }
        });
      }
    }

    // Stays count filter
    if (staysFilter !== "all") {
      switch (staysFilter) {
        case "first-time":
          filtered = filtered.filter(guest => guest.totalStays === 1);
          break;
        case "returning":
          filtered = filtered.filter(guest => guest.totalStays > 1 && guest.totalStays <= 5);
          break;
        case "frequent":
          filtered = filtered.filter(guest => guest.totalStays > 5);
          break;
      }
    }
    
    setFilteredGuests(filtered);
  };

  const handleAddGuest = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Basic validation
      if (!newGuestData.name.trim() || !newGuestData.email.trim() || !newGuestData.phone.trim()) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newGuestData.email)) {
        toast.error("Please enter a valid email address");
        return;
      }

      const guestToCreate = {
        ...newGuestData,
        status: "pre-registered",
        registrationDate: new Date().toISOString(),
        totalStays: 0,
        lastVisit: null
      };

      const createdGuest = await createGuest(guestToCreate);
      
      // Update local state
      const updatedGuest = {
        ...createdGuest,
        totalStays: 0,
        lastVisit: null
      };
      
      setGuests(prev => [...prev, updatedGuest]);
      setAddGuestModal(false);
      setNewGuestData({
        name: "",
        email: "",
        phone: "",
        idNumber: "",
        address: "",
        emergencyContact: "",
        emergencyPhone: "",
        notes: ""
      });
      
      toast.success("Guest pre-registered successfully!");
    } catch (err) {
      toast.error("Failed to add guest");
    } finally {
      setSubmitting(false);
    }
  };

  const exportGuestList = () => {
    try {
      const exportData = filteredGuests.map(guest => ({
        Name: guest.name,
        Email: guest.email,
        Phone: guest.phone,
        "ID Number": guest.idNumber || "N/A",
        Status: guest.status,
        "Total Stays": guest.totalStays,
        "Last Visit": formatDate(guest.lastVisit),
        "Registration Date": formatDate(guest.registrationDate || guest.checkInDate),
        Address: guest.address || "N/A",
        "Emergency Contact": guest.emergencyContact || "N/A",
        "Emergency Phone": guest.emergencyPhone || "N/A",
        Notes: guest.notes || "N/A"
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Guests");
      
      const fileName = `guests_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      toast.success(`Guest list exported as ${fileName}`);
    } catch (err) {
      toast.error("Failed to export guest list");
    }
  };

  const exportContactInfo = () => {
    try {
      const contactData = filteredGuests.map(guest => ({
        Name: guest.name,
        Email: guest.email,
        Phone: guest.phone,
        "Emergency Contact": guest.emergencyContact || "N/A",
        "Emergency Phone": guest.emergencyPhone || "N/A",
        Address: guest.address || "N/A"
      }));

      const worksheet = XLSX.utils.json_to_sheet(contactData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Contact Information");
      
      const fileName = `guest_contacts_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      toast.success(`Contact information exported as ${fileName}`);
    } catch (err) {
      toast.error("Failed to export contact information");
    }
  };

  const handleGuestClick = async (guest) => {
    setSelectedGuest(guest);
    setLoadingHistory(true);
    
    try {
      const history = await getGuestStayHistory(guest.id);
      setGuestStayHistory(history);
    } catch (err) {
      toast.error("Failed to load guest history");
      setGuestStayHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'checked-in': { variant: 'occupied', label: 'Checked In' },
      'checked-out': { variant: 'available', label: 'Checked Out' },
      'reserved': { variant: 'pending', label: 'Reserved' }
    };
    
    const config = statusMap[status] || { variant: 'default', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Guests" subtitle="Manage guest profiles and booking history" icon="Users" />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Guests" subtitle="Manage guest profiles and booking history" icon="Users" />
        <div className="bg-white rounded-lg shadow-card p-12">
          <div className="text-center">
            <ApperIcon name="AlertCircle" size={48} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Guests</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={loadGuests}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Guests" subtitle="Manage guest profiles and booking history" icon="Users" />
      
{/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <ApperIcon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="min-w-[150px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            >
              <option value="all">All Status</option>
              <option value="checked-in">Checked In</option>
              <option value="checked-out">Checked Out</option>
              <option value="reserved">Reserved</option>
              <option value="pre-registered">Pre-registered</option>
            </select>
          </div>

          {/* Registration Date Filter */}
          <div className="min-w-[160px]">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            >
              <option value="all">All Time</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
              <option value="quarter">Past 3 Months</option>
              <option value="year">Past Year</option>
            </select>
          </div>

          {/* Stays Filter */}
          <div className="min-w-[150px]">
            <select
              value={staysFilter}
              onChange={(e) => setStaysFilter(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            >
              <option value="all">All Guests</option>
              <option value="first-time">First Time</option>
              <option value="returning">Returning (2-5)</option>
              <option value="frequent">Frequent (5+)</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="primary"
            onClick={() => setAddGuestModal(true)}
            className="flex items-center"
          >
            <ApperIcon name="UserPlus" size={16} className="mr-2" />
            Add Guest
          </Button>
          
          <Button 
            variant="outline"
            onClick={exportGuestList}
            className="flex items-center"
          >
            <ApperIcon name="Download" size={16} className="mr-2" />
            Export List
          </Button>
          
          <Button 
            variant="outline"
            onClick={exportContactInfo}
            className="flex items-center"
          >
            <ApperIcon name="Phone" size={16} className="mr-2" />
            Export Contacts
          </Button>

          {/* Results Summary */}
          <div className="ml-auto flex items-center text-sm text-gray-600">
            <ApperIcon name="Users" size={16} className="mr-1" />
            {filteredGuests.length} of {guests.length} guests
          </div>
        </div>
      </div>

      {/* Guests Table */}
      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        {filteredGuests.length === 0 ? (
          <div className="text-center py-12">
            <ApperIcon name="Users" size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No guests found' : 'No guests yet'}
            </h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms' : 'Guests will appear here once they check in'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Guest</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Contact</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Total Stays</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Last Visit</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredGuests.map((guest) => (
                  <tr 
                    key={guest.id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleGuestClick(guest)}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                          <span className="text-primary-700 font-semibold text-sm">
                            {guest.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{guest.name}</div>
                          <div className="text-sm text-gray-500">ID: {guest.idNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <div className="text-gray-900">{guest.email}</div>
                        <div className="text-gray-500">{guest.phone}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(guest.status)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-gray-900">{guest.totalStays}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-900">{formatDate(guest.lastVisit)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGuestClick(guest);
                        }}
                      >
                        <ApperIcon name="Eye" size={16} className="mr-1" />
                        View Profile
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Guest Profile Modal */}
      <Modal
        isOpen={!!selectedGuest}
        onClose={() => setSelectedGuest(null)}
        className="max-w-4xl w-full"
      >
        {selectedGuest && (
          <>
            <ModalHeader>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                  <span className="text-primary-700 font-bold text-lg">
                    {selectedGuest.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div>
                  <ModalTitle className="text-xl">{selectedGuest.name}</ModalTitle>
                  <p className="text-gray-600">{selectedGuest.email}</p>
                </div>
              </div>
            </ModalHeader>
            
            <ModalContent className="max-h-[60vh] overflow-y-auto">
              <div className="space-y-6">
                {/* Guest Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-500">Email:</span> {selectedGuest.email}</div>
                      <div><span className="text-gray-500">Phone:</span> {selectedGuest.phone}</div>
                      <div><span className="text-gray-500">ID Number:</span> {selectedGuest.idNumber}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Stay Statistics</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-500">Total Stays:</span> {selectedGuest.totalStays}</div>
                      <div><span className="text-gray-500">Current Status:</span> {getStatusBadge(selectedGuest.status)}</div>
                      <div><span className="text-gray-500">Last Visit:</span> {formatDate(selectedGuest.lastVisit)}</div>
                    </div>
                  </div>
                </div>

                {/* Stay History */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Stay History</h4>
                  {loadingHistory ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                    </div>
                  ) : guestStayHistory.length > 0 ? (
                    <div className="space-y-3">
                      {guestStayHistory.map((stay, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">
                                {formatDate(stay.checkInDate)} - {formatDate(stay.checkOutDate)}
                              </div>
                              <div className="text-sm text-gray-600">
                                Room {stay.roomId} {stay.bedNumber ? `• Bed ${stay.bedNumber}` : ''}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">${stay.totalAmount}</div>
                              <div className="text-sm text-gray-600">${stay.pricePerNight}/night</div>
                            </div>
                          </div>
                          {stay.notes && (
                            <div className="mt-2 text-sm text-gray-600 bg-gray-50 rounded p-2">
                              <strong>Notes:</strong> {stay.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No stay history available
                    </div>
                  )}
                </div>

                {/* Staff Notes */}
                {selectedGuest.staffNotes && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Staff Notes</h4>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-gray-700">{selectedGuest.staffNotes}</p>
                    </div>
                  </div>
                )}
              </div>
            </ModalContent>
          </>
        )}
      </Modal>
{/* Add Guest Modal */}
      <Modal
        isOpen={addGuestModal}
        onClose={() => setAddGuestModal(false)}
        className="max-w-2xl w-full"
      >
        <ModalHeader>
          <ModalTitle className="flex items-center">
            <ApperIcon name="UserPlus" size={20} className="mr-2" />
            Pre-register New Guest
          </ModalTitle>
        </ModalHeader>
        
        <form onSubmit={handleAddGuest}>
          <ModalContent className="max-h-[60vh] overflow-y-auto">
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newGuestData.name}
                      onChange={(e) => setNewGuestData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={newGuestData.email}
                      onChange={(e) => setNewGuestData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="guest@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={newGuestData.phone}
                      onChange={(e) => setNewGuestData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID Number
                    </label>
                    <input
                      type="text"
                      value={newGuestData.idNumber}
                      onChange={(e) => setNewGuestData(prev => ({ ...prev, idNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Driver's license, passport, etc."
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={newGuestData.address}
                  onChange={(e) => setNewGuestData(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Street address, city, state, country"
                />
              </div>

              {/* Emergency Contact */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Emergency Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      value={newGuestData.emergencyContact}
                      onChange={(e) => setNewGuestData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Emergency contact name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={newGuestData.emergencyPhone}
                      onChange={(e) => setNewGuestData(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={newGuestData.notes}
                  onChange={(e) => setNewGuestData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Special requirements, preferences, or additional notes"
                />
              </div>
            </div>
          </ModalContent>
          
          <ModalFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setAddGuestModal(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
              className="flex items-center"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : (
                <>
                  <ApperIcon name="UserPlus" size={16} className="mr-2" />
                  Add Guest
                </>
              )}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
};

export default Guests;