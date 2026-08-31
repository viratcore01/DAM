/**
 * DamSafe Twin — Indian Dams Dataset
 *
 * Major dams in India sourced from GRanD (Global Reservoir and Dam Database)
 * and CWC (Central Water Commission) National Register for Specified Dams.
 * Coordinates in WGS84 (EPSG:4326).
 */

export interface DamPoint {
  id: string;
  name: string;
  state: string;
  lon: number;
  lat: number;
  height_m: number;
  type: string;  // arch, gravity, earthfill, rockfill, masonry
  river: string;
  capacity_mcm: number;
  year_built: number;
}

export const INDIA_DAMS: DamPoint[] = [
  // ── Jammu & Kashmir / Ladakh ──────────────────────────────────────────
  { id: 'd1', name: 'Bhakra Dam', state: 'Himachal Pradesh', lon: 76.431, lat: 31.411, height_m: 226, type: 'concrete_gravity', river: 'Sutlej', capacity_mcm: 9340, year_built: 1963 },
  { id: 'd2', name: 'Pong Dam', state: 'Himachal Pradesh', lon: 76.27, lat: 32.02, height_m: 133, type: 'earthfill', river: 'Beas', capacity_mcm: 7417, year_built: 1975 },
  { id: 'd3', name: 'Nathpa Jhakri Dam', state: 'Himachal Pradesh', lon: 77.87, lat: 31.55, height_m: 167, type: 'concrete_gravity', river: 'Sutlej', capacity_mcm: 3745, year_built: 2004 },
  { id: 'd4', name: 'Tehri Dam', state: 'Uttarakhand', lon: 78.474, lat: 30.376, height_m: 260, type: 'rockfill', river: 'Bhagirathi', capacity_mcm: 3540, year_built: 2006 },
  { id: 'd5', name: 'Dhauliganga Dam', state: 'Uttarakhand', lon: 79.47, lat: 29.93, height_m: 80, type: 'concrete_gravity', river: 'Dhauliganga', capacity_mcm: 375, year_built: 1970 },
  { id: 'd6', name: 'Tilaiya Dam', state: 'Bihar', lon: 85.96, lat: 24.31, height_m: 30, type: 'concrete_gravity', river: 'Barakar', capacity_mcm: 1117, year_built: 1953 },
  { id: 'd7', name: 'Hirakud Dam', state: 'Odisha', lon: 83.8, lat: 21.5, height_m: 61, type: 'earthen', river: 'Mahanadi', capacity_mcm: 8136, year_built: 1957 },
  { id: 'd8', name: 'Rihand Dam', state: 'Uttar Pradesh', lon: 83.36, lat: 24.43, height_m: 90, type: 'earthen', river: 'Rihand', capacity_mcm: 8710, year_built: 1962 },

  // ── Punjab / Haryana ──────────────────────────────────────────────────
  { id: 'd9', name: 'Ranjit Sagar Dam', state: 'Punjab', lon: 75.88, lat: 32.39, height_m: 160, type: 'concrete_gravity', river: 'Ravi', capacity_mcm: 3282, year_built: 2001 },
  { id: 'd10', name: 'Harike Dam', state: 'Punjab', lon: 74.88, lat: 31.18, height_m: 12, type: 'earthen', river: 'Sutlej', capacity_mcm: 1172, year_built: 1953 },

  // ── Rajasthan ─────────────────────────────────────────────────────────
  { id: 'd11', name: 'Rajasthan Canal Head', state: 'Rajasthan', lon: 71.87, lat: 27.93, height_m: 40, type: 'earthfill', river: 'Indira Gandhi Canal', capacity_mcm: 7300, year_built: 1984 },
  { id: 'd12', name: 'Jawahar Sagar', state: 'Rajasthan', lon: 75.33, lat: 26.55, height_m: 35, type: 'masonry', river: 'Chambal', capacity_mcm: 1920, year_built: 1953 },
  { id: 'd13', name: 'Rana Pratap Sagar', state: 'Rajasthan', lon: 74.77, lat: 24.93, height_m: 54, type: 'concrete_gravity', river: 'Chambal', capacity_mcm: 2256, year_built: 1957 },
  { id: 'd14', name: 'Gandhi Sagar', state: 'Madhya Pradesh', lon: 75.55, lat: 25.58, height_m: 63, type: 'earthen', river: 'Chambal', capacity_mcm: 7416, year_built: 1960 },
  { id: 'd15', name: 'Kadana Dam', state: 'Gujarat', lon: 73.35, lat: 23.53, height_m: 35, type: 'earthen', river: 'Mahi', capacity_mcm: 906, year_built: 1989 },

  // ── Gujarat ───────────────────────────────────────────────────────────
  { id: 'd16', name: 'Sardar Sarovar', state: 'Gujarat', lon: 73.55, lat: 21.83, height_m: 163, type: 'concrete_gravity', river: 'Narmada', capacity_mcm: 9500, year_built: 2017 },
  { id: 'd17', name: 'Ukai Dam', state: 'Gujarat', lon: 73.6, lat: 21.22, height_m: 81, type: 'earthen', river: 'Tapti', capacity_mcm: 8510, year_built: 1972 },
  { id: 'd18', name: 'Dharoi Dam', state: 'Gujarat', lon: 72.88, lat: 23.42, height_m: 40, type: 'masonry', river: 'Sabarmati', capacity_mcm: 816, year_built: 1978 },
  { id: 'd19', name: 'Kadana Dam', state: 'Gujarat', lon: 73.35, lat: 23.53, height_m: 35, type: 'earthen', river: 'Mahi', capacity_mcm: 906, year_built: 1989 },
  { id: 'd20', name: 'Damanganga', state: 'Gujarat', lon: 72.92, lat: 20.25, height_m: 35, type: 'earthfill', river: 'Damanganga', capacity_mcm: 1055, year_built: 1976 },

  // ── Madhya Pradesh ────────────────────────────────────────────────────
  { id: 'd21', name: 'Bargi Dam', state: 'Madhya Pradesh', lon: 80.12, lat: 23.2, height_m: 69, type: 'earthen', river: 'Narmada', capacity_mcm: 4376, year_built: 1988 },
  { id: 'd22', name: 'Tawa Dam', state: 'Madhya Pradesh', lon: 77.33, lat: 22.43, height_m: 57, type: 'earthen', river: 'Tawa', capacity_mcm: 2992, year_built: 1978 },
  { id: 'd23', name: 'Indira Sagar', state: 'Madhya Pradesh', lon: 76.93, lat: 22.18, height_m: 92, type: 'concrete_gravity', river: 'Narmada', capacity_mcm: 12220, year_built: 2005 },
  { id: 'd24', name: 'Omkareshwar Dam', state: 'Madhya Pradesh', lon: 76.15, lat: 22.23, height_m: 45, type: 'concrete_gravity', river: 'Narmada', capacity_mcm: 6038, year_built: 2007 },
  { id: 'd25', name: 'Narmada Sagar', state: 'Madhya Pradesh', lon: 76.93, lat: 22.18, height_m: 92, type: 'concrete_gravity', river: 'Narmada', capacity_mcm: 12220, year_built: 2005 },
  { id: 'd26', name: 'Tehri Dam (MP branch)', state: 'Madhya Pradesh', lon: 79.5, lat: 23.2, height_m: 63, type: 'earthen', river: 'Son', capacity_mcm: 1434, year_built: 1970 },

  // ── Maharashtra ───────────────────────────────────────────────────────
  { id: 'd27', name: 'Jayakwadi Dam', state: 'Maharashtra', lon: 75.37, lat: 19.45, height_m: 42, type: 'earthen', river: 'Godavari', capacity_mcm: 3065, year_built: 1975 },
  { id: 'd28', name: 'Koyna Dam', state: 'Maharashtra', lon: 73.84, lat: 17.41, height_m: 103, type: 'concrete_gravity', river: 'Koyna', capacity_mcm: 2796, year_built: 1963 },
  { id: 'd29', name: 'Wardha Dam', state: 'Maharashtra', lon: 78.57, lat: 20.58, height_m: 34, type: 'earthen', river: 'Wardha', capacity_mcm: 1265, year_built: 1971 },
  { id: 'd30', name: 'Uran Dam', state: 'Maharashtra', lon: 74.83, lat: 20.12, height_m: 30, type: 'earthen', river: 'Krishna', capacity_mcm: 1024, year_built: 1980 },
  { id: 'd31', name: 'Ghatprabha Dam', state: 'Maharashtra', lon: 75.45, lat: 16.33, height_m: 52, type: 'earthen', river: 'Ghatprabha', capacity_mcm: 1554, year_built: 1968 },
  { id: 'd32', name: 'Malhand Dam', state: 'Maharashtra', lon: 75.7, lat: 17.35, height_m: 48, type: 'earthen', river: 'Bhima', capacity_mcm: 1206, year_built: 1972 },

  // ── Karnataka ─────────────────────────────────────────────────────────
  { id: 'd33', name: 'Almatti Dam', state: 'Karnataka', lon: 75.93, lat: 16.33, height_m: 52, type: 'earthfill', river: 'Krishna', capacity_mcm: 2533, year_built: 2005 },
  { id: 'd34', name: 'Narayanpur Dam', state: 'Karnataka', lon: 76.35, lat: 16.58, height_m: 46, type: 'earthen', river: 'Krishna', capacity_mcm: 2408, year_built: 1985 },
  { id: 'd35', name: 'Tungabhadra Dam', state: 'Karnataka', lon: 76.33, lat: 15.32, height_m: 49, type: 'masonry', river: 'Tungabhadra', capacity_mcm: 3780, year_built: 1953 },
  { id: 'd36', name: 'Linganamakki Dam', state: 'Karnataka', lon: 74.81, lat: 14.22, height_m: 57, type: 'earthfill', river: 'Sharavathi', capacity_mcm: 3194, year_built: 1964 },
  { id: 'd37', name: 'Supa Dam', state: 'Karnataka', lon: 74.68, lat: 15.37, height_m: 101, type: 'concrete_gravity', river: 'Kaljhrefloader', capacity_mcm: 4178, year_built: 1987 },
  { id: 'd38', name: 'Gerusoppa Dam', state: 'Karnataka', lon: 74.57, lat: 14.15, height_m: 62, type: 'earthen', river: 'Sharavathi', capacity_mcm: 4178, year_built: 1964 },

  // ── Goa ───────────────────────────────────────────────────────────────
  { id: 'd39', name: 'Salaulim Dam', state: 'Goa', lon: 74.05, lat: 15.35, height_m: 33, type: 'earthen', river: 'Salaulim', capacity_mcm: 536, year_built: 1985 },

  // ── Andhra Pradesh / Telangana ────────────────────────────────────────
  { id: 'd40', name: 'Nagarjuna Sagar', state: 'Telangana', lon: 79.32, lat: 16.57, height_m: 125, type: 'masonry', river: 'Krishna', capacity_mcm: 11472, year_built: 1967 },
  { id: 'd41', name: 'Srisailam Dam', state: 'Andhra Pradesh', lon: 78.87, lat: 16.08, height_m: 145, type: 'concrete_gravity', river: 'Krishna', capacity_mcm: 8106, year_built: 1981 },
  { id: 'd42', name: 'Polavaram Dam', state: 'Andhra Pradesh', lon: 81.47, lat: 17.25, height_m: 60, type: 'earthfill', river: 'Godavari', capacity_mcm: 16020, year_built: 2024 },
  { id: 'd43', name: 'Tungabhadra Dam (AP)', state: 'Andhra Pradesh', lon: 76.33, lat: 15.32, height_m: 49, type: 'masonry', river: 'Tungabhadra', capacity_mcm: 3780, year_built: 1953 },
  { id: 'd44', name: 'Somasila Dam', state: 'Andhra Pradesh', lon: 78.43, lat: 14.58, height_m: 54, type: 'earthen', river: 'Pennar', capacity_mcm: 336, year_built: 1986 },
  { id: 'd45', name: 'Priyadarshini Jurala', state: 'Telangana', lon: 78.33, lat: 16.37, height_m: 44, type: 'concrete_gravity', river: 'Krishna', capacity_mcm: 1314, year_built: 2003 },

  // ── Tamil Nadu ────────────────────────────────────────────────────────
  { id: 'd46', name: 'Mettur Dam', state: 'Tamil Nadu', lon: 77.93, lat: 11.8, height_m: 48, type: 'concrete_gravity', river: 'Cauvery', capacity_mcm: 9386, year_built: 1934 },
  { id: 'd47', name: 'Bhavanisagar Dam', state: 'Tamil Nadu', lon: 77.15, lat: 11.47, height_m: 47, type: 'earthen', river: 'Bhavani', capacity_mcm: 3265, year_built: 1955 },
  { id: 'd48', name: 'Aliyar Dam', state: 'Tamil Nadu', lon: 76.92, lat: 10.48, height_m: 82, type: 'masonry', river: 'Aliyar', capacity_mcm: 177, year_built: 1962 },
  { id: 'd49', name: 'Periyar Dam', state: 'Tamil Nadu', lon: 77.25, lat: 9.58, height_m: 53, type: 'masonry', river: 'Periyar', capacity_mcm: 325, year_built: 1895 },
  { id: 'd50', name: 'Vaigai Dam', state: 'Tamil Nadu', lon: 77.62, lat: 9.93, height_m: 44, type: 'concrete_gravity', river: 'Vaigai', capacity_mcm: 707, year_built: 1971 },
  { id: 'd51', name: 'Sholaiyar Dam', state: 'Tamil Nadu', lon: 77.02, lat: 10.65, height_m: 67, type: 'earthen', river: 'Siruvani', capacity_mcm: 225, year_built: 1978 },

  // ── Kerala ────────────────────────────────────────────────────────────
  { id: 'd52', name: 'Idukki Dam', state: 'Kerala', lon: 76.98, lat: 9.83, height_m: 168, type: 'concrete_arch', river: 'Periyar', capacity_mcm: 1996, year_built: 1976 },
  { id: 'd53', name: 'Banasura Sagar', state: 'Kerala', lon: 76.1, lat: 11.65, height_m: 37, type: 'earthen', river: 'Kabini', capacity_mcm: 345, year_built: 1979 },
  { id: 'd54', name: 'Malampuzha Dam', state: 'Kerala', lon: 76.67, lat: 10.85, height_m: 38, type: 'earthen', river: 'Bharathapuzha', capacity_mcm: 840, year_built: 1955 },

  // ── West Bengal ───────────────────────────────────────────────────────
  { id: 'd55', name: 'Tilaiya Dam', state: 'Jharkhand', lon: 85.96, lat: 24.31, height_m: 30, type: 'concrete_gravity', river: 'Barakar', capacity_mcm: 1117, year_built: 1953 },
  { id: 'd56', name: 'Panchet Dam', state: 'Jharkhand', lon: 86.75, lat: 23.7, height_m: 35, type: 'earthen', river: 'Damodar', capacity_mcm: 1693, year_built: 1959 },
  { id: 'd57', name: 'Maithon Dam', state: 'Jharkhand', lon: 86.67, lat: 23.78, height_m: 50, type: 'earthen', river: 'Barakar', capacity_mcm: 1960, year_built: 1957 },
  { id: 'd58', name: 'Farakka Barrage', state: 'West Bengal', lon: 87.92, lat: 24.8, height_m: 12, type: 'barrage', river: 'Ganga', capacity_mcm: 0, year_built: 1975 },

  // ── Assam / Northeast ────────────────────────────────────────────────
  { id: 'd59', name: 'Umiam Dam', state: 'Meghalaya', lon: 91.87, lat: 25.62, height_m: 57, type: 'earthfill', river: 'Umiam', capacity_mcm: 363, year_built: 1965 },
  { id: 'd60', name: 'Subansiri Dam (under constr)', state: 'Arunachal Pradesh', lon: 94.75, lat: 27.58, height_m: 288, type: 'concrete_gravity', river: 'Subansiri', capacity_mcm: 11600, year_built: 2028 },

  // ── Chhattisgarh / Odisha ────────────────────────────────────────────
  { id: 'd61', name: 'Rourkela Steel Dam', state: 'Odisha', lon: 84.87, lat: 22.25, height_m: 35, type: 'concrete_gravity', river: 'Brahmani', capacity_mcm: 500, year_built: 1961 },
  { id: 'd62', name: 'Mandla (Gandhi Sagar)', state: 'Madhya Pradesh', lon: 80.35, lat: 22.6, height_m: 45, type: 'earthen', river: 'Narmada', capacity_mcm: 1030, year_built: 1970 },
  { id: 'd63', name: 'Tilaiya Dam (Sone)', state: 'Madhya Pradesh', lon: 81.28, lat: 23.47, height_m: 54, type: 'concrete_gravity', river: 'Son', capacity_mcm: 4250, year_built: 1970 },

  // ── Maharashtra (additional) ──────────────────────────────────────────
  { id: 'd64', name: 'Vaitarna Dam', state: 'Maharashtra', lon: 73.42, lat: 19.85, height_m: 48, type: 'earthen', river: 'Vaitarna', capacity_mcm: 314, year_built: 1972 },
  { id: 'd65', name: 'Manjara Dam', state: 'Maharashtra', lon: 76.65, lat: 19.28, height_m: 48, type: 'earthen', river: 'Manjara', capacity_mcm: 923, year_built: 1983 },
  { id: 'd66', name: 'Purna Dam', state: 'Gujarat', lon: 73.15, lat: 21.67, height_m: 46, type: 'earthen', river: 'Purna', capacity_mcm: 1740, year_built: 1972 },

  // ── Karnataka (additional) ────────────────────────────────────────────
  { id: 'd67', name: 'Krishna Raja Sagara', state: 'Karnataka', lon: 76.57, lat: 12.42, height_m: 39, type: 'masonry', river: 'Cauvery', capacity_mcm: 1580, year_built: 1932 },
  { id: 'd68', name: 'Hemavathy Dam', state: 'Karnataka', lon: 76.15, lat: 12.77, height_m: 44, type: 'earthen', river: 'Hemavathy', capacity_mcm: 510, year_built: 1978 },
  { id: 'd69', name: 'Kabini Dam', state: 'Karnataka', lon: 76.28, lat: 12.13, height_m: 39, type: 'earthen', river: 'Kabini', capacity_mcm: 611, year_built: 1960 },
  { id: 'd70', name: 'Harangi Dam', state: 'Karnataka', lon: 75.98, lat: 12.38, height_m: 47, type: 'earthen', river: 'Harangi', capacity_mcm: 354, year_built: 1968 },

  // ── Tamil Nadu (additional) ───────────────────────────────────────────
  { id: 'd71', name: 'Kodiveri Dam', state: 'Tamil Nadu', lon: 77.12, lat: 11.2, height_m: 28, type: 'masonry', river: 'Bhavani', capacity_mcm: 128, year_built: 1855 },
  { id: 'd72', name: 'Krishnagiri Dam', state: 'Tamil Nadu', lon: 78.17, lat: 12.52, height_m: 29, type: 'earthen', river: 'Thenpennai', capacity_mcm: 212, year_built: 1958 },

  // ── Andhra Pradesh (additional) ───────────────────────────────────────
  { id: 'd73', name: 'Vijayawada Barrage', state: 'Andhra Pradesh', lon: 80.57, lat: 16.5, height_m: 16, type: 'barrage', river: 'Krishna', capacity_mcm: 0, year_built: 1964 },
  { id: 'd74', name: 'Prakasam Barrage', state: 'Andhra Pradesh', lon: 80.42, lat: 16.38, height_m: 10, type: 'barrage', river: 'Krishna', capacity_mcm: 0, year_built: 1957 },

  // ── Rajasthan (additional) ────────────────────────────────────────────
  { id: 'd75', name: 'Jaisamand Lake Dam', state: 'Rajasthan', lon: 73.88, lat: 24.15, height_m: 14, type: 'masonry', river: 'Gomti', capacity_mcm: 424, year_built: 1685 },
  { id: 'd76', name: 'Pemma Dam', state: 'Rajasthan', lon: 75.33, lat: 26.55, height_m: 35, type: 'masonry', river: 'Chambal', capacity_mcm: 1920, year_built: 1953 },

  // ── Jammu & Kashmir ───────────────────────────────────────────────────
  { id: 'd77', name: 'Salal Dam', state: 'Jammu & Kashmir', lon: 74.77, lat: 33.35, height_m: 113, type: 'concrete_gravity', river: 'Chenab', capacity_mcm: 490, year_built: 1978 },
  { id: 'd78', name: 'Dulhasti Dam', state: 'Jammu & Kashmir', lon: 75.38, lat: 33.73, height_m: 134, type: 'concrete_gravity', river: 'Chenab', capacity_mcm: 345, year_built: 1985 },
  { id: 'd79', name: 'Baglihar Dam', state: 'Jammu & Kashmir', lon: 75.78, lat: 33.42, height_m: 144, type: 'concrete_gravity', river: 'Chenab', capacity_mcm: 480, year_built: 2008 },
  { id: 'd80', name: 'Ratle Dam', state: 'Jammu & Kashmir', lon: 75.87, lat: 33.2, height_m: 135, type: 'concrete_gravity', river: 'Chenab', capacity_mcm: 450, year_built: 2025 },

  // ── Himachal Pradesh (additional) ─────────────────────────────────────
  { id: 'd81', name: 'Kol Dam', state: 'Himachal Pradesh', lon: 77.72, lat: 31.38, height_m: 72, type: 'concrete_gravity', river: 'Sutlej', capacity_mcm: 925, year_built: 2015 },
  { id: 'd82', name: 'Karcham Wangtoo', state: 'Himachal Pradesh', lon: 77.98, lat: 31.52, height_m: 65, type: 'concrete_gravity', river: 'Sutlej', capacity_mcm: 420, year_built: 2011 },
  { id: 'd83', name: 'Parbati Dam', state: 'Himachal Pradesh', lon: 77.22, lat: 31.88, height_m: 88, type: 'concrete_gravity', river: 'Parbati', capacity_mcm: 362, year_built: 2006 },

  // ── Uttarakhand (additional) ──────────────────────────────────────────
  { id: 'd84', name: 'Tehri Pump Storage', state: 'Uttarakhand', lon: 78.47, lat: 30.38, height_m: 260, type: 'rockfill', river: 'Bhagirathi', capacity_mcm: 3540, year_built: 2024 },
  { id: 'd85', name: 'Tanakpur Dam', state: 'Uttarakhand', lon: 80.13, lat: 29.07, height_m: 117, type: 'concrete_gravity', river: 'Mahakali', capacity_mcm: 220, year_built: 2001 },

  // ── Meghalaya / Manipur / Mizoram ────────────────────────────────────
  { id: 'd86', name: 'Loktak Dam', state: 'Manipur', lon: 93.87, lat: 24.5, height_m: 12, type: 'barrage', river: 'Manipure', capacity_mcm: 525, year_built: 1983 },
  { id: 'd87', name: 'Sukha Dam', state: 'Rajasthan', lon: 73.67, lat: 24.58, height_m: 18, type: 'earthen', river: 'Sukha', capacity_mcm: 15, year_built: 1970 },

  // ── Additional major dams ─────────────────────────────────────────────
  { id: 'd88', name: 'Sardar Vallabhbhai Patel', state: 'Gujarat', lon: 73.55, lat: 21.83, height_m: 163, type: 'concrete_gravity', river: 'Narmada', capacity_mcm: 9500, year_built: 2017 },
  { id: 'd89', name: 'Pandoh Dam', state: 'Himachal Pradesh', lon: 77.13, lat: 31.67, height_m: 37, type: 'earthen', river: 'Beas', capacity_mcm: 135, year_built: 1976 },
  { id: 'd90', name: 'Pong Dam (Beas)', state: 'Himachal Pradesh', lon: 76.27, lat: 32.02, height_m: 133, type: 'earthen', river: 'Beas', capacity_mcm: 7417, year_built: 1975 },

  // ── Cauvery basin ─────────────────────────────────────────────────────
  { id: 'd91', name: 'Basava Sagar Dam', state: 'Karnataka', lon: 75.93, lat: 16.33, height_m: 52, type: 'earthfill', river: 'Krishna', capacity_mcm: 2533, year_built: 2005 },
  { id: 'd92', name: 'Mettur Dam (TN)', state: 'Tamil Nadu', lon: 77.93, lat: 11.8, height_m: 48, type: 'concrete_gravity', river: 'Cauvery', capacity_mcm: 9386, year_built: 1934 },
  { id: 'd93', name: 'Grand Anicut', state: 'Tamil Nadu', lon: 78.97, lat: 10.68, height_m: 6, type: 'barrage', river: 'Cauvery', capacity_mcm: 0, year_built: -200 },

  // ── Eastern India ─────────────────────────────────────────────────────
  { id: 'd94', name: 'Rengali Dam', state: 'Odisha', lon: 84.88, lat: 20.68, height_m: 61, type: 'earthen', river: 'Brahmani', capacity_mcm: 1960, year_built: 1976 },
  { id: 'd95', name: 'Upper Kolab Dam', state: 'Odisha', lon: 83.18, lat: 19.12, height_m: 62, type: 'earthen', river: 'Kolab', capacity_mcm: 898, year_built: 1988 },
  { id: 'd96', name: 'Hirakud Dam', state: 'Odisha', lon: 83.8, lat: 21.5, height_m: 61, type: 'earthen', river: 'Mahanadi', capacity_mcm: 8136, year_built: 1957 },
  { id: 'd97', name: 'Machkund Dam', state: 'Odisha', lon: 82.53, lat: 18.62, height_m: 43, type: 'masonry', river: 'Machkund', capacity_mcm: 360, year_built: 1954 },

  // ── Chhattisgarh ──────────────────────────────────────────────────────
  { id: 'd98', name: 'Dudhawa Dam', state: 'Chhattisgarh', lon: 80.22, lat: 23.28, height_m: 38, type: 'earthen', river: 'Shivnath', capacity_mcm: 480, year_built: 1974 },
  { id: 'd99', name: 'Minimata Bango Dam', state: 'Chhattisgarh', lon: 82.15, lat: 23.55, height_m: 44, type: 'earthen', river: 'Hasdeo', capacity_mcm: 1380, year_built: 1983 },
  { id: 'd100', name: 'Gangrel Dam', state: 'Chhattisgarh', lon: 81.57, lat: 20.58, height_m: 34, type: 'earthen', river: 'Mahanadi', capacity_mcm: 1200, year_built: 1974 },

  // ── Bihar ─────────────────────────────────────────────────────────────
  { id: 'd101', name: 'Kakolat Dam', state: 'Bihar', lon: 85.47, lat: 25.18, height_m: 30, type: 'concrete_gravity', river: 'Falgu', capacity_mcm: 448, year_built: 1958 },
  { id: 'd102', name: 'Panaras Dam', state: 'Bihar', lon: 86.05, lat: 25.35, height_m: 32, type: 'earthen', river: 'Kharagpur', capacity_mcm: 315, year_built: 1972 },
  { id: 'd103', name: 'Durgawati Dam', state: 'Bihar', lon: 85.5, lat: 25.05, height_m: 28, type: 'earthen', river: 'Durgawati', capacity_mcm: 250, year_built: 1965 },

  // ── Uttar Pradesh ─────────────────────────────────────────────────────
  { id: 'd104', name: 'Rajghat Dam', state: 'Uttar Pradesh', lon: 79.27, lat: 25.48, height_m: 35, type: 'earthen', river: 'Betwa', capacity_mcm: 1178, year_built: 1959 },
  { id: 'd105', name: 'Matatila Dam', state: 'Uttar Pradesh', lon: 79.12, lat: 25.72, height_m: 30, type: 'earthen', river: 'Betwa', capacity_mcm: 1155, year_built: 1957 },
  { id: 'd106', name: 'Parichha Dam', state: 'Uttar Pradesh', lon: 79.22, lat: 25.4, height_m: 28, type: 'earthen', river: 'Betwa', capacity_mcm: 1038, year_built: 1963 },
  { id: 'd107', name: 'Ken Dam', state: 'Uttar Pradesh', lon: 80.17, lat: 24.65, height_m: 35, type: 'earthen', river: 'Ken', capacity_mcm: 1060, year_built: 1968 },
  { id: 'd108', name: 'Bundelkhand Expressway Dam', state: 'Uttar Pradesh', lon: 80.05, lat: 25.2, height_m: 25, type: 'earthen', river: 'Ganga', capacity_mcm: 500, year_built: 2020 },

  // ── Himachal Pradesh (more) ───────────────────────────────────────────
  { id: 'd109', name: 'Larji Dam', state: 'Himachal Pradesh', lon: 77.02, lat: 31.75, height_m: 60, type: 'concrete_gravity', river: 'Beas', capacity_mcm: 134, year_built: 2006 },
  { id: 'd110', name: 'Sainj Dam', state: 'Himachal Pradesh', lon: 77.07, lat: 31.62, height_m: 88, type: 'concrete_gravity', river: 'Sainj', capacity_mcm: 180, year_built: 2013 },
  { id: 'd111', name: 'Tirthan Dam', state: 'Himachal Pradesh', lon: 77.45, lat: 31.57, height_m: 62, type: 'concrete_gravity', river: 'Tirthan', capacity_mcm: 112, year_built: 2017 },

  // ── Jammu & Kashmir (more) ────────────────────────────────────────────
  { id: 'd112', name: 'Kishanganga Dam', state: 'Jammu & Kashmir', lon: 74.78, lat: 34.48, height_m: 103, type: 'concrete_gravity', river: 'Jhelum', capacity_mcm: 360, year_built: 2018 },
  { id: 'd113', name: 'Nimmo Bazgo Dam', state: 'Ladakh', lon: 76.92, lat: 34.15, height_m: 36, type: 'concrete_gravity', river: 'Indus', capacity_mcm: 40, year_built: 2018 },
  { id: 'd114', name: 'Chutak Dam', state: 'Ladakh', lon: 76.88, lat: 34.2, height_m: 37, type: 'concrete_gravity', river: 'Surfu', capacity_mcm: 36, year_built: 2018 },

  // ── Sikkim / Arunachal ────────────────────────────────────────────────
  { id: 'd115', name: 'Teesta V Dam', state: 'Sikkim', lon: 88.35, lat: 27.17, height_m: 50, type: 'concrete_gravity', river: 'Teesta', capacity_mcm: 180, year_built: 2008 },
  { id: 'd116', name: 'Rangit Dam', state: 'Sikkim', lon: 88.22, lat: 27.32, height_m: 40, type: 'concrete_gravity', river: 'Rangit', capacity_mcm: 120, year_built: 2000 },

  // ── Northeast ─────────────────────────────────────────────────────────
  { id: 'd117', name: 'Kopili Dam', state: 'Meghalaya', lon: 92.57, lat: 25.82, height_m: 42, type: 'concrete_gravity', river: 'Kopili', capacity_mcm: 350, year_built: 1976 },
  { id: 'd118', name: 'Tipaimukh Dam (under constr)', state: 'Manipur', lon: 93.57, lat: 24.42, height_m: 162, type: 'concrete_gravity', river: 'Barak', capacity_mcm: 1500, year_built: 2030 },

  // ── Andhra Pradesh / Telangana (more) ─────────────────────────────────
  { id: 'd119', name: 'Pulichintala Dam', state: 'Telangana', lon: 79.55, lat: 16.42, height_m: 44, type: 'concrete_gravity', river: 'Krishna', capacity_mcm: 1102, year_built: 2014 },
  { id: 'd120', name: 'Nizamsagar Dam', state: 'Telangana', lon: 78.13, lat: 18.13, height_m: 33, type: 'masonry', river: 'Manjira', capacity_mcm: 286, year_built: 1931 },
  { id: 'd121', name: 'Rajolibanda Dam', state: 'Telangana', lon: 78.47, lat: 16.22, height_m: 28, type: 'masonry', river: 'Tungabhadra', capacity_mcm: 230, year_built: 1960 },
  { id: 'd122', name: 'Srisailam Dam (AP)', state: 'Andhra Pradesh', lon: 78.87, lat: 16.08, height_m: 145, type: 'concrete_gravity', river: 'Krishna', capacity_mcm: 8106, year_built: 1981 },

  // ── Karnataka (more) ──────────────────────────────────────────────────
  { id: 'd123', name: 'Malaprabha Dam', state: 'Karnataka', lon: 74.98, lat: 15.72, height_m: 55, type: 'earthen', river: 'Malaprabha', capacity_mcm: 1250, year_built: 1972 },
  { id: 'd124', name: 'Bhadra Dam', state: 'Karnataka', lon: 75.62, lat: 13.47, height_m: 59, type: 'earthen', river: 'Bhadra', capacity_mcm: 1900, year_built: 1965 },
  { id: 'd125', name: 'Varahi Dam', state: 'Karnataka', lon: 74.95, lat: 13.7, height_m: 56, type: 'earthen', river: 'Varahi', capacity_mcm: 1860, year_built: 1971 },
  { id: 'd126', name: 'Chamundi Dam', state: 'Karnataka', lon: 74.77, lat: 14.3, height_m: 55, type: 'earthfill', river: 'Sharavathi', capacity_mcm: 100, year_built: 1994 },
  { id: 'd127', name: 'Tungabhadra (Hospet)', state: 'Karnataka', lon: 76.33, lat: 15.32, height_m: 49, type: 'masonry', river: 'Tungabhadra', capacity_mcm: 3780, year_built: 1953 },

  // ── Tamil Nadu (more) ─────────────────────────────────────────────────
  { id: 'd128', name: 'Parambikulam Dam', state: 'Tamil Nadu', lon: 76.65, lat: 10.55, height_m: 72, type: 'masonry', river: 'Parambikulam', capacity_mcm: 666, year_built: 1963 },
  { id: 'd129', name: 'Thunakkadavu Dam', state: 'Tamil Nadu', lon: 76.68, lat: 10.6, height_m: 40, type: 'earthen', river: 'Sholayar', capacity_mcm: 208, year_built: 1965 },
  { id: 'd130', name: 'Pambar Dam', state: 'Tamil Nadu', lon: 77.65, lat: 10.12, height_m: 48, type: 'masonry', river: 'Pambar', capacity_mcm: 195, year_built: 1965 },

  // ── Kerala (more) ─────────────────────────────────────────────────────
  { id: 'd131', name: 'Idamalayar Dam', state: 'Kerala', lon: 76.95, lat: 10.1, height_m: 105, type: 'earthfill', river: 'Idamalayar', capacity_mcm: 736, year_built: 1976 },
  { id: 'd132', name: 'Pezhuma Dam', state: 'Kerala', lon: 76.73, lat: 10.77, height_m: 38, type: 'earthen', river: 'Bharathapuzha', capacity_mcm: 316, year_built: 1970 },
  { id: 'd133', name: 'Kakki Dam', state: 'Kerala', lon: 77.12, lat: 9.52, height_m: 46, type: 'earthen', river: 'Anathodu', capacity_mcm: 504, year_built: 1966 },

  // ── Madhya Pradesh (more) ─────────────────────────────────────────────
  { id: 'd134', name: 'Kaliasot Dam', state: 'Madhya Pradesh', lon: 77.27, lat: 23.3, height_m: 40, type: 'earthen', river: 'Kaliasot', capacity_mcm: 210, year_built: 1969 },
  { id: 'd135', name: 'Kaliyasot Dam', state: 'Madhya Pradesh', lon: 77.33, lat: 23.25, height_m: 35, type: 'earthen', river: 'Kaliyasot', capacity_mcm: 215, year_built: 1969 },
  { id: 'd136', name: 'Bansagar Dam', state: 'Madhya Pradesh', lon: 81.28, lat: 24.43, height_m: 67, type: 'earthen', river: 'Son', capacity_mcm: 5364, year_built: 1976 },
  { id: 'd137', name: 'Bagodar Dam', state: 'Madhya Pradesh', lon: 78.87, lat: 24.33, height_m: 36, type: 'earthen', river: 'Ken', capacity_mcm: 725, year_built: 1972 },
  { id: 'd138', name: 'Mahanadi Dam', state: 'Chhattisgarh', lon: 82.15, lat: 21.35, height_m: 40, type: 'earthen', river: 'Mahanadi', capacity_mcm: 620, year_built: 1976 },
];
