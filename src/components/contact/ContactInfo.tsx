import { Mail, Phone, MapPin, Clock, MessageCircle } from "lucide-react";

import { Card, Button } from "@/components/ui";
import { contactInfo } from "@/data/contact";

export default function ContactInfo() {
  return (
    <Card className="h-fit rounded-3xl p-8">
      <h3 className="text-2xl font-bold text-slate-900">Get In Touch</h3>

      <p className="mt-3 text-slate-600">
        We'd love to hear about your project. Reach out using any of the methods
        below.
      </p>

      <div className="mt-8 space-y-6">
        <div className="flex items-start gap-4">
          <Mail className="mt-1 h-5 w-5 text-blue-600" />

          <div>
            <p className="font-semibold">Email</p>
            <p className="text-slate-600">{contactInfo.email}</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <Phone className="mt-1 h-5 w-5 text-blue-600" />

          <div>
            <p className="font-semibold">Phone</p>
            <p className="text-slate-600">{contactInfo.phone}</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <MapPin className="mt-1 h-5 w-5 text-blue-600" />

          <div>
            <p className="font-semibold">Location</p>
            <p className="text-slate-600">{contactInfo.location}</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <Clock className="mt-1 h-5 w-5 text-blue-600" />

          <div>
            <p className="font-semibold">Response Time</p>
            <p className="text-slate-600">{contactInfo.response}</p>
          </div>
        </div>
      </div>

      <Button
        href={contactInfo.whatsapp}
        variant="outline"
        className="mt-10 w-full"
      >
        <MessageCircle className="mr-2 h-5 w-5" />
        Chat on WhatsApp
      </Button>
    </Card>
  );
}
