import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { lat, lon } = await req.json();
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 });
    }

    // Ping Google Places Nearby Search
    const res = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=150&key=${apiKey}`);
    const data = await res.json();

    if (!res.ok || data.status !== 'OK') {
      // Fallback
      return NextResponse.json({ mappedLoc: 'general public places', exactName: null }, { status: 200 });
    }

    // Results array is ordered by prominence by default. Let's find the best mapped location.
    let mappedLoc = 'general public places';
    let exactName = null;

    const relevantCategories = {
      'school': ['school', 'secondary_school', 'primary_school'],
      'university': ['university'],
      'police station': ['police'],
      'mall': ['shopping_mall'],
      'garden': ['park', 'campground'],
      'home': ['lodging', 'real_estate_agency'] // rough guess for residential context
    };

    // Hunt through the top 5 close results
    for (let i = 0; i < Math.min(data.results.length, 5); i++) {
      const place = data.results[i];
      const types = place.types || [];
      
      let foundMatch = false;
      for (const [appCategory, googleTypes] of Object.entries(relevantCategories)) {
        if (types.some(t => googleTypes.includes(t))) {
          mappedLoc = appCategory;
          exactName = place.name;
          foundMatch = true;
          break;
        }
      }

      if (foundMatch) break;
    }

    return NextResponse.json({ mappedLoc, exactName }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
