# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

# --- Your existing RAG logic from query.py ---
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

# Ensure the API key is set (good practice)
if "OPENAI_API_KEY" not in os.environ:
    raise ValueError("OPENAI_API_KEY environment variable not set.")

# 1. Initialize Models and Vector Store
llm = ChatOpenAI(model_name="gpt-5-mini", temperature=0) # Using a real model name
embedding_function = OpenAIEmbeddings()

# NOTE: The path is now relative to where you RUN uvicorn (the 'backend' folder)
# So we go up one level ('../') to find chroma_db
vectorstore = Chroma(persist_directory="../chroma_db", embedding_function=embedding_function)
retriever = vectorstore.as_retriever()

# 2. Create Prompt Template and RAG Chain
template = """Answer the question based only on the following context:
{context}
Question: {question}
"""
prompt = ChatPromptTemplate.from_template(template)

rag_chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)
# --- End of your RAG logic ---


# --- API Server Logic ---
app = FastAPI()

# Allow requests from your React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the request model
class QueryRequest(BaseModel):
    question: str

@app.post("/query")
def process_query(request: QueryRequest):
    """Receives a question, gets an answer from the RAG chain, and returns it."""
    try:
        answer = rag_chain.invoke(request.question)
        return {"answer": answer}
    except Exception as e:
        return {"error": str(e)}

@app.get("/")
def read_root():
    return {"status": "Hälsa Chatbot API is running"}