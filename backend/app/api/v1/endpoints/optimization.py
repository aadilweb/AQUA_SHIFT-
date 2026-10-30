from fastapi import APIRouter
from app.schemas.schemas import OptimizationRequest, OptimizationResponse
from app.services.optimization_engine import solve_crop_allocation

router = APIRouter()


@router.post("/solve", response_model=OptimizationResponse)
async def solve_optimization(request: OptimizationRequest):
    """
    Run Google OR-Tools multi-objective optimization engine to determine optimal crop land allocation.
    Guaranteed to return feasible or closest-feasible allocation with binding constraint diagnosis.
    """
    return solve_crop_allocation(request)
