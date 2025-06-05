from flask import Blueprint, request, jsonify
import logging
from app.services.services import process_pdf_content, UploadService, QueryService

main_bp = Blueprint('main', __name__)
upload_service = UploadService()

@main_bp.route('/health')
def health_check():
    return {"status": "healthy"}, 200

@main_bp.route('/upload', methods=['POST']) 
def upload():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
            
        file = request.files['file']
        if not file.filename:
            return jsonify({'error': 'No file selected'}), 400
            
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({'error': 'Only PDF files are allowed'}), 400
            
        collection_name = request.form.get('collection_name', 'pdf_collection')
        logging.info(f"Processing upload for file: {file.filename}, collection: {collection_name}")

        documents = process_pdf_content(file)
        if not documents:
            return jsonify({'error': 'No content could be extracted from the PDF'}), 400
        result = upload_service.index_documents(documents, collection_name)

        logging.info(f"Successfully processed file with {len(documents)} chunks")
        return jsonify(result), 200
        
    except Exception as e:
        logging.error(f"Upload error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@main_bp.route('/query', methods=['POST']) 
def query():
    try:
        data = request.get_json()
        if not data or 'query' not in data:
            return jsonify({"error": "Missing query"}), 400
        
        query_text = data['query']
        collection_name = data.get('collection_name', 'pdf_collection')
        
        # Create query service instance
        query_service = QueryService(collection_name)
        result = query_service.process_query(query_text)
        
        return jsonify({"result": result}), 200
        
    except Exception as e:
        print(f"Query error: {str(e)}")
        return jsonify({'error': str(e)}), 500