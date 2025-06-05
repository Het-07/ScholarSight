from flask import Blueprint, request, jsonify, current_app
import logging
from app.services.services import process_pdf_content,process_upload, QueryService

# this is the blueprint for storing the views.
main_bp = Blueprint('main', __name__)

@main_bp.route('/upload', methods=['POST'])
def upload():
    return process_upload()

@main_bp.route('/health', methods=['GET'])
def health_check():
    return {"status": "healthy"}, 200

@main_bp.route('/query', methods=['POST'])
def process_query():
    try:
        data = request.get_json()
        if not data or 'query' not in data:
            return jsonify({"error": "Missing query in request"}), 400
        
        query_text = data['query']
        collection_name = data.get('collection_name', 'sql_schema_chunks')
        
        # Create a new QueryService instance with the specified collection
        query_service = QueryService(collection_name=collection_name)
        result = query_service.process_query(query_text)
        
        return jsonify({"result": result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500