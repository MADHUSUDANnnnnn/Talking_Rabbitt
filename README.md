# Talking Rabbitt - Conversational QSR Intelligence

**The "Magic Moment":** This tool replaces complex dashboards with 5-second conversations. Store managers can securely analyze their Domino's operational data and ask natural language questions (like "Which part of the day did our sales shoot up?") to get instant, text-only, highly actionable insights.

## Installation Instructions

1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd Talking_Rabbitt
   ```

2. Create and activate a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   Copy `.env.example` to `.env` and add your valid Gemini API key.
   ```bash
   cp .env.example .env
   ```

5. Run the local development server:
   ```bash
   uvicorn app:app --reload
   ```

6. Open your browser and navigate to `http://127.0.0.1:8000`.

## Deployment Link

[Deployment Live URL Placeholder]

## Data Privacy
The application reads data strictly from the local `data/` source relative to the root, ensuring all processing complies with standard privacy protocols.
