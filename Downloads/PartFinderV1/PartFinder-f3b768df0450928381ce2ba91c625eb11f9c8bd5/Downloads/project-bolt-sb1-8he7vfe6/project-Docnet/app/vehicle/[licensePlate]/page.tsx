'use client';
import React, { useState, useEffect } from 'react';
import VehicleInfo from '@/components/VehicleInfo';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

interface VehicleData {
  licensePlate: string;
  vin: string;
  brand: string;
  model: string;
  year: string;
}

export default function VehiclePage({ params }: { params: { licensePlate: string } }) {
  const router = useRouter();
  const [plate, setPlate] = useState(params.licensePlate.toUpperCase());
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);

  useEffect(() => {
    if (plate === '0251FZL') {
      setVehicleData({ licensePlate: plate, vin: '12345678912345678', brand: 'Seat', model: 'Grande Punto', year: '25/01/2008' });
    } else {
      setVehicleData({ licensePlate: plate, vin: 'Desconocido', brand: 'Desconocida', model: 'Desconocido', year: '-' });
    }
  }, [plate]);

  const handleSearch = () => {
    const p = plate.toUpperCase();
    router.push(`/vehicle/${p}`);
  };

  return (
    <>
      <Header cartItems={0} onAddToCart={() => {}} />
      {vehicleData && (
        <VehicleInfo
          vehicleData={vehicleData}
          plate={plate}
          onPlateChange={setPlate}
          onSearch={handleSearch}
        />
      )}
      <div className="container mx-auto px-4 py-8">
        {/* Aquí irá el contenido principal una vez implementado */}
      </div>
    </>
  );
}
