# query.py
import os
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

# Check if API key is set
if "OPENAI_API_KEY" not in os.environ:
    print("Error: OPENAI_API_KEY environment variable not set.")
    exit()

# 1. Initialize the LLM and Embedding Model
llm = ChatOpenAI(model_name="gpt-5-mini", temperature=0)
embedding_function = OpenAIEmbeddings()

# 2. Load the existing vector store
vectorstore = Chroma(persist_directory="./chroma_db", embedding_function=embedding_function)

# 3. Create a retriever
retriever = vectorstore.as_retriever()

# 4. Create a RAG prompt template
template = """Answer the question based only on the following context:
{context}

Question: {question}
"""
prompt = ChatPromptTemplate.from_template(template)

# 5. Create the RAG chain
rag_chain = (
        {"context": retriever, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
)

# 6. Ask a question
while True:
    question = input("Enter your question (or 'exit' to quit): ")
    if question.lower() == 'exit':
        break
    response = rag_chain.invoke(question)
    print("Answer:", response)
