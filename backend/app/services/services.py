import os
import logging
from flask import jsonify, request
from pypdf import PdfReader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import Qdrant
from langchain_core.documents import Document
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams
from langchain_community.llms import Ollama
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_qdrant_client():
    QDRANT_HOST = os.getenv("qdrant_host", "localhost")
    QDRANT_PORT = int(os.getenv("qdrant_port", "6333"))
    return QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)

def process_pdf_content(file):
    try:
        pdf_reader = PdfReader(file)
        text_content = ""
        for page in pdf_reader.pages:
            text_content += page.extract_text()
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len
        )
        chunks = text_splitter.split_text(text_content)
        return [Document(page_content=chunk) for chunk in chunks]
    except Exception as e:
        logger.error(f"Error processing PDF: {str(e)}")
        raise ValueError(f"Could not process PDF file: {str(e)}")

def index_documents_to_qdrant(documents, collection_name):
    client = get_qdrant_client()
    try:
        if client.get_collection(collection_name) is not None:
            client.delete_collection(collection_name)
    except:
        pass

    client.create_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(size=4096, distance=Distance.COSINE),
        hnsw_config={"m": 16, "ef_construct": 100}
    )

    embedding_model = OllamaEmbeddings(
        base_url=os.getenv("ollama_host", "http://localhost:11434"),
        model=os.getenv("MODEL_NAME", "mistral:7b")
    )

    vectorstore = Qdrant(
        client=client,
        collection_name=collection_name,
        embeddings=embedding_model,
    )
    vectorstore.add_documents(documents)
    return {"status": "success", "collection": collection_name}

def process_upload():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No PDF file provided'}), 400

        file = request.files['file']
        collection_name = request.form.get('collection_name', 'pdf_collection')
        documents = process_pdf_content(file)
        result = index_documents_to_qdrant(documents, collection_name)
        return jsonify(result), 200

    except Exception as e:
        logger.error(f"Error processing upload: {str(e)}")
        return jsonify({'error': str(e)}), 500

class QueryService:
    def __init__(self, collection_name=None):
        self.collection_name = collection_name or "pdf_collection"
        self.ollama_host = os.environ.get("ollama_host", "http://localhost:11434")
        self.setup_qdrant()
        self.setup_embeddings()
        self.setup_llm()

    def setup_llm(self):
        self.llm = Ollama(
            base_url=self.ollama_host,
            model=os.getenv("MODEL_NAME", "mistral:7b"),
            temperature=0.1,
            num_ctx=4096,
            top_k=20,
            top_p=0.9,
            repeat_penalty=1.1
        )
    def setup_qdrant(self):
        QDRANT_HOST = os.environ.get("qdrant_host", "localhost")
        QDRANT_PORT = int(os.environ.get("qdrant_port", "6333"))
        self.client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)
        logger.info(f"Connected to Qdrant at {QDRANT_HOST}:{QDRANT_PORT}")

    def setup_embeddings(self):
        self.embedding_model = OllamaEmbeddings(
            base_url=os.getenv("ollama_host", "http://localhost:11434"),
            model=os.getenv("MODEL_NAME", "mistral:7b")
        )
        self.vectorstore = Qdrant(
            client=self.client,
            collection_name=self.collection_name,
            embeddings=self.embedding_model,
        )
        self.retriever = self.vectorstore.as_retriever(search_kwargs={"k": 3})

    def process_query(self, user_query):
        prompt_template = """SYSTEM: You are a highly precise research assistant powered by Mistral-7B. Your task is to provide accurate, concise answers based on the given context.

CONTEXT: {context}

QUERY: {question}

RULES:
1. ACCURACY: Only use information explicitly stated in the context
2. PRECISION: Be direct and specific in your response
3. CONFIDENCE:
   - High: State the answer confidently
   - Low: Say "Based on the available context, I cannot provide a definitive answer"
   - None: Say "This information is not found in the provided context"
4. FORMAT:
   - Keep responses under 5 sentences
   - Use clear, academic language
   - Include relevant quotes if available (using quotation marks)
5. SCOPE: Stay strictly within the context boundary

ANSWER:"""

        PROMPT = PromptTemplate(
            template=prompt_template,
            input_variables=["context", "question"]
        )

        qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            chain_type="stuff",
            retriever=self.retriever,
            chain_type_kwargs={"prompt": PROMPT, "verbose": False}
        )

        response = qa_chain.invoke({"query": user_query})
        return response["result"]  