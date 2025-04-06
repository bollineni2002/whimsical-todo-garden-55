import React, { useState, useEffect } from 'react';
import { Transportation, Transaction, CompleteTransaction } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { transactionService } from '@/lib/transaction-service';
import { formatCurrency } from '@/lib/utils';
import { Edit } from 'lucide-react';

interface TransportationContentProps {
  transaction: CompleteTransaction;
  refreshTransaction: () => Promise<void>;
}

const TransportationContent: React.FC<TransportationContentProps> = ({
  transaction,
  refreshTransaction
}) => {
  const { toast } = useToast();
  const data = transaction.transportation;
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Omit<Transportation, 'id'> | null>(null);

  useEffect(() => {
    if (!data) {
      setIsEditing(true);
      setFormData({
        transaction_id: transaction.transaction.id,
        vehicle_type: '',
        number_plate: '',
        driver_phone: '',
        empty_weight: 0,
        loaded_weight: 0,
        origin: '',
        distance: 0,
        departure_date: '',
        departure_time: '',
        expected_arrival_date: '',
        expected_arrival_time: '',
        transportation_charges: 0,
        notes: ''
      });
    } else {
      setFormData({
        transaction_id: data.transaction_id,
        vehicle_type: data.vehicle_type,
        number_plate: data.number_plate,
        driver_phone: data.driver_phone || '',
        empty_weight: data.empty_weight,
        loaded_weight: data.loaded_weight,
        origin: data.origin,
        distance: data.distance,
        departure_date: data.departure_date || '',
        departure_time: data.departure_time || '',
        expected_arrival_date: data.expected_arrival_date || '',
        expected_arrival_time: data.expected_arrival_time || '',
        transportation_charges: data.transportation_charges,
        notes: data.notes || ''
      });
    }
  }, [data, transaction.transaction.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return;

    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: ['empty_weight', 'loaded_weight', 'distance', 'transportation_charges'].includes(name)
        ? parseFloat(value) || 0
        : value,
    });
  };

  const handleSave = async () => {
    try {
      if (!formData) {
        console.error("Form data is null, cannot save");
        return;
      }

      console.log("Saving transportation data:", formData);
      console.log("Transaction ID:", transaction.transaction.id);

      // Prepare form data for saving
      const preparedData = { ...formData };

      // Ensure date and time fields are properly formatted
      // Empty strings should be null for database compatibility
      if (preparedData.departure_date === '') preparedData.departure_date = null;
      if (preparedData.expected_arrival_date === '') preparedData.expected_arrival_date = null;
      if (preparedData.departure_time === '') preparedData.departure_time = null;
      if (preparedData.expected_arrival_time === '') preparedData.expected_arrival_time = null;

      console.log("Prepared transportation data:", preparedData);

      let result;
      if (data) {
        // Update existing transportation
        console.log("Updating existing transportation with ID:", data.id);
        result = await transactionService.saveTransportation({
          ...preparedData,
          id: data.id
        });
      } else {
        // Add new transportation
        console.log("Adding new transportation");
        result = await transactionService.saveTransportation(preparedData);
      }

      console.log("Transportation save result:", result);

      // Force a refresh to get the latest data
      console.log("Refreshing transaction data...");
      await refreshTransaction();
      setIsEditing(false);

      toast({
        title: "Success",
        description: "Transportation details updated successfully",
      });
    } catch (error) {
      console.error("Error updating transportation details:", error);
      toast({
        title: "Error",
        description: "Failed to update transportation details",
        variant: "destructive",
      });
    }
  };

  if (!formData) {
    return <div>Loading...</div>;
  }

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">{data ? "Edit Transportation Details" : "Add Transportation Details"}</h3>
          <div className="flex space-x-2">
            {data && <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>}
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle_type">Vehicle Type</Label>
              <Input
                id="vehicle_type"
                name="vehicle_type"
                value={formData.vehicle_type}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="number_plate">Number Plate</Label>
              <Input
                id="number_plate"
                name="number_plate"
                value={formData.number_plate}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="driver_phone">Driver's Phone Number</Label>
            <Input
              id="driver_phone"
              name="driver_phone"
              value={formData.driver_phone}
              onChange={handleInputChange}
              placeholder="Enter driver's phone number"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="empty_weight">Empty Weight (kg)</Label>
              <Input
                id="empty_weight"
                name="empty_weight"
                type="number"
                value={formData.empty_weight}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loaded_weight">Loaded Weight (kg)</Label>
              <Input
                id="loaded_weight"
                name="loaded_weight"
                type="number"
                value={formData.loaded_weight}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origin">Origin</Label>
              <Input
                id="origin"
                name="origin"
                value={formData.origin}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="distance">Distance (km)</Label>
              <Input
                id="distance"
                name="distance"
                type="number"
                value={formData.distance}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departure_date">Departure Date</Label>
              <Input
                id="departure_date"
                name="departure_date"
                type="date"
                value={formData.departure_date}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="departure_time">Departure Time</Label>
              <Input
                id="departure_time"
                name="departure_time"
                type="time"
                value={formData.departure_time}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expected_arrival_date">Expected Arrival Date</Label>
              <Input
                id="expected_arrival_date"
                name="expected_arrival_date"
                type="date"
                value={formData.expected_arrival_date}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expected_arrival_time">Expected Arrival Time</Label>
              <Input
                id="expected_arrival_time"
                name="expected_arrival_time"
                type="time"
                value={formData.expected_arrival_time}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transportation_charges">Transport Charges</Label>
            <Input
              id="transportation_charges"
              name="transportation_charges"
              type="number"
              value={formData.transportation_charges}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Transportation Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Add details about the transportation"
              rows={4}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground mb-4">No transportation data available</p>
        <Button
          onClick={() => setIsEditing(true)}
          variant="outline"
          className="bg-background hover:bg-secondary border border-border text-foreground"
        >
          <Edit className="h-4 w-4 mr-1" />
          Add Transportation Details
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-foreground">Vehicle Information</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="bg-background hover:bg-secondary border border-border text-foreground"
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit Details
        </Button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Vehicle Type</p>
            <p className="font-medium text-foreground">{data.vehicle_type}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Number Plate</p>
            <p className="font-medium text-foreground">{data.number_plate}</p>
          </div>
          {data.driver_phone && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Driver's Phone</p>
              <p className="font-medium text-foreground">{data.driver_phone}</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground">Load Measurements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Empty Weight</p>
            <p className="font-medium text-foreground">{data.empty_weight} kg</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Loaded Weight</p>
            <p className="font-medium text-foreground">{data.loaded_weight} kg</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground">Schedule Details</h3>
        <div className="glass p-4 rounded-lg bg-card/80 border border-border">
          {data.departure_date && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Departure Date</p>
                <p className="font-medium text-foreground">{new Date(data.departure_date).toLocaleDateString()}</p>
              </div>
              {data.departure_time && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Departure Time</p>
                  <p className="font-medium text-foreground">{data.departure_time}</p>
                </div>
              )}
            </div>
          )}

          {data.expected_arrival_date && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Expected Arrival Date</p>
                <p className="font-medium text-foreground">{new Date(data.expected_arrival_date).toLocaleDateString()}</p>
              </div>
              {data.expected_arrival_time && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Expected Arrival Time</p>
                  <p className="font-medium text-foreground">{data.expected_arrival_time}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground">Route Details</h3>
        <div className="glass p-4 rounded-lg bg-card/80 border border-border">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Origin</p>
                <p className="font-medium text-foreground">{data.origin}</p>
              </div>
              <div className="mx-4 text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-sm text-muted-foreground">Distance</p>
                <p className="font-medium text-foreground">{data.distance} km</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Transport Charges</p>
                <p className="font-medium text-foreground">{formatCurrency(data.transportation_charges)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {data.notes && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Transportation Notes</h3>
          <div className="glass p-4 rounded-lg bg-card/80 border border-border">
            <p className="whitespace-pre-wrap text-foreground">{data.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransportationContent;
