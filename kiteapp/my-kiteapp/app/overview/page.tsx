"use client";

import { useState } from "react";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import dynamic from "next/dynamic";

// Dynamischer Import der Map-Komponente (nur Client-Side)
const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] bg-gradient-to-br from-blue-100 to-blue-200 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center">
      <div className="text-lg">Karte wird geladen...</div>
    </div>
  ),
});

// Mock data für Kite Spots
const mockSpots = [
  {
    id: 1,
    name: "Tarifa - Los Lances",
    region: "Spanien",
    windrichtung: "Ost",
    windgeschwindigkeit: 25,
    temperatur: 22,
    qualität: "gut",
    lat: 36.0108,
    lng: -5.6038,
    beschreibung: "Perfekter Spot für Anfänger und Fortgeschrittene",
  },
  {
    id: 2,
    name: "Fehmarn - Gold",
    region: "Deutschland",
    windrichtung: "West",
    windgeschwindigkeit: 18,
    temperatur: 15,
    qualität: "mittel",
    lat: 54.4375,
    lng: 11.1867,
    beschreibung: "Beliebter Spot in der Ostsee",
  },
  {
    id: 3,
    name: "Dakhla - Speed Spot",
    region: "Marokko",
    windrichtung: "Nord",
    windgeschwindigkeit: 30,
    temperatur: 25,
    qualität: "gut",
    lat: 23.7225,
    lng: -15.9430,
    beschreibung: "Weltklasse Flachwasser-Spot",
  },
  {
    id: 4,
    name: "St. Peter-Ording",
    region: "Deutschland",
    windrichtung: "West",
    windgeschwindigkeit: 12,
    temperatur: 14,
    qualität: "schlecht",
    lat: 54.3167,
    lng: 8.6333,
    beschreibung: "Breiter Strand, gut bei starkem Wind",
  },
  {
    id: 5,
    name: "Cabarete - Kite Beach",
    region: "Dominikanische Republik",
    windrichtung: "Ost",
    windgeschwindigkeit: 22,
    temperatur: 28,
    qualität: "gut",
    lat: 19.7500,
    lng: -70.4167,
    beschreibung: "Tropisches Kite-Paradies",
  },
];

const regionen = ["Alle", "Spanien", "Deutschland", "Marokko", "Dominikanische Republik"];
const windrichtungen = ["Alle", "Nord", "Ost", "Süd", "West"];

