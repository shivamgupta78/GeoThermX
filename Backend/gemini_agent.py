import os
import json
from google import genai
from dotenv import load_dotenv

# .env file se variables load karne ke liye
load_dotenv()

# OS environment se key nikalna
GEMINI_API_KEY = os.getenv("API_KEY")

if not GEMINI_API_KEY:
    print("⚠️ Warning: Bhai, .env file mein GEMINI_API_KEY nahi mili!")

client = genai.Client(api_key=GEMINI_API_KEY)

def analyze_spatial_data(df):
    try:
        df_clean = df.dropna(subset=['latitude', 'longitude', 'lst', 'tree_cover'])
        
        hotspots_sample = df_clean.nlargest(3, 'lst')[['latitude', 'longitude', 'lst', 'ward']].to_dict(orient='records')
        cool_zones_sample = df_clean.nsmallest(3, 'lst')[['latitude', 'longitude', 'lst', 'ward']].to_dict(orient='records')
        
        prompt = f"""
        You are an expert ISRO Climate Scientist. Analyze this geospatial weather data from Delhi NCR:
        Critical Hotspots (Red Spots): {json.dumps(hotspots_sample)}
        Cooling Zones (Green Spots): {json.dumps(cool_zones_sample)}
        
        Provide a structured response. First give 3 bullet points listing the exact coordinates as 'RED SPOTS' (Severe Risk) and 3 coordinates as 'GREEN SPOTS' (Ecological Shield). Then give a 2-sentence summary of why the red spots are overheating. Keep it highly technical yet concise.
        """
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        return response.text
    except Exception as e:
        return f"AI Agent Error: {str(e)}"