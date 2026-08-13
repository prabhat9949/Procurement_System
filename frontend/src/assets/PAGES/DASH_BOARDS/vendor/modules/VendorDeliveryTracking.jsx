import React from "react";
import UnavailableState from "../../shared_ui/UnavailableState";
export default function VendorDeliveryTracking() { return <UnavailableState title="Vendor delivery tracking is not configured" message="There is no verified vendor-scoped shipment or delivery-tracking API. This page does not use frontend-only tracking timelines." requirement="Provide an authorized vendor shipment/delivery endpoint." />; }
