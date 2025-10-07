
"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { PropertiesGrid } from "@/components/properties/properties-grid";
import { PropertyFilters } from "@/components/properties/property-filters";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";

export default function PropertiesPage() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const status = searchParams.get("status") || undefined;
  const property_type = searchParams.get("type") || undefined;
  const search = searchParams.get("search") || undefined;

  useEffect(() => {
    async function fetchProperties() {
      try {
        setLoading(true);
        const result = await apiClient.getProperties({ status, property_type, search, limit: 100 });
        setProperties(result.properties);
      } catch (error) {
        console.error("Error fetching properties:", error);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProperties();
  }, [status, property_type, search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading properties...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
          <p className="text-muted-foreground">Manage your property listings</p>
        </div>
        <Link href="/dashboard/properties/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Property
          </Button>
        </Link>
      </div>

      <PropertyFilters />

      <PropertiesGrid properties={properties || []} />
    </div>
  );
}
