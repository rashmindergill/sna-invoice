import React, { useMemo, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, Printer } from "lucide-react";

/**
 * Single-file invoice preview component
 * - Minimal, Apple-like aesthetic (thin typography, generous whitespace)
 * - Dark-mode friendly (inherits parent .dark)
 * - Uses shadcn/ui primitives you already have in your project
 * - Print button calls window.print() (use browser "Save as PDF" to export)
 */

const sample = {
  company: {
    name: "SNA Transport, Inc.",
    address: "1950 Logistics Way, Huber Heights, OH 45424",
    phone: "(937) 555-0142",
    email: "billing@snatransport.com",
  },
  broker: {
    name: "Roadly Logistics LLC",
    address: "P.O. Box 737606, Dallas, TX 75373-7606",
    email: "ap@roadlylogistics.com",
  },
  invoice: {
    loadNumber: "76430",
    invoiceNumber: "INV-76430", // based off load number
    invoiceDate: new Date().toLocaleDateString(),
    dueDate: new Date(Date.now() + 7 * 86400000).toLocaleDateString(),
    status: "Unpaid" as "Unpaid" | "Paid" | "Partial",
  },
  driver: {
    name: "Kuljeet",
    truck: "702", // per your mapping
  },
  ship: {
    pickup: {
      name: "ABC Plastics Warehouse",
      city: "Lebanon, IN",
      date: "08/08/2025",
    },
    delivery: {
      name: "Fairfield Distribution Center",
      city: "Fairfield, OH",
      date: "08/08/2025",
    },
  },
  items: [
    { description: "Linehaul – KY → IN (Round Trip)", qty: 1, rate: 650.0 },
    { description: "Fuel Surcharge", qty: 1, rate: 85.0 },
    { description: "Detention (1 hr)", qty: 1, rate: 50.0 },
  ],
  notes:
    "Please make checks payable to SNA Transport, Inc. Include Load #76430 on payment. Attachments: Rate Confirmation (pg 2), BOL (pg 3).",
  remitTo: {
    name: "SNA Transport, Inc.",
    address1: "1950 Logistics Way",
    address2: "Huber Heights, OH 45424",
  },
};

function currency(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export default function InvoicePreview() {
  const printRef = useRef<HTMLDivElement>(null);

  const { subTotal, total } = useMemo(() => {
    const sub = sample.items.reduce((acc, i) => acc + i.qty * i.rate, 0);
    return { subTotal: sub, total: sub };
  }, []);

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Invoice Preview</h1>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> Print / PDF
          </Button>
          <Button variant="secondary" onClick={() => window.print()}>
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
        </div>
      </div>

      <Card ref={printRef} className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-semibold tracking-tight">
                {sample.company.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {sample.company.address}
              </p>
              <p className="text-sm text-muted-foreground">
                {sample.company.phone} • {sample.company.email}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-semibold tracking-tight">INVOICE</div>
              <div className="mt-2 flex items-center justify-end gap-2">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={sample.invoice.status === "Paid" ? "default" : "secondary"}>
                  {sample.invoice.status}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Meta Row */}
          <div className="grid grid-cols-1 gap-6 rounded-xl bg-muted/30 p-4 text-sm sm:grid-cols-3">
            <div>
              <div className="text-muted-foreground">Invoice #</div>
              <div className="font-medium">{sample.invoice.invoiceNumber}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Load #</div>
              <div className="font-medium">{sample.invoice.loadNumber}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Invoice Date / Due</div>
              <div className="font-medium">
                {sample.invoice.invoiceDate} • {sample.invoice.dueDate}
              </div>
            </div>
          </div>

          {/* Parties */}
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-xl border p-4">
              <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Bill To</div>
              <div className="font-medium">{sample.broker.name}</div>
              <div className="text-sm text-muted-foreground">{sample.broker.address}</div>
              <div className="text-sm text-muted-foreground">{sample.broker.email}</div>
            </div>
            <div className="rounded-xl border p-4">
              <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Driver / Equipment</div>
              <div className="font-medium">{sample.driver.name}</div>
              <div className="text-sm text-muted-foreground">Truck #{sample.driver.truck}</div>
              <div className="mt-2 text-sm text-muted-foreground">
                PU: {sample.ship.pickup.name} — {sample.ship.pickup.city} ({sample.ship.pickup.date})
              </div>
              <div className="text-sm text-muted-foreground">
                DEL: {sample.ship.delivery.name} — {sample.ship.delivery.city} ({sample.ship.delivery.date})
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="mt-6 overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-20 text-right">Qty</TableHead>
                  <TableHead className="w-40 text-right">Rate</TableHead>
                  <TableHead className="w-40 text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sample.items.map((it, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="align-top">{it.description}</TableCell>
                    <TableCell className="text-right align-top">{it.qty}</TableCell>
                    <TableCell className="text-right align-top">{currency(it.rate)}</TableCell>
                    <TableCell className="text-right align-top">{currency(it.qty * it.rate)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Totals */}
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <div className="rounded-xl bg-muted/20 p-4 text-sm text-muted-foreground">
                {sample.notes}
              </div>
            </div>
            <div className="rounded-xl border p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{currency(subTotal)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex items-center justify-between text-base">
                <span className="font-medium">Total Due</span>
                <span className="font-semibold tracking-tight">{currency(total)}</span>
              </div>
            </div>
          </div>

          {/* Remit To */}
          <div className="mt-8 rounded-xl border p-4 text-sm">
            <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Remit To</div>
            <div className="font-medium">{sample.remitTo.name}</div>
            <div className="text-muted-foreground">{sample.remitTo.address1}</div>
            <div className="text-muted-foreground">{sample.remitTo.address2}</div>
          </div>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            Thank you for your business.
          </div>
        </CardContent>
      </Card>

      <style jsx global>{`
        /* Print styles */
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          /* Expand to full width on print */
          .max-w-4xl { max-width: 100% !important; }
          .shadow-sm { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}
