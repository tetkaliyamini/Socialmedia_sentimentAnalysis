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

1. **Start Tracking**: Enter a search term (e.g., "AI", "Elon Musk", "Climate Change") and click "Start Tracking"
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

### No Data Appearing

- Check the worker script console for errors
- Verify your MongoDB connection is working
- Try running the `generate_initial_data.py` script to populate the database

## License

MIT
\`\`\`

Let's also create the generate_initial_data.py script:

```python file="scripts/generate_initial_data.py"
import os
import time
import random
from datetime import datetime, timedelta
from pymongo import MongoClient
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from textblob import TextBlob

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("dotenv package not found, using environment variables directly")

# MongoDB connection
MONGODB_URI = os.environ.get('MONGODB_URI', 'mongodb://localhost:27017')
client = MongoClient(MONGODB_URI)
db = client.twitter_sentiment

# Initialize sentiment analyzers
vader = SentimentIntensityAnalyzer()

def analyze_sentiment(text):
    # VADER analysis (specialized for social media)
    vader_scores = vader.polarity_scores(text)
    compound_score = vader_scores['compound']
    
    # TextBlob analysis (as a secondary measure)
    blob = TextBlob(text)
    textblob_score = blob.sentiment.polarity
    
    # Combine scores (weighted average)
    final_score = (compound_score * 0.7) + (textblob_score * 0.3)
    
    # Determine sentiment category
    if final_score > 0.05:
        sentiment = 'positive'
    elif final_score &lt; -0.05:
        sentiment = 'negative'
    else:
        sentiment = 'neutral'
    
    return {
        'sentiment': sentiment,
        'score': final_score,
        'vader_score': compound_score,
        'textblob_score': textblob_score
    }

