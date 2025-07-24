# SkyLLM

Ever been on a plane, connected to the free messaging but didn't want to pay for wifi, and desperate to google (or ChatGPT) something? Here's your answer: a WhatsApp chatbot powered by OpenAI's GPT-4-mini that maintains conversation history using Redis & separates conversation history by phone number.

## Local Development

### Prerequisites

- Node.js 18+ and Yarn
- Redis (local installation or Docker)
- Twilio account with WhatsApp sandbox set up
- OpenAI API key

### Setup

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd skyllm
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:

   ```env
   OPENAI_API_KEY=your_openai_api_key
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   REDIS_URL=redis://localhost:6379
   PORT=3000
   ```

4. **Start Redis locally**

   ```bash
   brew install redis  # macOS
   redis-server
   ```

5. **Run the development server**

   ```bash
   yarn dev
   ```

6. **Set up Twilio webhook**
   - Use ngrok to expose your local server: `ngrok http 3000`
   - In Twilio Console, set your WhatsApp sandbox webhook URL to: `https://your-ngrok-url.ngrok.io/webhook`

## Railway Deployment

### Step 1: Prepare for Deployment

1. **Build the project**

   ```bash
   yarn build
   ```

2. **Commit your changes**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   ```

### Step 2: Deploy to Railway

1. **Create a Railway project**

   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Connect your GitHub repository

2. **Add Redis database**

   - In your Railway project dashboard
   - Click "+ New" → "Database" → "Add Redis"
   - Railway automatically creates the `REDIS_URL` environment variable

3. **Set environment variables**
   In Railway project settings, add:

   ```
   OPENAI_API_KEY=your_openai_api_key
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   ```

   (Note: `REDIS_URL` is automatically set when you add the Redis database)

4. **Deploy**
   - Railway automatically deploys when you push to your main branch
   - Your app will be available at `https://your-app-name.up.railway.app`

### Step 3: Configure Twilio

1. **Update webhook URL**

   - In Twilio Console → Messaging → Try it out → Send a WhatsApp message
   - Set webhook URL to: `https://your-app-name.up.railway.app/webhook`

2. **Test the integration**
   - Send a message to your Twilio WhatsApp sandbox number
   - You should receive an AI-powered response

## Usage

1. **Join the Twilio WhatsApp Sandbox**

   - Send the join code (from Twilio Console) to your Twilio WhatsApp number

2. **Start chatting**

   - Send any message to begin a conversation
   - The AI will remember context from previous messages

3. **Reset conversation**
   - Send `*` (or `**`, `***`, etc.) to clear chat history and start fresh

## API Endpoints

- `POST /webhook` - Twilio WhatsApp webhook for receiving messages
- `GET /status` - Health check and Twilio status callbacks
