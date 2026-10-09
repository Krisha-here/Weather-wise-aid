import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, MapPin, Tag } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export interface CommunityReport {
  id: string;
  user: string;
  category: string;
  location: string;
  description: string;
  timestamp: string;
}

interface ReportDialogProps {
  onReportSubmit: (report: CommunityReport) => void;
}

export function ReportDialog({ onReportSubmit }: ReportDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("flood");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Generate a random community title
    const titles = ["Coast Guardian", "Wave Watcher", "Storm Chaser", "Delta Resident", "Night Sentinel", "Beach Marshall", "Flood Scout"];
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];

    const newReport: CommunityReport = {
      id: Math.random().toString(36).substr(2, 9),
      user: `${user.name} [${randomTitle}]`,
      category,
      location,
      description,
      timestamp: new Date().toISOString(),
    };

    onReportSubmit(newReport);
    setOpen(false);
    // Reset form
    setLocation("");
    setDescription("");
    setCategory("flood");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Submit New Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border-border/50 bg-card/95 backdrop-blur-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Community Incident Report</DialogTitle>
            <DialogDescription>
              Report real-time disaster conditions or weather changes in your area.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category" className="flex items-center gap-2">
                <Tag className="h-3.5 w-3.5" /> Category
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flood">Flash Flood</SelectItem>
                  <SelectItem value="cyclone">Cyclone / Strong Wind</SelectItem>
                  <SelectItem value="rainfall">Heavy Rainfall</SelectItem>
                  <SelectItem value="infrastructure">Infrastructure Damage</SelectItem>
                  <SelectItem value="other">Other Observation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" /> Location
              </Label>
              <Input
                id="location"
                placeholder="e.g. Beach Road, Naga North"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Situation Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what you see on the ground..."
                className="min-h-[100px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full">Post Report</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