def generate_mock_tweets(topic, count=50):
    """Generate a set of mock tweets for a given topic"""
    
    # Topic-specific hashtags
    hashtags = {
        "ai": ["#AI", "#MachineLearning", "#DataScience", "#DeepLearning", "#NLP", "#ArtificialIntelligence"],
        "crypto": ["#Bitcoin", "#Ethereum", "#Crypto", "#Blockchain", "#NFT", "#DeFi"],
        "tech": ["#Technology", "#Tech", "#Innovation", "#Programming", "#Coding", "#Developer"],
        "climate": ["#ClimateChange", "#Sustainability", "#GreenEnergy", "#Environment", "#ClimateAction"],
        "politics": ["#Politics", "#Election", "#Democracy", "#Government", "#Policy", "#VoteNow"],
        "health": ["#Health", "#Wellness", "#Healthcare", "#MentalHealth", "#Fitness", "#Nutrition"],
        "business": ["#Business", "#Entrepreneur", "#Startup", "#Marketing", "#Leadership", "#Innovation"],
        "elon": ["#ElonMusk", "#Tesla", "#SpaceX", "#Starlink", "#XAI", "#Neuralink"]
    }
    
    # Default to tech hashtags if topic not found
    topic_lower = topic.lower()
    
    # Try to match the topic to a category
    if "elon" in topic_lower or "musk" in topic_lower:
        topic_hashtags = hashtags["elon"]
    elif "ai" in topic_lower or "artificial" in topic_lower or "intelligence" in topic_lower:
        topic_hashtags = hashtags["ai"]
    elif "crypto" in topic_lower or "bitcoin" in topic_lower or "ethereum" in topic_lower:
        topic_hashtags = hashtags["crypto"]
    elif "climate" in topic_lower or "environment" in topic_lower:
        topic_hashtags = hashtags["climate"]
    elif "politic" in topic_lower or "government" in topic_lower:
        topic_hashtags = hashtags["politics"]
    elif "health" in topic_lower or "wellness" in topic_lower:
        topic_hashtags = hashtags["health"]
    elif "business" in topic_lower or "startup" in topic_lower:
        topic_hashtags = hashtags["business"]
    else:
        topic_hashtags = hashtags["tech"]
    
    # Sentiment-specific templates
    positive_templates = [
        "Just learned about {topic} and I'm really impressed! {hashtag1} {hashtag2}",
        "The latest developments in {topic} are amazing! Can't wait to see what's next. {hashtag1}",
        "I love how {topic} is transforming our world for the better! {hashtag1} {hashtag2}",
        "Great news about {topic} today! This is going to be revolutionary. {hashtag1}",
        "The potential of {topic} is incredible. So excited about the future! {hashtag1} {hashtag2}",
        "Just attended an amazing conference on {topic}. Mind blown! {hashtag1}",
        "{topic} is exceeding all expectations. Truly impressive progress! {hashtag1} {hashtag2}",
        "The {topic} community is so supportive and innovative. Proud to be part of it! {hashtag1}",
        "Today's announcement about {topic} is a game-changer! {hashtag1} {hashtag2}",
        "The benefits of {topic} are finally being recognized. About time! {hashtag1}"
    ]
    
    negative_templates = [
        "Concerned about the direction {topic} is heading. We need to be careful. {hashtag1}",
        "The problems with {topic} are being ignored. This is worrying. {hashtag1} {hashtag2}",
        "Not happy with the latest {topic} developments. This could be problematic. {hashtag1}",
        "The hype around {topic} is overblown. Let's be realistic about the limitations. {hashtag1}",
        "{topic} is facing serious challenges that nobody wants to address. {hashtag1} {hashtag2}",
        "Disappointed by the lack of progress in {topic}. Expected more by now. {hashtag1}",
        "The negative impacts of {topic} are concerning. We need better regulations. {hashtag1} {hashtag2}",
        "Frustrated with how {topic} is being implemented. So many issues to fix. {hashtag1}",
        "The {topic} bubble is going to burst soon. Be prepared. {hashtag1} {hashtag2}",
        "The risks of {topic} are being downplayed. This is dangerous. {hashtag1}"
    ]
    
    neutral_templates = [
        "Interesting developments in {topic} today. Worth keeping an eye on. {hashtag1}",
        "Just reading about the latest {topic} research. Still forming my opinion. {hashtag1} {hashtag2}",
        "The debate around {topic} continues. Both sides have valid points. {hashtag1}",
        "Wondering how {topic} will evolve over the next few years. {hashtag1} {hashtag2}",
        "Following the {topic} trends closely. Lots of changes happening. {hashtag1}",
        "The {topic} landscape is complex. Many factors to consider. {hashtag1} {hashtag2}",
        "Comparing different approaches to {topic}. Each has pros and cons. {hashtag1}",
        "The impact of {topic} varies depending on the context. Interesting to observe. {hashtag1} {hashtag2}",
        "The statistics on {topic} are revealing. Neither good nor bad, just informative. {hashtag1}",
        "Analyzing the current state of {topic}. Mixed results so far. {hashtag1} {hashtag2}"
    ]
    
    tweets = []
    now = datetime.now()
    
    for i in range(count):
        # Determine sentiment distribution (40% positive, 30% neutral, 30% negative)
        sentiment_type = random.choices(
            ["positive", "neutral", "negative"], 
            weights=[0.4, 0.3, 0.3], 
            k=1
        )[0]
        
        # Select template based on sentiment
        if sentiment_type == "positive":
            template = random.choice(positive_templates)
        elif sentiment_type == "negative":
            template = random.choice(negative_templates)
        else:
            template = random.choice(neutral_templates)
        
        # Select random hashtags
        hashtag1 = random.choice(topic_hashtags)
        hashtag2 = random.choice([tag for tag in topic_hashtags if tag != hashtag1])
        
        # Generate tweet text
        tweet_text = template.format(topic=topic, hashtag1=hashtag1, hashtag2=hashtag2)
        
        # Analyze sentiment
        sentiment_result = analyze_sentiment(tweet_text)
        
        # Create timestamp (random time in the last 24 hours)
        random_minutes_ago = random.randint(0, 1440)  # Up to 24 hours ago
        created_at = (now - timedelta(minutes=random_minutes_ago)).isoformat()
        
        # Create a unique ID
        unique_id = f"{int(time.time())}-{random.randint(1000, 9999)}-{i}"
        
        # Create tweet data
        tweet_data = {
            'id': unique_id,
            'text': tweet_text,
            'username': f"user_{random.randint(10000, 99999)}",
            'created_at': created_at,
            'sentiment': sentiment_result['sentiment'],
            'sentiment_score': sentiment_result['score'],
            'is_mock': True
        }
        
        tweets.append(tweet_data)
    
    return tweets

def main():
    print("Generating initial mock data for the Twitter Sentiment Analysis app...")
    
    # Define topics to generate data for
    topics = ["AI", "Elon Musk", "Crypto", "Climate Change", "Technology"]
    
    # Clear existing tweets if requested
    clear_existing = input("Clear existing tweets? (y/n): ").lower() == 'y'
    if clear_existing:
        db.tweets.delete_many({})
        print("Cleared existing tweets.")
    
    # Generate and store tweets for each topic
    total_tweets = 0
    for topic in topics:
        print(f"Generating tweets for topic: {topic}")
        tweets = generate_mock_tweets(topic, count=30)
        
        # Store in database
        if tweets:
            db.tweets.insert_many(tweets)
            total_tweets += len(tweets)
            print(f"Generated and stored {len(tweets)} tweets for {topic}")
    
    print(f"Successfully generated {total_tweets} mock tweets across {len(topics)} topics.")
    print("You can now run the application with mock data.")
    
    # Set up stream config
    db.stream_config.update_one(
        {"id": 1},
        {"$set": {"is_active": True, "search_term": "AI"}},
        upsert=True
    )
    print("Set default stream config to track 'AI'")

if __name__ == "__main__":
    main()
