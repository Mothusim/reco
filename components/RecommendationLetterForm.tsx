"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function RecommendationLetterForm({ request, onClose, onSuccess }) {
  const { register, handleSubmit } = useForm();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/recommendation-letters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          userId: request.user.id,
          requestId: request.id,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Recommendation letter generated successfully.",
        });
        onSuccess();
        onClose();
      } else {
        throw new Error("Failed to generate recommendation letter");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Recommendation Letter</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="recipientName">Recipient Name</Label>
            <Input id="recipientName" {...register("recipientName")} required />
          </div>
          <div>
            <Label htmlFor="recipientTitle">Recipient Title</Label>
            <Input id="recipientTitle" {...register("recipientTitle")} required />
          </div>
          <div>
            <Label htmlFor="content">Letter Content</Label>
            <Textarea
              id="content"
              {...register("content")}
              rows={10}
              placeholder="Write your recommendation letter here..."
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Generating..." : "Generate Letter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}