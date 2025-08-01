import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";
import { getAllGuests, getGuestStayHistory } from "@/services/api/guestService";
import ApperIcon from "@/components/ApperIcon";
import PageHeader from "@/components/molecules/PageHeader";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import { Modal, ModalContent, ModalHeader, ModalTitle } from "@/components/atoms/Modal";

const Guests = () => {
  const [guests, setGuests] = useState([]);
  const [filteredGuests, setFilteredGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [guestStayHistory, setGuestStayHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    loadGuests();
  }, []);

  useEffect(() => {
    filterGuests();
  }, [guests, searchTerm]);

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
    if (!searchTerm.trim()) {
      setFilteredGuests(guests);
      return;
    }

    const filtered = guests.filter(guest => 
      guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.phone.includes(searchTerm)
    );
    
    setFilteredGuests(filtered);
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
      
      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="relative max-w-md">
          <ApperIcon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
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
    </div>
  );
};

export default Guests;
