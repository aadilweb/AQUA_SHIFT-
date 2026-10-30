# AquaShift 2.0
## AI-Powered Geospatial Agricultural Intelligence & Crop Optimization Platform

> **Core Principle**: *"Machine Learning predicts. Mathematical Optimization decides. Geospatial Intelligence contextualizes. AI explains."*

---

## 1. Executive Summary & Problem Statement

Agriculture faces a critical, systemic trilemma:
1. **WATER**: Groundwater tables are collapsing across key breadbaskets (e.g., Punjab, Andhra Pradesh, Rajasthan) due to flood-irrigated monocultures.
2. **FOOD SECURITY**: National and regional mandates require guaranteed calorie and staple grain production.
3. **FARMER LIVELIHOODS**: Diversification cannot succeed unless farmers earn sustainable profits and buffer against price crashes.

**AquaShift 2.0** solves this trilemma. Rather than offering static weather dashboards or generic chatbots, AquaShift is an **end-to-end mathematical decision layer**. It ingests remote sensing observations, soil chemistry, groundwater telemetry, and market prices to compute the exact Pareto-optimal crop allocation along the physical constraint boundary.

---

## 2. Technical Stack

| Tier | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Leaflet GIS, Recharts, Lucide Icons |
| **Backend** | Python 3.11, FastAPI REST API, Pydantic v2, SQLAlchemy 2.0, Shapely |
| **Optimization Engine** | Google OR-Tools (Mixed-Integer Programming) & SciPy HiGHS Simplex LP Solver |
| **Machine Learning** | FAO-56 Penman-Monteith Evapotranspiration + ICAR Agricultural Yield Response Surfaces |
| **Geospatial & Ingestion** | OpenStreetMap Nominatim, Open-Meteo REST API, ISRIC SoilGrids 250m, CGWB Telemetry, Agmarknet |
| **Database** | PostgreSQL with PostGIS extension (with automatic SQLite fallback for zero-config local runs) |
| **Infrastructure** | Docker, Docker Compose, Nginx, automated Pytest test suite |

---

## 3. Key Platform Capabilities

1. **Geospatial Agricultural Cadastre**:
   - Browser GPS auto-detection with high-precision reverse geocoding into Indian Agro-Climatic Zones.
   - Interactive cadastral map with high-resolution satellite imagery (Esri World Imagery) and topographic overlays.
   - Exact geodesic field polygon area calculation in **Hectares** and **Acres**.
2. **Real-Time Environmental Ingestion**:
   - **Weather**: Live Open-Meteo feed yielding temperature min/max, relative humidity, wind speed, precipitation, reference evapotranspiration ($ET_0$), and UNEP aridity index.
   - **Soil Pedology**: ISRIC SoilGrids 250m + ICAR regional benchmarks (texture, pH, Organic Carbon %, N-P-K, water-holding capacity, and soil moisture).
   - **Groundwater Telemetry**: Central Ground Water Board (CGWB) & NWIC monitoring stations measuring water table depth in meters below ground level (mbgl) and 5-year depletion rates.
3. **FAO-56 Agronomic Prediction Engine**:
   - Calculates crop water requirements ($m^3/\text{ha}$) and climate-adjusted yields for 10 calibrated crops: Paddy, Wheat, Maize, Bt Cotton, Moong (Green Gram), Chickpea (Gram), Mustard, Sugarcane, Groundnut, and Drip Tomato.
4. **Google OR-Tools & HiGHS Mathematical Optimization**:
   - Multi-objective linear program balancing water savings, food production, and farmer income.
   - **Guaranteed Never to Return 'Infeasible'**: When targets clash under severe drought, elastic slack variables absorb the discrepancy and isolate the exact binding bottleneck (e.g. `WATER_BUDGET`).
   - Anti-monoculture diversification bounds.
5. **Climate & Economic Stress-Testing Studio**:
   - Evaluates 7 canonical stress profiles simultaneously:
     - A. Baseline
     - B. Moderate Water Shortage (-20%)
     - C. Severe Water Shortage (-50%)
     - D. Extreme Water Shortage (-80%)
     - E. Economic Mandate (+50% Income Target)
     - F. Food-Security Stress (+10% Food Target)
     - G. Combined Compound Stress
6. **AI Agronomic Decision Explainer**:
   - Deterministic, non-hallucinating plain-language agronomic narrative.
   - Explains *why* specific crops were expanded (e.g. nitrogen-fixing Moong legumes) and *why* water-heavy crops were reduced.
   - One-click export to Markdown and Print to PDF.

---

## 4. Live Analysis Workflow

1. Select a farm region or use GPS detection to load the field boundary.
2. AquaShift fetches live weather, soil, groundwater, and crop catalog data for that location.
3. Crop yield and water requirements are predicted from the live soil and weather profile.
4. The optimization engine allocates land across the selected crops using those live predictions.
5. The stress-testing studio evaluates the same live plan against seven drought and economic scenarios.
6. The AI explanation engine generates a plain-language audit report from the actual solver result.

---

## 5. Local Setup & Quick Start

### Prerequisites
- Python 3.11+
- Node.js v18+ and npm

### 1. Start Backend API
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
*Interactive Swagger API documentation will be live at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)*

### 2. Start Frontend Client
```powershell
cd frontend
npm install
npm run dev
```
*Frontend application will be live at: [http://localhost:3000](http://localhost:3000)*

### 3. Run Automated Tests
```powershell
cd backend
.\venv\Scripts\python -m pytest -v
```
*(All 12 unit and integration tests covering solver feasibility, conflict relaxation, predictions, and endpoints pass 100%).*

---

## 6. Docker Deployment (Full Stack)

To run the entire platform with PostgreSQL/PostGIS, Redis, Backend, and Nginx Frontend in Docker containers:

```bash
docker compose up --build -d
```
- Frontend UI: `http://localhost:3000`
- Backend API Docs: `http://localhost:8000/docs`
- PostGIS Database: `localhost:5432`

---

## 7. Mathematical Model Formulation

$$\min Z = \alpha \cdot \frac{\sum (x_c \cdot W_c)}{W_{\text{norm}}} + \beta \cdot \frac{s_{\text{water}}}{W_{\text{norm}}} + \gamma \cdot \frac{s_{\text{food}}}{F_{\text{norm}}} + \delta \cdot \frac{s_{\text{income}}}{I_{\text{norm}}} + \rho \cdot \frac{s_{\text{land}}}{A_{\text{total}}}$$

Subject to:
1. **Total Land Conservation**: $\sum_{c} x_c \le A_{\text{total}}$
2. **Land Utilization (Elastic)**: $\sum_{c} x_c + s_{\text{land}} \ge 0.80 \cdot A_{\text{total}}$
3. **Water Budget (Soft)**: $\sum_{c} x_c \cdot W_c - s_{\text{water}} \le W_{\text{available}}$
4. **Food Security (Soft)**: $\sum_{c \in \text{food}} x_c \cdot Y_c + s_{\text{food}} \ge F_{\text{target}}$
5. **Farmer Net Income (Soft)**: $\sum_{c} x_c \cdot I_c + s_{\text{income}} \ge I_{\text{target}}$
6. **Physical Bounds**: $0 \le x_c \le \text{MaxArea}_c, \quad s_{\text{water}}, s_{\text{food}}, s_{\text{income}}, s_{\text{land}} \ge 0$

---

## 8. License & Acknowledgements
- Built as an open agricultural decision-support platform.
- Environmental data: Open-Meteo, Central Ground Water Board (CGWB), ISRIC SoilGrids, Indian Council of Agricultural Research (ICAR), Agmarknet.
