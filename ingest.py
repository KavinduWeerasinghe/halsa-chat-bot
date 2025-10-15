# ingest.py (updated version)
import os
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings

# Define the path to the resources folder
RESOURCES_PATH = "./resources"
PERSIST_DIRECTORY = "./chroma_db"


def ingest_documents():
    """
    Loads all PDF documents from the resources folder, splits them into chunks,
    creates embeddings, and stores them in a Chroma vector database.
    """
    all_docs = []
    print(f"Loading documents from {RESOURCES_PATH}...")

    # Iterate through all files in the resources folder
    for filename in os.listdir(RESOURCES_PATH):
        if filename.endswith(".pdf"):
            # Construct the full file path
            file_path = os.path.join(RESOURCES_PATH, filename)
            try:
                loader = PyPDFLoader(file_path)
                # Load the documents and add them to our list
                docs = loader.load()
                all_docs.extend(docs)
                print(f"  - Loaded {filename}")
            except Exception as e:
                print(f"Error loading {filename}: {e}")

    if not all_docs:
        print("No PDF documents found in the resources folder.")
        return

    print(f"\nTotal documents loaded: {len(all_docs)}")

    # Chunk the documents
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(all_docs)
    print(f"Split into {len(splits)} chunks.")

    # Create embeddings and store in ChromaDB
    print("\nCreating embeddings and storing in ChromaDB... This may take a moment.")
    vectorstore = Chroma.from_documents(
        documents=splits,
        embedding=OpenAIEmbeddings(),
        persist_directory=PERSIST_DIRECTORY
    )

    print(f"Successfully ingested documents into ChromaDB at {PERSIST_DIRECTORY}")


if __name__ == "__main__":
    ingest_documents()