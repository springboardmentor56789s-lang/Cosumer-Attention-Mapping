from sqlalchemy.orm import Session
from app import model


class ProductionRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_store(self, payload: dict) -> model.Store:
        store = model.Store(**payload)
        self.db.add(store)
        self.db.commit()
        self.db.refresh(store)
        return store

    def create_shelf(self, payload: dict) -> model.Shelf:
        shelf = model.Shelf(**payload)
        self.db.add(shelf)
        self.db.commit()
        self.db.refresh(shelf)
        return shelf

    def create_product(self, payload: dict) -> model.Product:
        product = model.Product(**payload)
        self.db.add(product)
        self.db.commit()
        self.db.refresh(product)
        return product

    def create_camera(self, payload: dict) -> model.Camera:
        camera = model.Camera(**payload)
        self.db.add(camera)
        self.db.commit()
        self.db.refresh(camera)
        return camera

    def create_analytics(self, payload: dict) -> model.Analytics:
        analytics = model.Analytics(**payload)
        self.db.add(analytics)
        self.db.commit()
        self.db.refresh(analytics)
        return analytics

    def create_customer_track(self, payload: dict) -> model.CustomerTrack:
        track = model.CustomerTrack(**payload)
        self.db.add(track)
        self.db.commit()
        self.db.refresh(track)
        return track

    def create_heatmap(self, payload: dict) -> model.Heatmap:
        heatmap = model.Heatmap(**payload)
        self.db.add(heatmap)
        self.db.commit()
        self.db.refresh(heatmap)
        return heatmap
