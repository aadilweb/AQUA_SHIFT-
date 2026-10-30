from fastapi import APIRouter, Query, HTTPException
from app.schemas.schemas import ReverseGeocodeResponse, FieldPolygon, FieldResponse
from app.services.geo_service import reverse_geocode, calculate_polygon_area

router = APIRouter()


@router.get("/reverse-geocode", response_model=ReverseGeocodeResponse)
async def get_reverse_geocode(
    lat: float = Query(..., ge=-90.0, le=90.0, description="Latitude"),
    lon: float = Query(..., ge=-180.0, le=180.0, description="Longitude")
):
    """Resolve latitude and longitude to administrative village, district, state, and agro-climatic zone."""
    return await reverse_geocode(lat, lon)


@router.post("/fields", response_model=FieldResponse)
async def create_field_from_polygon(field_input: FieldPolygon):
    """
    Ingests polygon coordinates drawn on interactive geospatial map,
    computes geodesic land area in hectares and acres, and returns structured field entity.
    """
    if len(field_input.coordinates) < 3:
        raise HTTPException(status_code=400, detail="A polygon must contain at least 3 coordinate vertices.")

    hectares, acres = calculate_polygon_area(field_input.coordinates)

    geojson = {
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [field_input.coordinates]
        },
        "properties": {
            "name": field_input.name,
            "hectares": hectares,
            "acres": acres
        }
    }

    return FieldResponse(
        id=1,
        name=field_input.name or "Selected Agricultural Field",
        area_hectares=hectares,
        area_acres=acres,
        geometry_geojson=geojson,
        elevation_m=field_input.elevation_m or 245.0,
        slope_deg=field_input.slope_deg or 1.2
    )
