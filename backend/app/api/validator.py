from fastapi import APIRouter
from app.models.schemas import ValidateUrlRequest, ValidateUrlResponse
from app.services.validator import validate_submission_url

router = APIRouter(prefix="/validate", tags=["Submission Proof Validator"])

@router.post("/submission-url", response_model=ValidateUrlResponse)
async def check_submission_url(payload: ValidateUrlRequest):
    """
    Validates whether a given URL is an actual submission proof or a generic problem link.
    """
    # 1) Execute URL validator service with regex patterns
    is_valid, detected_plat, err_msg = validate_submission_url(payload.url, payload.platform)
    
    # 2) Return validation outcome and feedback message
    return ValidateUrlResponse(
        is_valid=is_valid,
        detected_platform=detected_plat,
        error_message=err_msg
    )