export default function OverviewPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("Alle");
  const [selectedWindrichtung, setSelectedWindrichtung] = useState("Alle");
  const [mindestWind, setMindestWind] = useState("");
  const [maxTemperatur, setMaxTemperatur] = useState("");
  const [selectedSpots, setSelectedSpots] = useState<number[]>([]);

  // Filter Logik
  const filteredSpots = mockSpots.filter((spot) => {
    const matchesSearch = spot.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion === "Alle" || spot.region === selectedRegion;
    const matchesWindrichtung = selectedWindrichtung === "Alle" || spot.windrichtung === selectedWindrichtung;
    const matchesMindestWind = !mindestWind || spot.windgeschwindigkeit >= parseInt(mindestWind);
    const matchesMaxTemperatur = !maxTemperatur || spot.temperatur <= parseInt(maxTemperatur);

    return matchesSearch && matchesRegion && matchesWindrichtung && matchesMindestWind && matchesMaxTemperatur;
  });

  // Qualität zu Farbe
  const getQualityColor = (qualität: string) => {
    switch (qualität) {
      case "gut":
        return "success";
      case "mittel":
        return "warning";
      case "schlecht":
        return "danger";
      default:
        return "default";
    }
  };

  // Spot auswählen/abwählen
  const toggleSpotSelection = (spotId: number) => {
    setSelectedSpots((prev) =>
      prev.includes(spotId) ? prev.filter((id) => id !== spotId) : [...prev, spotId]
    );
  };

  const selectedSpotsData = mockSpots.filter((spot) => selectedSpots.includes(spot.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-[1800px] mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-gray-800 dark:text-white">
          Kite Spot Dashboard
        </h1>

        {/* Top Section: Suchleiste + Filter */}
        <Card className="mb-6">
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Input
                placeholder="Spot suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="md:col-span-2"
                startContent={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
              <Select
                label="Region"
                selectedKeys={new Set([selectedRegion])}
                onSelectionChange={(keys) => setSelectedRegion(Array.from(keys)[0] as string)}
              >
                {regionen.map((region) => (
                  <SelectItem key={region}>
                    {region}
                  </SelectItem>
                ))}
              </Select>
              <Select
                label="Windrichtung"
                selectedKeys={new Set([selectedWindrichtung])}
                onSelectionChange={(keys) => setSelectedWindrichtung(Array.from(keys)[0] as string)}
              >
                {windrichtungen.map((richtung) => (
                  <SelectItem key={richtung}>
                    {richtung}
                  </SelectItem>
                ))}
              </Select>
              <Input
                type="number"
                label="Min. Wind (km/h)"
                placeholder="0"
                value={mindestWind}
                onChange={(e) => setMindestWind(e.target.value)}
              />
            </div>
          </CardBody>
        </Card>

        {/* Main Content: Links Spots Liste + Rechts Map */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Links: Spots Liste */}
          <Card className="lg:col-span-1">
            <CardBody>
              <h2 className="text-xl font-semibold mb-4">Spots ({filteredSpots.length})</h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredSpots.map((spot) => (
                  <Card
                    key={spot.id}
                    isPressable
                    isHoverable
                    onPress={() => toggleSpotSelection(spot.id)}
                    className={`${
                      selectedSpots.includes(spot.id) ? "border-2 border-blue-500" : ""
                    }`}
                  >
                    <CardBody>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{spot.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {spot.region}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Chip size="sm" variant="flat">
                              {spot.windgeschwindigkeit} km/h
                            </Chip>
                            <Chip size="sm" variant="flat">
                              {spot.temperatur}°C
                            </Chip>
                          </div>
                        </div>
                        <Chip color={getQualityColor(spot.qualität)} variant="dot">
                          {spot.qualität}
                        </Chip>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Rechts: Map mit Leaflet */}
          <Card className="lg:col-span-2">
            <CardBody>
              <h2 className="text-xl font-semibold mb-4">Karte</h2>
              <MapComponent
                spots={filteredSpots}
                onSpotClick={toggleSpotSelection}
                selectedSpots={selectedSpots}
              />
            </CardBody>
          </Card>
        </div>

        {/* Bottom: Vergleichstabelle */}
        {selectedSpotsData.length > 0 && (
          <Card>
            <CardBody>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  Spot Vergleich ({selectedSpotsData.length})
                </h2>
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  onPress={() => setSelectedSpots([])}
                >
                  Auswahl löschen
                </Button>
              </div>
              <Table aria-label="Spot Vergleichstabelle">
                <TableHeader>
                  <TableColumn>NAME</TableColumn>
                  <TableColumn>REGION</TableColumn>
                  <TableColumn>WINDRICHTUNG</TableColumn>
                  <TableColumn>WIND (km/h)</TableColumn>
                  <TableColumn>TEMPERATUR</TableColumn>
                  <TableColumn>QUALITÄT</TableColumn>
                  <TableColumn>BESCHREIBUNG</TableColumn>
                </TableHeader>
                <TableBody>
                  {selectedSpotsData.map((spot) => (
                    <TableRow key={spot.id}>
                      <TableCell className="font-semibold">{spot.name}</TableCell>
                      <TableCell>{spot.region}</TableCell>
                      <TableCell>{spot.windrichtung}</TableCell>
                      <TableCell>{spot.windgeschwindigkeit}</TableCell>
                      <TableCell>{spot.temperatur}°C</TableCell>
                      <TableCell>
                        <Chip color={getQualityColor(spot.qualität)} size="sm">
                          {spot.qualität}
                        </Chip>
                      </TableCell>
                      <TableCell className="text-sm">{spot.beschreibung}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
