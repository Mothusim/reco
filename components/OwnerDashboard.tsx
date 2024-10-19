"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import RecommendationLetterForm from "./RecommendationLetterForm";

export default function OwnerDashboard() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/recommendation-requests");
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else {
        throw new Error("Failed to fetch requests");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load recommendation requests.",
        variant: "destructive",
      });
    }
  };

  const handleApprove = async (requestId) => {
    try {
      const response = await fetch(`/api/recommendation-requests/${requestId}/approve`, {
        method: "POST",
      });
      if (response.ok) {
        toast({
          title: "Success",
          description: "Request approved successfully.",
        });
        fetchRequests();
      } else {
        throw new Error("Failed to approve request");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleReject = async (requestId) => {
    try {
      const response = await fetch(`/api/recommendation-requests/${requestId}/reject`, {
        method: "POST",
      });
      if (response.ok) {
        toast({
          title: "Success",
          description: "Request rejected successfully.",
        });
        fetchRequests();
      } else {
        throw new Error("Failed to reject request");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Pending Recommendation Requests</h2>
      {requests.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        <ul className="space-y-4">
          {requests.map((request) => (
            <li key={request.id} className="border p-4 rounded">
              <p>Name: {request.user.name}</p>
              <p>Email: {request.user.email}</p>
              <p>ID Number: {request.user.idNumber}</p>
              <div className="mt-2 space-x-2">
                <Button onClick={() => handleApprove(request.id)}>Approve</Button>
                <Button variant="destructive" onClick={() => handleReject(request.id)}>Reject</Button>
                <Button variant="outline" onClick={() => setSelectedRequest(request)}>Generate Letter</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {selectedRequest && (
        <RecommendationLetterForm
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onSuccess={fetchRequests}
        />
      )}
    </div>
  );
}