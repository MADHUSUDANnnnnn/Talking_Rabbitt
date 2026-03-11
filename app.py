import os
import io
import pandas as pd
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Talking Rabbitt API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini Client
api_key = os.getenv("GEMINI_API_KEY")

# Check if dummy key or no key
if api_key and api_key != "your_gemini_api_key_here":
    client = genai.Client(api_key=api_key)
else:
    client = None

# In-memory storage for the latest dataset
CURRENT_DATA = None

# Create static directory if it doesn't exist
os.makedirs("static", exist_ok=True)
os.makedirs("data", exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def read_index():
    with open("static/index.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read(), status_code=200)

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    global CURRENT_DATA
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        CURRENT_DATA = df
        return {"message": "File uploaded successfully."}
    except Exception as e:
        return JSONResponse({"error": f"Failed to parse CSV: {str(e)}"}, status_code=400)

@app.post("/api/chat")
async def chat_endpoint(query: str = Form(...)):
    if not client:
        return JSONResponse({"error": "Gemini API Key not configured. Please add your GEMINI_API_KEY to the .env file."}, status_code=500)
    
    context = ""
    if CURRENT_DATA is not None:
        context = "Here is the most recently uploaded operational data:\n" + CURRENT_DATA.to_string(index=False)
    else:
        # Default fallback to existing file
        try:
            df = pd.read_csv("data/dominos_operations.csv")
            context = "Here is the current Domino's operational data:\n" + df.to_string(index=False)
        except Exception:
            context = "No data uploaded and default dataset not found in data/dominos_operations.csv"

    # Strict system instruction guiding behavior for the Conversational Layer
    sys_instruct = (
        "You are an expert QSR operations analyst for Domino's India. "
        "Your goal is to answer questions about the provided store operational data cleanly and precisely. "
        "CRITICAL RULE: Always provide strictly text-only outputs. Do not generate ANY charts, graphs, tables, or complex visual markdown. "
        "Prioritize main Domino's KPIs: Estimated Delivery Time (EDT), Revenue, and Wastage. "
        "CRITICAL RULE: Always provide 'Actionable Context' in your answers "
        "(e.g., if delivery times are high in a specific hour, explain why based on staffing count, order types, or weather). "
        "Keep your answers concise and direct representing the 'Magic Moment' (e.g. 5-second insights)."
    )

    full_prompt = f"{sys_instruct}\n\n{context}\n\nManager Question: {query}"

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=full_prompt,
        )
        return {"response": response.text}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
