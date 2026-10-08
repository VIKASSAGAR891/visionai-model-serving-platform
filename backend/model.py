from ultralytics import YOLO
import cv2
import os

model = YOLO("yolov8n.pt")


def predict_image(image_path):

    results = model(image_path)

    detections = []

    annotated_image_path = None

    for result in results:

        for box in result.boxes:

            class_id = int(box.cls[0])
            confidence = float(box.conf[0])

            detections.append({
                "class": model.names[class_id],
                "confidence": round(confidence, 2)
            })

        annotated_frame = result.plot()

        filename = os.path.basename(image_path)

        annotated_image_path = f"uploads/predicted_{filename}"

        cv2.imwrite(
            annotated_image_path,
            annotated_frame
        )

    return detections, annotated_image_path