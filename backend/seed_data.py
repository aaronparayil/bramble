"""
Data seeding script for BRAMBLE Climate Data Platform
Populates the SQLite database with sample climate data for testing and development.
"""

import sys
import os
from datetime import datetime, timedelta
import random

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import init_db, SessionLocal
from app.models.database_models import ClimateData, DataType, DataSource
from app.core.security import get_password_hash
from app.models.database_models import User


def seed_climate_data():
    """Seed the database with sample climate data"""
    db = SessionLocal()
    
    try:
        print("🌍 Seeding climate data...")
        
        # Sample locations with focus on India
        locations = [
            # Indian Cities
            {"name": "Mumbai", "lat": 19.0760, "lon": 72.8777},
            {"name": "Delhi", "lat": 28.7041, "lon": 77.1025},
            {"name": "Bangalore", "lat": 12.9716, "lon": 77.5946},
            {"name": "Hyderabad", "lat": 17.3850, "lon": 78.4867},
            {"name": "Chennai", "lat": 13.0827, "lon": 80.2707},
            {"name": "Kolkata", "lat": 22.5726, "lon": 88.3639},
            {"name": "Pune", "lat": 18.5204, "lon": 73.8567},
            {"name": "Ahmedabad", "lat": 23.0225, "lon": 72.5714},
            {"name": "Jaipur", "lat": 26.9124, "lon": 75.7873},
            {"name": "Lucknow", "lat": 26.8467, "lon": 80.9462},
            {"name": "Kanpur", "lat": 26.4499, "lon": 80.3319},
            {"name": "Nagpur", "lat": 21.1458, "lon": 79.0882},
            {"name": "Indore", "lat": 22.7196, "lon": 75.8577},
            {"name": "Thane", "lat": 19.2183, "lon": 72.9781},
            {"name": "Bhopal", "lat": 23.2599, "lon": 77.4126},
            {"name": "Visakhapatnam", "lat": 17.6868, "lon": 83.2185},
            {"name": "Patna", "lat": 25.5941, "lon": 85.1376},
            {"name": "Vadodara", "lat": 22.3072, "lon": 73.1812},
            {"name": "Ghaziabad", "lat": 28.6692, "lon": 77.4538},
            {"name": "Ludhiana", "lat": 30.9010, "lon": 75.8573},
            {"name": "Agra", "lat": 27.1767, "lon": 78.0081},
            {"name": "Nashik", "lat": 19.9975, "lon": 73.7898},
            {"name": "Faridabad", "lat": 28.4089, "lon": 77.3178},
            {"name": "Meerut", "lat": 28.9845, "lon": 77.7064},
            {"name": "Rajkot", "lat": 22.3039, "lon": 70.8022},
            {"name": "Kalyan", "lat": 19.2433, "lon": 73.1352},
            {"name": "Vasai", "lat": 19.4259, "lon": 72.8225},
            {"name": "Varanasi", "lat": 25.3176, "lon": 82.9739},
            {"name": "Srinagar", "lat": 34.0837, "lon": 74.7973},
            {"name": "Aurangabad", "lat": 19.8762, "lon": 75.3433},
            {"name": "Dhanbad", "lat": 23.7957, "lon": 86.4304},
            {"name": "Amritsar", "lat": 31.6340, "lon": 74.8723},
            {"name": "Allahabad", "lat": 25.4358, "lon": 81.8463},
            {"name": "Ranchi", "lat": 23.3441, "lon": 85.3096},
            {"name": "Howrah", "lat": 22.5958, "lon": 88.2636},
            {"name": "Coimbatore", "lat": 11.0168, "lon": 76.9558},
            {"name": "Jabalpur", "lat": 23.1815, "lon": 79.9864},
            {"name": "Gwalior", "lat": 26.2183, "lon": 78.1828},
            {"name": "Vijayawada", "lat": 16.5062, "lon": 80.6480},
            {"name": "Jodhpur", "lat": 26.2389, "lon": 73.0243},
            {"name": "Madurai", "lat": 9.9252, "lon": 78.1198},
            {"name": "Raipur", "lat": 21.2514, "lon": 81.6296},
            {"name": "Kota", "lat": 25.2138, "lon": 75.8648},
            {"name": "Guwahati", "lat": 26.1445, "lon": 91.7362},
            {"name": "Chandigarh", "lat": 30.7333, "lon": 76.7794},
            {"name": "Solapur", "lat": 17.6599, "lon": 75.9064},
            {"name": "Hubli", "lat": 15.3647, "lon": 75.1240},
            {"name": "Bareilly", "lat": 28.3670, "lon": 79.4304},
            {"name": "Moradabad", "lat": 28.8389, "lon": 78.7768},
            {"name": "Mysore", "lat": 12.2958, "lon": 76.6394},
            {"name": "Gurgaon", "lat": 28.4595, "lon": 77.0266},
            {"name": "Aligarh", "lat": 27.8974, "lon": 78.0880},
            {"name": "Jalandhar", "lat": 31.3260, "lon": 75.5762},
            {"name": "Tiruchirappalli", "lat": 10.7905, "lon": 78.7047},
            {"name": "Bhubaneswar", "lat": 20.2961, "lon": 85.8245},
            {"name": "Salem", "lat": 11.6643, "lon": 78.1460},
            {"name": "Mira", "lat": 19.2952, "lon": 72.8544},
            {"name": "Warangal", "lat": 17.9689, "lon": 79.5941},
            {"name": "Guntur", "lat": 16.2991, "lon": 80.4575},
            {"name": "Bhiwandi", "lat": 19.2969, "lon": 73.0631},
            {"name": "Saharanpur", "lat": 29.9675, "lon": 77.5536},
            {"name": "Gorakhpur", "lat": 26.7606, "lon": 83.3732},
            {"name": "Bikaner", "lat": 28.0229, "lon": 73.3119},
            {"name": "Amravati", "lat": 20.9320, "lon": 77.7519},
            {"name": "Noida", "lat": 28.5355, "lon": 77.3910},
            {"name": "Jamshedpur", "lat": 22.8046, "lon": 86.2029},
            {"name": "Bhilai", "lat": 21.2091, "lon": 81.4285},
            {"name": "Cuttack", "lat": 20.4625, "lon": 85.8830},
            {"name": "Firozabad", "lat": 27.1591, "lon": 78.3958},
            {"name": "Kochi", "lat": 9.9312, "lon": 76.2673},
            {"name": "Nellore", "lat": 14.4426, "lon": 79.9865},
            {"name": "Bhavnagar", "lat": 21.7645, "lon": 72.1519},
            {"name": "Dehradun", "lat": 30.3165, "lon": 78.0322},
            {"name": "Durgapur", "lat": 23.5204, "lon": 87.3119},
            {"name": "Asansol", "lat": 23.6889, "lon": 86.9661},
            {"name": "Rourkela", "lat": 22.2492, "lon": 84.8828},
            {"name": "Kolhapur", "lat": 16.7050, "lon": 74.2433},
            {"name": "Ajmer", "lat": 26.4499, "lon": 74.6399},
            {"name": "Akola", "lat": 20.7096, "lon": 77.0021},
            {"name": "Gulbarga", "lat": 17.3297, "lon": 76.8343},
            {"name": "Jamnagar", "lat": 22.4707, "lon": 70.0577},
            {"name": "Ujjain", "lat": 23.1765, "lon": 75.7885},
            {"name": "Loni", "lat": 28.7515, "lon": 77.2884},
            {"name": "Siliguri", "lat": 26.7271, "lon": 88.3953},
            {"name": "Jhansi", "lat": 25.4484, "lon": 78.5685},
            {"name": "Ulhasnagar", "lat": 19.2183, "lon": 73.1634},
            {"name": "Nashik", "lat": 19.9975, "lon": 73.7898},
            {"name": "Sangli", "lat": 16.8524, "lon": 74.5815},
            {"name": "Mira", "lat": 19.2952, "lon": 72.8544},
            {"name": "Bhiwandi", "lat": 19.2969, "lon": 73.0631},
            {"name": "Warangal", "lat": 17.9689, "lon": 79.5941},
            {"name": "Guntur", "lat": 16.2991, "lon": 80.4575},
            {"name": "Bikaner", "lat": 28.0229, "lon": 73.3119},
            {"name": "Amravati", "lat": 20.9320, "lon": 77.7519},
            {"name": "Noida", "lat": 28.5355, "lon": 77.3910},
            {"name": "Jamshedpur", "lat": 22.8046, "lon": 86.2029},
            {"name": "Bhilai", "lat": 21.2091, "lon": 81.4285},
            {"name": "Cuttack", "lat": 20.4625, "lon": 85.8830},
            {"name": "Firozabad", "lat": 27.1591, "lon": 78.3958},
            {"name": "Kochi", "lat": 9.9312, "lon": 76.2673},
            {"name": "Nellore", "lat": 14.4426, "lon": 79.9865},
            {"name": "Bhavnagar", "lat": 21.7645, "lon": 72.1519},
            {"name": "Dehradun", "lat": 30.3165, "lon": 78.0322},
            {"name": "Durgapur", "lat": 23.5204, "lon": 87.3119},
            {"name": "Asansol", "lat": 23.6889, "lon": 86.9661},
            {"name": "Rourkela", "lat": 22.2492, "lon": 84.8828},
            {"name": "Kolhapur", "lat": 16.7050, "lon": 74.2433},
            {"name": "Ajmer", "lat": 26.4499, "lon": 74.6399},
            {"name": "Akola", "lat": 20.7096, "lon": 77.0021},
            {"name": "Gulbarga", "lat": 17.3297, "lon": 76.8343},
            {"name": "Jamnagar", "lat": 22.4707, "lon": 70.0577},
            {"name": "Ujjain", "lat": 23.1765, "lon": 75.7885},
            {"name": "Loni", "lat": 28.7515, "lon": 77.2884},
            {"name": "Siliguri", "lat": 26.7271, "lon": 88.3953},
            {"name": "Jhansi", "lat": 25.4484, "lon": 78.5685},
            {"name": "Ulhasnagar", "lat": 19.2183, "lon": 73.1634},
            {"name": "Sangli", "lat": 16.8524, "lon": 74.5815},
            # International Cities (for global context)
            {"name": "New York", "lat": 40.7128, "lon": -74.0060},
            {"name": "London", "lat": 51.5074, "lon": -0.1278},
            {"name": "Tokyo", "lat": 35.6762, "lon": 139.6503},
            {"name": "Sydney", "lat": -33.8688, "lon": 151.2093},
            {"name": "Cairo", "lat": 30.0444, "lon": 31.2357},
            {"name": "São Paulo", "lat": -23.5505, "lon": -46.6333},
            {"name": "Moscow", "lat": 55.7558, "lon": 37.6176},
            {"name": "Beijing", "lat": 39.9042, "lon": 116.4074},
            {"name": "Shanghai", "lat": 31.2304, "lon": 121.4737},
            {"name": "Dubai", "lat": 25.2048, "lon": 55.2708},
            {"name": "Singapore", "lat": 1.3521, "lon": 103.8198},
            {"name": "Bangkok", "lat": 13.7563, "lon": 100.5018},
            {"name": "Seoul", "lat": 37.5665, "lon": 126.9780},
            {"name": "Jakarta", "lat": -6.2088, "lon": 106.8456},
            {"name": "Manila", "lat": 14.5995, "lon": 120.9842},
            {"name": "Kuala Lumpur", "lat": 3.1390, "lon": 101.6869},
            {"name": "Ho Chi Minh City", "lat": 10.8231, "lon": 106.6297},
            {"name": "Hanoi", "lat": 21.0285, "lon": 105.8542},
            {"name": "Yangon", "lat": 16.8661, "lon": 96.1951},
            {"name": "Phnom Penh", "lat": 11.5564, "lon": 104.9282},
            {"name": "Vientiane", "lat": 17.9757, "lon": 102.6331},
            {"name": "Ulaanbaatar", "lat": 47.8864, "lon": 106.9057},
            {"name": "Astana", "lat": 51.1694, "lon": 71.4491},
            {"name": "Tashkent", "lat": 41.2995, "lon": 69.2401},
            {"name": "Almaty", "lat": 43.2220, "lon": 76.8512},
            {"name": "Bishkek", "lat": 42.8746, "lon": 74.5698},
            {"name": "Dushanbe", "lat": 38.5358, "lon": 68.7791},
            {"name": "Ashgabat", "lat": 37.9601, "lon": 58.3261},
            {"name": "Baku", "lat": 40.4093, "lon": 49.8671},
            {"name": "Yerevan", "lat": 40.1872, "lon": 44.5152},
            {"name": "Tbilisi", "lat": 41.7151, "lon": 44.8271},
            {"name": "Tehran", "lat": 35.6892, "lon": 51.3890},
            {"name": "Baghdad", "lat": 33.3152, "lon": 44.3661},
            {"name": "Riyadh", "lat": 24.7136, "lon": 46.6753},
            {"name": "Jeddah", "lat": 21.4858, "lon": 39.1925},
            {"name": "Amman", "lat": 31.9454, "lon": 35.9284},
            {"name": "Beirut", "lat": 33.8935, "lon": 35.5016},
            {"name": "Damascus", "lat": 33.5138, "lon": 36.2765},
            {"name": "Jerusalem", "lat": 31.7683, "lon": 35.2137},
            {"name": "Tel Aviv", "lat": 32.0853, "lon": 34.7818},
            {"name": "Istanbul", "lat": 41.0082, "lon": 28.9784},
            {"name": "Ankara", "lat": 39.9334, "lon": 32.8597},
            {"name": "Athens", "lat": 37.9838, "lon": 23.7275},
            {"name": "Rome", "lat": 41.9028, "lon": 12.4964},
            {"name": "Madrid", "lat": 40.4168, "lon": -3.7038},
            {"name": "Barcelona", "lat": 41.3851, "lon": 2.1734},
            {"name": "Paris", "lat": 48.8566, "lon": 2.3522},
            {"name": "Berlin", "lat": 52.5200, "lon": 13.4050},
            {"name": "Munich", "lat": 48.1351, "lon": 11.5820},
            {"name": "Hamburg", "lat": 53.5511, "lon": 9.9937},
            {"name": "Cologne", "lat": 50.9375, "lon": 6.9603},
            {"name": "Frankfurt", "lat": 50.1109, "lon": 8.6821},
            {"name": "Stuttgart", "lat": 48.7758, "lon": 9.1829},
            {"name": "Düsseldorf", "lat": 51.2277, "lon": 6.7735},
            {"name": "Dortmund", "lat": 51.5136, "lon": 7.4653},
            {"name": "Essen", "lat": 51.4556, "lon": 7.0116},
            {"name": "Leipzig", "lat": 51.3397, "lon": 12.3731},
            {"name": "Bremen", "lat": 53.0793, "lon": 8.8017},
            {"name": "Dresden", "lat": 51.0504, "lon": 13.7373},
            {"name": "Hannover", "lat": 52.3759, "lon": 9.7320},
            {"name": "Nuremberg", "lat": 49.4521, "lon": 11.0767},
            {"name": "Duisburg", "lat": 51.4344, "lon": 6.7623},
            {"name": "Bochum", "lat": 51.4818, "lon": 7.2162},
            {"name": "Wuppertal", "lat": 51.2562, "lon": 7.1508},
            {"name": "Bielefeld", "lat": 52.0302, "lon": 8.5325},
            {"name": "Bonn", "lat": 50.7374, "lon": 7.0982},
            {"name": "Mannheim", "lat": 49.4875, "lon": 8.4660},
            {"name": "Karlsruhe", "lat": 49.0069, "lon": 8.4037},
            {"name": "Wiesbaden", "lat": 50.0782, "lon": 8.2397},
            {"name": "Gelsenkirchen", "lat": 51.5138, "lon": 7.0937},
            {"name": "Münster", "lat": 51.9607, "lon": 7.6261},
            {"name": "Chemnitz", "lat": 50.8278, "lon": 12.9242},
            {"name": "Augsburg", "lat": 48.3705, "lon": 10.8978},
            {"name": "Braunschweig", "lat": 52.2689, "lon": 10.5267},
            {"name": "Aachen", "lat": 50.7753, "lon": 6.0839},
            {"name": "Krefeld", "lat": 51.3392, "lon": 6.5531},
            {"name": "Halle", "lat": 51.4964, "lon": 11.9688},
            {"name": "Kiel", "lat": 54.3233, "lon": 10.1228},
            {"name": "Magdeburg", "lat": 52.1205, "lon": 11.6276},
            {"name": "Freiburg", "lat": 47.9990, "lon": 7.8421},
            {"name": "Krefeld", "lat": 51.3392, "lon": 6.5531},
            {"name": "Lübeck", "lat": 53.8654, "lon": 10.6866},
            {"name": "Oberhausen", "lat": 51.4699, "lon": 6.8514},
            {"name": "Erfurt", "lat": 50.9848, "lon": 11.0299},
            {"name": "Mainz", "lat": 49.9929, "lon": 8.2473},
            {"name": "Rostock", "lat": 54.0924, "lon": 12.0991},
            {"name": "Kassel", "lat": 51.3127, "lon": 9.4797},
            {"name": "Hagen", "lat": 51.3671, "lon": 7.4633},
            {"name": "Potsdam", "lat": 52.3906, "lon": 13.0645},
            {"name": "Mülheim", "lat": 51.4275, "lon": 6.8834},
            {"name": "Ludwigshafen", "lat": 49.4744, "lon": 8.4352},
            {"name": "Leverkusen", "lat": 51.0459, "lon": 6.9853},
            {"name": "Oldenburg", "lat": 53.1434, "lon": 8.2146},
            {"name": "Osnabrück", "lat": 52.2799, "lon": 8.0472},
            {"name": "Solingen", "lat": 51.1702, "lon": 7.0845},
            {"name": "Heidelberg", "lat": 49.3988, "lon": 8.6724},
            {"name": "Herne", "lat": 51.5426, "lon": 7.2190},
            {"name": "Neuss", "lat": 51.2042, "lon": 6.6879},
            {"name": "Darmstadt", "lat": 49.8728, "lon": 8.6512},
            {"name": "Paderborn", "lat": 51.7189, "lon": 8.7575},
            {"name": "Regensburg", "lat": 49.0134, "lon": 12.1016},
            {"name": "Ingolstadt", "lat": 48.7644, "lon": 11.4241},
            {"name": "Würzburg", "lat": 49.7913, "lon": 9.9534},
            {"name": "Fürth", "lat": 49.4778, "lon": 10.9887},
            {"name": "Wolfsburg", "lat": 52.4226, "lon": 10.7865},
            {"name": "Offenbach", "lat": 50.1109, "lon": 8.6821},
            {"name": "Ulm", "lat": 48.3984, "lon": 9.9916},
            {"name": "Heilbronn", "lat": 49.1427, "lon": 9.2105},
            {"name": "Pforzheim", "lat": 48.8926, "lon": 8.7051},
            {"name": "Göttingen", "lat": 51.5413, "lon": 9.9158},
            {"name": "Bottrop", "lat": 51.5235, "lon": 6.9227},
            {"name": "Trier", "lat": 49.7499, "lon": 6.6373},
            {"name": "Recklinghausen", "lat": 51.6138, "lon": 7.1978},
            {"name": "Reutlingen", "lat": 48.4914, "lon": 9.2045},
            {"name": "Bremerhaven", "lat": 53.5396, "lon": 8.5809},
            {"name": "Koblenz", "lat": 50.3569, "lon": 7.5940},
            {"name": "Bergisch Gladbach", "lat": 50.9856, "lon": 7.1327},
            {"name": "Jena", "lat": 50.9279, "lon": 11.5892},
            {"name": "Remscheid", "lat": 51.1789, "lon": 7.1907},
            {"name": "Erlangen", "lat": 49.5897, "lon": 11.0041},
            {"name": "Moers", "lat": 51.4516, "lon": 6.6271},
            {"name": "Siegen", "lat": 50.8750, "lon": 8.0167},
            {"name": "Hildesheim", "lat": 52.1508, "lon": 9.9511},
            {"name": "Salzgitter", "lat": 52.1508, "lon": 10.3417},
            {"name": "Cottbus", "lat": 51.7563, "lon": 14.3329},
            {"name": "Gera", "lat": 50.8805, "lon": 12.0826},
            {"name": "Kaiserslautern", "lat": 49.4447, "lon": 7.7690},
            {"name": "Schwerin", "lat": 53.6355, "lon": 11.4012},
            {"name": "Dessau", "lat": 51.8364, "lon": 12.2468},
            {"name": "Brandenburg", "lat": 52.4125, "lon": 12.5316},
            {"name": "Rostock", "lat": 54.0924, "lon": 12.0991},
            {"name": "Kassel", "lat": 51.3127, "lon": 9.4797},
            {"name": "Hagen", "lat": 51.3671, "lon": 7.4633},
            {"name": "Potsdam", "lat": 52.3906, "lon": 13.0645},
            {"name": "Mülheim", "lat": 51.4275, "lon": 6.8834},
            {"name": "Ludwigshafen", "lat": 49.4744, "lon": 8.4352},
            {"name": "Leverkusen", "lat": 51.0459, "lon": 6.9853},
            {"name": "Oldenburg", "lat": 53.1434, "lon": 8.2146},
            {"name": "Osnabrück", "lat": 52.2799, "lon": 8.0472},
            {"name": "Solingen", "lat": 51.1702, "lon": 7.0845},
            {"name": "Heidelberg", "lat": 49.3988, "lon": 8.6724},
            {"name": "Herne", "lat": 51.5426, "lon": 7.2190},
            {"name": "Neuss", "lat": 51.2042, "lon": 6.6879},
            {"name": "Darmstadt", "lat": 49.8728, "lon": 8.6512},
            {"name": "Paderborn", "lat": 51.7189, "lon": 8.7575},
            {"name": "Regensburg", "lat": 49.0134, "lon": 12.1016},
            {"name": "Ingolstadt", "lat": 48.7644, "lon": 11.4241},
            {"name": "Würzburg", "lat": 49.7913, "lon": 9.9534},
            {"name": "Fürth", "lat": 49.4778, "lon": 10.9887},
            {"name": "Wolfsburg", "lat": 52.4226, "lon": 10.7865},
            {"name": "Offenbach", "lat": 50.1109, "lon": 8.6821},
            {"name": "Ulm", "lat": 48.3984, "lon": 9.9916},
            {"name": "Heilbronn", "lat": 49.1427, "lon": 9.2105},
            {"name": "Pforzheim", "lat": 48.8926, "lon": 8.7051},
            {"name": "Göttingen", "lat": 51.5413, "lon": 9.9158},
            {"name": "Bottrop", "lat": 51.5235, "lon": 6.9227},
            {"name": "Trier", "lat": 49.7499, "lon": 6.6373},
            {"name": "Recklinghausen", "lat": 51.6138, "lon": 7.1978},
            {"name": "Reutlingen", "lat": 48.4914, "lon": 9.2045},
            {"name": "Bremerhaven", "lat": 53.5396, "lon": 8.5809},
            {"name": "Koblenz", "lat": 50.3569, "lon": 7.5940},
            {"name": "Bergisch Gladbach", "lat": 50.9856, "lon": 7.1327},
            {"name": "Jena", "lat": 50.9279, "lon": 11.5892},
            {"name": "Remscheid", "lat": 51.1789, "lon": 7.1907},
            {"name": "Erlangen", "lat": 49.5897, "lon": 11.0041},
            {"name": "Moers", "lat": 51.4516, "lon": 6.6271},
            {"name": "Siegen", "lat": 50.8750, "lon": 8.0167},
            {"name": "Hildesheim", "lat": 52.1508, "lon": 9.9511},
            {"name": "Salzgitter", "lat": 52.1508, "lon": 10.3417},
            {"name": "Cottbus", "lat": 51.7563, "lon": 14.3329},
            {"name": "Gera", "lat": 50.8805, "lon": 12.0826},
            {"name": "Kaiserslautern", "lat": 49.4447, "lon": 7.7690},
            {"name": "Schwerin", "lat": 53.6355, "lon": 11.4012},
            {"name": "Dessau", "lat": 51.8364, "lon": 12.2468},
            {"name": "Brandenburg", "lat": 52.4125, "lon": 12.5316},
        ]
        
        # Generate data for the last 5 years
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365*5)
        
        data_points = []
        
        for location in locations:
            for data_type in DataType:
                current_date = start_date
                
                while current_date <= end_date:
                    # Generate realistic sample data
                    if data_type == DataType.TEMPERATURE:
                        base_temp = 20.0
                        seasonal_variation = 10 * (current_date.timetuple().tm_yday / 365)
                        daily_variation = random.uniform(-5, 5)
                        value = base_temp + seasonal_variation + daily_variation
                        unit = "°C"
                        
                    elif data_type == DataType.RAINFALL:
                        # More rainfall in certain months (simplified seasonal pattern)
                        month = current_date.month
                        if month in [3, 4, 5, 9, 10, 11]:  # Spring and Fall
                            base_rainfall = 5.0
                        else:
                            base_rainfall = 2.0
                        value = max(0, base_rainfall + random.uniform(-2, 8))
                        unit = "mm"
                        
                    elif data_type == DataType.WIND_SPEED:
                        value = random.uniform(5, 25)
                        unit = "km/h"
                        
                    elif data_type == DataType.CO2_LEVELS:
                        # Gradual increase over time
                        days_passed = (current_date - start_date).days
                        base_co2 = 410.0
                        value = base_co2 + (days_passed * 0.1) + random.uniform(-2, 2)
                        unit = "ppm"
                        
                    elif data_type == DataType.HUMIDITY:
                        value = random.uniform(40, 90)
                        unit = "%"
                        
                    elif data_type == DataType.PRESSURE:
                        value = random.uniform(980, 1020)
                        unit = "hPa"
                    
                    # Create data point
                    data_point = ClimateData(
                        location=location["name"],
                        latitude=location["lat"],
                        longitude=location["lon"],
                        data_type=data_type.value,  # Use enum value as string
                        value=round(value, 2),
                        unit=unit,
                        date=current_date,
                        source=random.choice(list(DataSource)).value,  # Use enum value as string
                        confidence=random.uniform(0.8, 1.0)
                    )
                    
                    data_points.append(data_point)
                    current_date += timedelta(days=1)
        
        # Add all data points to database
        db.add_all(data_points)
        db.commit()
        
        print(f"✅ Added {len(data_points)} climate data points")
        
    except Exception as e:
        print(f"❌ Error seeding climate data: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def seed_users():
    """Seed the database with sample users"""
    db = SessionLocal()
    
    try:
        print("👥 Seeding users...")
        
        # Sample users
        users = [
            {
                "username": "admin",
                "email": "admin@bramble.com",
                "full_name": "Admin User",
                "password": "admin123",
                "is_superuser": True
            },
            {
                "username": "scientist",
                "email": "scientist@bramble.com",
                "full_name": "Climate Scientist",
                "password": "science123",
                "is_superuser": False
            },
            {
                "username": "researcher",
                "email": "researcher@bramble.com",
                "full_name": "Data Researcher",
                "password": "research123",
                "is_superuser": False
            }
        ]
        
        for user_data in users:
            # Check if user already exists
            existing_user = db.query(User).filter(User.email == user_data["email"]).first()
            if not existing_user:
                hashed_password = get_password_hash(user_data["password"])
                user = User(
                    username=user_data["username"],
                    email=user_data["email"],
                    full_name=user_data["full_name"],
                    hashed_password=hashed_password,
                    is_superuser=user_data["is_superuser"]
                )
                db.add(user)
        
        db.commit()
        print("✅ Added sample users")
        print("📝 Login credentials:")
        for user_data in users:
            print(f"   {user_data['email']} / {user_data['password']}")
        
    except Exception as e:
        print(f"❌ Error seeding users: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def main():
    """Main seeding function"""
    print("🌱 BRAMBLE Database Seeding")
    print("=" * 40)
    
    # Initialize database
    print("🗄️ Initializing database...")
    init_db()
    print("✅ Database initialized")
    
    # Seed data
    seed_users()
    seed_climate_data()
    
    print("\n🎉 Database seeding completed successfully!")
    print("\n📋 You can now start the application:")
    print("   Backend: python main.py")
    print("   Frontend: cd ../frontend && npm start")


if __name__ == "__main__":
    main()
