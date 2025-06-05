import os
import logging

from langchain_community.embeddings import OllamaEmbeddings
from pypdf import PdfReader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Qdrant
from langchain_community.llms import Ollama
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams
from langchain_core.documents import Document
from dotenv import load_dotenv

import time

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_qdrant_client():
    QDRANT_HOST = os.getenv("qdrant_host", "localhost")
    QDRANT_PORT = int(os.getenv("qdrant_port", "6333"))
    return QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)

def process_pdf_content(pdf_file):
    try:
        reader = PdfReader(pdf_file)
        text_content = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                text_content.append(text)
        if not text_content:
            raise ValueError("No text could be extracted from the PDF.")
        full_text = "\n".join(text_content)
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1800,
            chunk_overlap=200,
            length_function=len,
        )
        chunks = text_splitter.split_text(full_text)
        logger.info(f"Extracted {len(chunks)} chunks from PDF.")
        return [Document(page_content=chunk) for chunk in chunks]
    except Exception as e:
        logger.error(f"Error processing PDF: {str(e)}")
        raise ValueError(f"Could not process PDF file: {str(e)}")

class UploadService:
    def __init__(self):
        self.client = get_qdrant_client()
        self.embeddings = OllamaEmbeddings(
            base_url=os.getenv("ollama_host", "http://localhost:11434"),
            model=os.getenv("MODEL_NAME", "mistral:7b")
        )

    def index_documents(self, documents, collection_name):
        try:
            try:
                self.client.delete_collection(collection_name)
            except Exception as e:
                logger.warning(f"Collection deletion warning: {e}")
            self.client.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(
                    size=4096,
                    distance=Distance.COSINE
                ),
                hnsw_config={"m": 16, "ef_construct": 100}
            )
            vectorstore = Qdrant(
                client=self.client,
                collection_name=collection_name,
                embeddings=self.embeddings
            )
            start_time = time.time()
            vectorstore.add_documents(documents)
            elapsed = time.time() - start_time
            logger.info(f"Indexed {len(documents)} chunks in {elapsed:.2f} seconds.")
            return {"status": "success", "chunks_indexed": len(documents), "elapsed_seconds": elapsed}
        except Exception as e:
            logger.error(f"Error indexing documents: {str(e)}")
            raise

class QueryService:
    def __init__(self, collection_name):
        self.collection_name = collection_name
        self.client = get_qdrant_client()
        self.setup_components()

    def setup_components(self):
        self.embeddings = OllamaEmbeddings(
            base_url=os.getenv("ollama_host", "http://localhost:11434"),
            model=os.getenv("MODEL_NAME", "mistral:7b")
        )
        self.llm = Ollama(
            base_url=os.getenv("ollama_host", "http://localhost:11434"),
            model=os.getenv("MODEL_NAME", "mistral:7b"),
            temperature=0.1,
            num_ctx=4096,
            top_k=10,
            top_p=0.9,
            repeat_penalty=1.1
        )
        self.vector_store = Qdrant(
            client=self.client,
            collection_name=self.collection_name,
            embeddings=self.embeddings
        )

    def process_query(self, query_text):
        try:
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
   - Keep responses under 3 sentences
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
                retriever=self.vector_store.as_retriever(
                    search_kwargs={
                        "k": 3,
                    }
                ),
                chain_type_kwargs={
                    "prompt": PROMPT,
                    "verbose": False
                }
            )

            response = qa_chain.invoke({"query": query_text})
            return response["result"]

        except Exception as e:
            logger.error(f"Error processing query: {str(e)}")
            raise
