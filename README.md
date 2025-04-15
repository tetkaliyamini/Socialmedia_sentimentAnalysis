# Twitter Sentiment Analysis Dashboard

A real-time AI-powered sentiment analysis tool that streams tweets, analyzes emotions, stores results, and visualizes trends.

![Dashboard Screenshot](https://via.placeholder.com/800x450.png?text=Twitter+Sentiment+Analysis+Dashboard)

## Features

- **Real-time Twitter Data Analysis**: Stream tweets based on keywords or hashtags
- **Sentiment Analysis**: Analyze tweet sentiment using VADER and TextBlob
- **Interactive Dashboard**: Visualize sentiment distribution, word clouds, and top hashtags
- **Filtering**: Filter tweets by sentiment (positive, neutral, negative)
- **MongoDB Integration**: Store and retrieve analyzed tweets
- **Mock Data Support**: Generate realistic mock data when Twitter API limits are reached

## Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS, shadcn/ui, Chart.js, Framer Motion
- **Backend**: Next.js API Routes, MongoDB
- **Data Processing**: Python, Tweepy, TextBlob, VADER Sentiment Analysis
- **Database**: MongoDB

## Concepts Used

- **Sentiment Analysis**: Using natural language processing to determine the emotional tone of tweets
- **Real-time Data Processing**: Streaming and analyzing data as it comes in
- **Data Visualization**: Representing complex data in intuitive visual formats
- **Responsive Design**: Creating a UI that works across different device sizes
- **Server-Client Architecture**: Separating data processing from presentation
- **Rate Limit Handling**: Gracefully handling API limitations
- **Mock Data Generation**: Creating realistic test data when API access is limited

## Setup and Installation

### Prerequisites

- Node.js (v14 or higher)
- Python (v3.7 or higher)
- MongoDB account

### Installation Steps

1. Clone this repository:
   \`\`\`bash
   git clone https://github.com/yourusername/twitter-sentiment-analysis.git
   cd twitter-sentiment-analysis
   \`\`\`

2. Install Node.js dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Install Python dependencies:
   \`\`\`bash
   python scripts/setup.py
   \`\`\`

4. Create a `.env` file in the root directory with the following variables:
   \`\`\`
   MONGODB_URI=your_mongodb_connection_string
   TWITTER_BEARER_TOKEN=your_twitter_bearer_token
   TWITTER_API_KEY=your_twitter_api_key
   TWITTER_API_SECRET=your_twitter_api_secret
   USE_MOCK_DATA=false
   \`\`\`

   > **Note**: If you don't have Twitter API credentials or are hitting rate limits, set `USE_MOCK_DATA=true`

## Running the Application

### Step 1: Start the Next.js Application

\`\`\`bash
npm run dev
\`\`\`

This will start the Next.js application on http://localhost:3000

### Step 2: Start the Twitter Worker Script

In another terminal window:

\`\`\`bash
python scripts/twitter_worker.py
\`\`\`

### Step 3: Generate Initial Mock Data (Optional)

If you want to populate your database with initial mock data:

\`\`\`bash
python scripts/generate_initial_data.py
\`\`\`

## How to Use the Application

1. **Start Tracking**: Enter a search term (e.g., "AI", "Climate Change") and click "Start Tracking"
2. **View Analytics**: 
   - The sentiment chart shows the distribution of positive, neutral, and negative tweets
   - The word cloud displays common words in the tracked tweets
   - The hashtags section shows the most used hashtags
3. **Filter Tweets**: Use the tabs to filter tweets by sentiment
4. **Stop Tracking**: Click "Stop Tracking" to end the current stream

## Handling Twitter API Rate Limits

Twitter's API has strict rate limits, especially for free developer accounts. This application includes several features to handle rate limits:

1. **Automatic Mock Data**: After 3 consecutive rate limit errors, the worker automatically switches to generating mock data
2. **Manual Mock Mode**: Set `USE_MOCK_DATA=true` in your `.env` file to always use mock data
3. **Exponential Backoff**: The worker implements exponential backoff with jitter to respect rate limits
4. **Initial Data Generator**: Use `scripts/generate_initial_data.py` to populate your database with mock data

## Project Structure

\`\`\`
twitter-sentiment-analysis/
├── app/                      # Next.js app directory
│   ├── actions/              # Server actions
│   ├── api/                  # API routes
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main page
├── components/               # React components
│   ├── dashboard.tsx         # Main dashboard component
│   ├── search-form.tsx       # Search form component
│   ├── sentiment-chart.tsx   # Sentiment visualization
│   ├── tweet-list.tsx        # Tweet display component
│   ├── word-cloud.tsx        # Word cloud visualization
│   └── top-hashtags.tsx      # Hashtags visualization
├── lib/                      # Utility functions
│   └── mongodb.ts            # MongoDB connection
├── scripts/                  # Python scripts
│   ├── setup.py              # Dependencies installer
│   ├── twitter_worker.py     # Main worker script
│   └── generate_initial_data.py # Mock data generator
└── README.md                 # Documentation
\`\`\`

## Troubleshooting

### Twitter API Rate Limits

If you see "Too Many Requests" or "Rate limit exceeded" errors:
- The worker will automatically switch to mock data mode after 3 consecutive errors
- You can manually enable mock data by setting `USE_MOCK_DATA=true` in your `.env` file
- Consider upgrading to a paid Twitter API plan for production use

### MongoDB Connection Issues

- Verify your MongoDB URI is correct
- Ensure your IP address is whitelisted in MongoDB Atlas
- Check that your MongoDB user has the correct permissions

