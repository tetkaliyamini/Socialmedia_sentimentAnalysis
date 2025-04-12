import os
import json
import time
import tweepy
import requests
from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from pymongo import MongoClient
from datetime import datetime, timedelta
from dotenv import load_dotenv
import random

# Load environment variables
load_dotenv()

# Twitter API credentials
TWITTER_BEARER_TOKEN = os.environ.get('TWITTER_BEARER_TOKEN', 'YOUR_BEARER_TOKEN')
TWITTER_API_KEY = os.environ.get('TWITTER_API_KEY', 'YOUR_API_KEY')
TWITTER_API_SECRET = os.environ.get('TWITTER_API_SECRET', 'YOUR_API_SECRET')

# MongoDB connection
MONGODB_URI = os.environ.get('MONGODB_URI', 'mongodb://localhost:27017')
client = MongoClient(MONGODB_URI)
db = client.twitter_sentiment

# Initialize sentiment analyzers
vader = SentimentIntensityAnalyzer()

print(f"✅ MongoDB connection successful")
print(f"Starting Twitter sentiment analysis worker...")
print(f"MongoDB: {MONGODB_URI.split('@')[1] if '@' in MONGODB_URI else 'configured'}")
print(f"Twitter API: {'configured' if TWITTER_BEARER_TOKEN != 'YOUR_BEARER_TOKEN' else 'NOT CONFIGURED'}")

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
    elif final_score < -0.05:
        sentiment = 'negative'
    else:
        sentiment = 'neutral'
    
    return {
        'sentiment': sentiment,
        'score': final_score,
        'vader_score': compound_score,
        'textblob_score': textblob_score
    }

def ensure_string_ids(data):
    """Convert any numeric IDs to strings to avoid BigInt issues"""
    if isinstance(data, dict):
        for key, value in data.items():
            if key == 'id' and not isinstance(value, str):
                data[key] = str(value)
            elif isinstance(value, (dict, list)):
                ensure_string_ids(value)
    elif isinstance(data, list):
        for item in data:
            ensure_string_ids(item)
    return data

def store_tweet(tweet_data):
    try:
        # Ensure IDs are strings
        tweet_data = ensure_string_ids(tweet_data)
        
        # Check if tweet already exists
        existing = db.tweets.find_one({"id": tweet_data["id"]})
        if existing:
            return False
            
        # Insert tweet data into MongoDB
        db.tweets.insert_one(tweet_data)
        print(f"Stored tweet: {tweet_data['id']} - {tweet_data['sentiment']}")
        return True
    except Exception as e:
        print(f"Error storing tweet: {e}")
        return False

def get_stream_config():
    try:
        # Get stream configuration from MongoDB
        config = db.stream_config.find_one({"id": 1})
        if config:
            return {
                'search_term': config.get('search_term'),
                'is_active': config.get('is_active', False)
            }
        return None
    except Exception as e:
        print(f"Error getting stream config: {e}")
        return None

def fetch_recent_tweets(search_term, max_results=10):
    """Fetch recent tweets using search API instead of streaming"""
    try:
        print(f"Fetching recent tweets for: {search_term}")
        client = tweepy.Client(bearer_token=TWITTER_BEARER_TOKEN)
        
        # Get tweets from the last hour
        start_time = datetime.utcnow() - timedelta(hours=1)
        
        # Search for tweets
        response = client.search_recent_tweets(
            query=search_term,
            max_results=max_results,
            tweet_fields=['created_at', 'author_id', 'text']
        )
        
        if not response.data:
            print("No tweets found")
            return []
            
        print(f"Found {len(response.data)} tweets")
        
        processed_tweets = []
        for tweet in response.data:
            # Process the tweet
            tweet_data = {
                'id': str(tweet.id),
                'text': tweet.text,
                'username': str(tweet.author_id),  # Convert to string to avoid BigInt issues
                'created_at': tweet.created_at.isoformat(),
            }
            
            # Analyze sentiment
            sentiment_result = analyze_sentiment(tweet.text)
            tweet_data.update({
                'sentiment': sentiment_result['sentiment'],
                'sentiment_score': sentiment_result['score']
            })
            
            # Store in database
            if store_tweet(tweet_data):
                processed_tweets.append(tweet_data)
        
        return processed_tweets
        
    except Exception as e:
        print(f"Error fetching tweets: {e}")
        return []

def main():
    print("Initializing Twitter sentiment analysis worker...")
    
    # Ensure the stream_config collection exists with default document
    if db.stream_config.count_documents({}) == 0:
        db.stream_config.insert_one({
            "id": 1,
            "is_active": False
        })
    
    last_fetch_time = datetime.now() - timedelta(minutes=5)  # Start by fetching immediately
    consecutive_errors = 0
    
    while True:
        try:
            # Check if stream should be active
            config = get_stream_config()
            
            if config and config['is_active'] and config['search_term']:
                print(f"Active stream for: {config['search_term']}")
                
                # Only fetch if enough time has passed
                current_time = datetime.now()
                time_since_last_fetch = (current_time - last_fetch_time).total_seconds()
                
                # Adjust fetch interval based on consecutive errors (rate limiting)
                fetch_interval = 30  # Base interval: 30 seconds
                if consecutive_errors > 0:
                    # Exponential backoff with jitter
                    fetch_interval = min(300, 30 * (2 ** consecutive_errors) + random.randint(1, 30))
                    print(f"Rate limit backoff: waiting {fetch_interval} seconds before next fetch")
                
                if time_since_last_fetch >= fetch_interval:
                    success = False
                    try:
                        tweets = fetch_recent_tweets(config['search_term'], max_results=10)
                        if tweets:
                            consecutive_errors = 0
                            success = True
                    except Exception as e:
                        consecutive_errors += 1
                        print(f"Error fetching tweets: {e}")
                    
                    last_fetch_time = current_time
            
            # Sleep before checking again
            time.sleep(5)
            
        except Exception as e:
            print(f"Error in main loop: {e}")
            time.sleep(10)  # Sleep longer on error

if __name__ == "__main__":
    main()

