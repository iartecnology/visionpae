-- Backfill lat/lng for productores without coordinates
-- Assign random positions within Colombia bounding box,
-- clustered loosely by departamento for realism.
DO $$
DECLARE
  r RECORD;
  lat_base NUMERIC;
  lng_base NUMERIC;
  cf numeric;
BEGIN
  FOR r IN SELECT id, codigo_departamento FROM productores WHERE latitud IS NULL OR longitud IS NULL LOOP
    cf := random();
    -- Approximate centroid per departamento (DANE code -> lat/lng)
    lat_base := CASE r.codigo_departamento
      WHEN '05' THEN  6.25  -- Antioquia
      WHEN '08' THEN 10.98  -- Atlántico
      WHEN '11' THEN  4.65  -- Bogotá D.C.
      WHEN '13' THEN  9.30  -- Bolívar
      WHEN '15' THEN  5.50  -- Boyacá
      WHEN '17' THEN  5.06  -- Caldas
      WHEN '18' THEN  1.20  -- Caquetá
      WHEN '19' THEN  2.57  -- Cauca
      WHEN '20' THEN  9.30  -- Cesar
      WHEN '23' THEN  8.30  -- Córdoba
      WHEN '25' THEN  4.50  -- Cundinamarca
      WHEN '27' THEN  5.60  -- Chocó
      WHEN '41' THEN  3.40  -- Huila
      WHEN '44' THEN 10.40  -- La Guajira
      WHEN '47' THEN 11.00  -- Magdalena
      WHEN '50' THEN  3.80  -- Meta
      WHEN '52' THEN  1.30  -- Nariño
      WHEN '54' THEN  7.90  -- Nte de Santander
      WHEN '63' THEN  4.50  -- Quindío
      WHEN '66' THEN  4.80  -- Risaralda
      WHEN '68' THEN  6.80  -- Santander
      WHEN '70' THEN  9.30  -- Sucre
      WHEN '73' THEN  4.30  -- Tolima
      WHEN '76' THEN  3.70  -- Valle del Cauca
      WHEN '81' THEN  6.20  -- Arauca
      WHEN '85' THEN  5.50  -- Casanare
      WHEN '86' --  Putumayo
           THEN  1.00
      WHEN '88' THEN  5.00  -- San Andrés
      WHEN '91' THEN -0.50  -- Amazonas
      WHEN '94' THEN  3.50  -- Guainía
      WHEN '95' THEN  2.00  -- Guaviare
      WHEN '97' THEN  0.80  -- Vaupés
      WHEN '99' THEN  4.50  -- Vichada
      ELSE 4.60
    END;
    lng_base := CASE r.codigo_departamento
      WHEN '05' THEN -75.60
      WHEN '08' THEN -74.80
      WHEN '11' THEN -74.08
      WHEN '13' THEN -75.30
      WHEN '15' THEN -73.40
      WHEN '17' THEN -75.60
      WHEN '18' THEN -73.70
      WHEN '19' THEN -76.70
      WHEN '20' THEN -73.50
      WHEN '23' THEN -75.50
      WHEN '25' THEN -74.00
      WHEN '27' THEN -77.00
      WHEN '41' THEN -75.30
      WHEN '44' THEN -72.80
      WHEN '47' THEN -74.20
      WHEN '50' THEN -73.50
      WHEN '52' THEN -77.50
      WHEN '54' THEN -72.50
      WHEN '63' THEN -75.70
      WHEN '66' THEN -75.80
      WHEN '68' THEN -73.30
      WHEN '70' THEN -75.30
      WHEN '73' THEN -75.20
      WHEN '76' THEN -76.50
      WHEN '81' THEN -69.50
      WHEN '85' THEN -72.10
      WHEN '86' THEN -76.50
      WHEN '88' THEN -81.70
      WHEN '91' THEN -72.50
      WHEN '94' THEN -70.00
      WHEN '95' THEN -72.50
      WHEN '97' THEN -70.50
      WHEN '99' THEN -70.00
      ELSE -74.00
    END;
    -- Random offset ±0.3° (~30 km)
    UPDATE productores
    SET
      latitud = lat_base + (random() - 0.5) * 0.6,
      longitud = lng_base + (random() - 0.5) * 0.6
    WHERE id = r.id;
  END LOOP;
END $$;
