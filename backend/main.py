from fastapi import FastAPI, UploadFile, File
from backend.model import predict_image
from backend.database import SessionLocal, Prediction, init_db
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from fastapi.staticfiles import StaticFiles
import shutil
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="AI Vision Platform",
    description="YOLOv8 Image Recognition Platform with PostgreSQL History Tracking",
    version="1.0.0"
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    """Initialize database tables on startup"""
    init_db()

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "AI Vision Platform API is running", "status": "healthy"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Predict objects in uploaded image using YOLOv8
    - **file**: Image file to analyze
    """

    file_path = f"uploads/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    predictions, annotated_image = predict_image(file_path)

    # Save predictions to PostgreSQL database
    db = SessionLocal()

    try:
        for item in predictions:
            record = Prediction(
                filename=file.filename,
                prediction=item["class"],
                confidence=float(item["confidence"]),
                timestamp=datetime.now()  # Use local time instead of UTC
            )
            db.add(record)

        db.commit()
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()

    return {
        "filename": file.filename,
        "predictions": predictions,
        "annotated_image": annotated_image,
        "status": "success"
    }


@app.get("/history")
def history():
    """
    Get prediction history from database
    - Returns all stored predictions with metadata
    """

    db = SessionLocal()

    try:
        records = (db.query(Prediction).order_by(Prediction.timestamp.desc()).limit(50).all())

        result = []

        for item in records:
            result.append({
                "id": item.id,
                "filename": item.filename,
                "prediction": item.prediction,
                "confidence": item.confidence,
                "timestamp": item.timestamp.isoformat()  # Convert datetime to ISO format string
            })

        return {"status": "success", "count": len(result), "data": result}
    finally:
        db.close()


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "AI Vision Platform"}